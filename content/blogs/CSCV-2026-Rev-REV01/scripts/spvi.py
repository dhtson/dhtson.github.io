# Minimal SPIR-V (OpenCL kernel subset) interpreter: one work-group of 32 lanes in lockstep at
# subgroup shuffles / barriers. Parses spirv-dis text output.
import re, sys

class Ptr:
    __slots__ = ('reg', 'off')
    def __init__(s, reg, off): s.reg = reg; s.off = off
    def __repr__(s): return 'Ptr(%d,%d)' % (id(s.reg) % 1000, s.off)

class Module:
    def __init__(s, path):
        s.types = {}; s.consts = {}; s.funcs = {}; s.entries = {}; s.globals = {}; s.names = {}
        cur = None
        for ln in open(path):
            ln = ln.split(';')[0].strip() if not ln.lstrip().startswith('%') or '"' not in ln else ln.strip()
            if not ln: continue
            m = re.match(r'(%[\w.]+)\s*=\s*(Op\w+)\s*(.*)$', ln)
            if m: res, op, rest = m.groups()
            else:
                res = None; p = ln.split(None, 1); op = p[0]; rest = p[1] if len(p) > 1 else ''
            args = rest.split()
            if op == 'OpEntryPoint':
                s.entries[args[2].strip('"')] = args[1]; continue
            if op.startswith('OpType'):
                s.types[res] = (op, args); continue
            if op == 'OpConstant': s.consts[res] = int(args[1]); continue
            if op == 'OpConstantTrue': s.consts[res] = True; continue
            if op == 'OpConstantFalse': s.consts[res] = False; continue
            if op == 'OpConstantNull': s.consts[res] = 0; continue
            if op == 'OpFunction':
                cur = {'name': res, 'params': [], 'code': [], 'labels': {}}
                s.funcs[res] = cur; continue
            if op == 'OpFunctionEnd': cur = None; continue
            if cur is None:
                if op == 'OpVariable': s.globals[res] = (args[0], args[1])
                continue
            if op == 'OpFunctionParameter': cur['params'].append(res); continue
            if op == 'OpLabel': cur['labels'][res] = len(cur['code']); continue
            cur['code'].append((res, op, args))
    def width(s, t):
        k, a = s.types[t]
        if k == 'OpTypeInt': return int(a[0])
        if k == 'OpTypeBool': return 1
        return 64
    def size(s, t):  # in cells
        k, a = s.types[t]
        if k == 'OpTypeArray': return s.consts[a[1]] * s.size(a[0])
        if k == 'OpTypeVector': return int(a[1]) * s.size(a[0])
        return 1
    def pointee(s, t): return s.types[t][1][1]

def run_group(M, kname, bufs, nlanes=32):
    """bufs: list of python lists (uint cells) for the 3 kernel args. Returns bufs (mutated)."""
    ent = M.entries[kname]
    shared = {}
    for g, (pt, sc) in M.globals.items():
        if sc == 'Workgroup': shared[g] = [0] * M.size(M.pointee(pt))
    argptrs = [Ptr(b, 0) for b in bufs]

    def val(env, x):
        if x in env: return env[x]
        if x in M.consts: return M.consts[x]
        if x in shared: return Ptr(shared[x], 0)
        if x == '%gl_LocalInvocationID': return env['%%lid']
        raise KeyError(x)

    def call(fid, actuals, lid):
        F = M.funcs[fid]
        env = {'%%lid': ('LID', lid)}
        for p, a in zip(F['params'], actuals): env[p] = a
        code = F['code']; pc = 0
        while True:
            res, op, a = code[pc]; pc += 1
            if op == 'OpVariable':
                pt = a[0]; env[res] = Ptr([0] * M.size(M.pointee(pt)), 0)
            elif op == 'OpLoad':
                p = val(env, a[1])
                if isinstance(p, tuple) and p[0] == 'LID': env[res] = [p[1], 0, 0]
                else: env[res] = p.reg[p.off]
            elif op == 'OpStore':
                p = val(env, a[0]); p.reg[p.off] = val(env, a[1])
            elif op == 'OpInBoundsPtrAccessChain' or op == 'OpPtrAccessChain' or op == 'OpAccessChain' or op == 'OpInBoundsAccessChain':
                rt, base = a[0], val(env, a[1]); idxs = [val(env, x) for x in a[2:]]
                t = M.pointee(rt)  # result pointee; walk from base pointee
                bt = None
                # find base pointee type via result-type chain: recompute from base pointer's declared type
                bt = env.get('%%t' + a[1]) or M_types_of.get(a[1])
                off = base.off
                if op in ('OpInBoundsPtrAccessChain', 'OpPtrAccessChain'):
                    off += idxs[0] * M.size(bt); idxs = idxs[1:]
                ct = bt
                for ix in idxs:
                    k, ta = M.types[ct]
                    ct = ta[0]; off += ix * M.size(ct)
                env[res] = Ptr(base.reg, off)
            elif op == 'OpCompositeExtract':
                env[res] = val(env, a[1])[int(a[2])]
            elif op in BIN:
                w = M_w.get(a[1], 32) if op in CMP else M.width(a[0]); x = val(env, a[1]); y = val(env, a[2])
                env[res] = BIN[op](x, y, w)
            elif op == 'OpUConvert':
                env[res] = val(env, a[1]) & ((1 << M.width(a[0])) - 1)
            elif op == 'OpSConvert':
                v = val(env, a[1]); sw = M_width_of(a[1], env)
                if v >> (sw - 1) & 1: v -= 1 << sw
                env[res] = v & ((1 << M.width(a[0])) - 1)
            elif op == 'OpSelect':
                env[res] = val(env, a[2]) if val(env, a[1]) else val(env, a[3])
            elif op == 'OpExtInst':
                fn = a[2]; w = M.width(a[0])
                if fn == 'rotate':
                    x = val(env, a[3]); n = val(env, a[4]) % w; m = (1 << w) - 1
                    env[res] = ((x << n) | (x >> (w - n))) & m if n else x
                else: raise NotImplementedError(fn)
            elif op == 'OpFunctionCall':
                r = yield from call(a[1], [val(env, x) for x in a[2:]], lid)
                if res: env[res] = r
            elif op == 'OpReturn': return None
            elif op == 'OpReturnValue': return val(env, a[0])
            elif op == 'OpBranch': pc = F['labels'][a[0]]
            elif op == 'OpBranchConditional':
                pc = F['labels'][a[1] if val(env, a[0]) else a[2]]
            elif op in ('OpSelectionMerge', 'OpLoopMerge'): pass
            elif op == 'OpControlBarrier':
                yield ('BAR', None)
            elif op == 'OpGroupNonUniformShuffle':
                env[res] = yield ('SHF', (res, val(env, a[2]), val(env, a[3]), 'idx'))
            elif op == 'OpGroupNonUniformShuffleXor':
                env[res] = yield ('SHF', (res, val(env, a[2]), val(env, a[3]), 'xor'))
            else:
                raise NotImplementedError(op)

    lanes = [call(ent, argptrs, i) for i in range(nlanes)]
    pend = [None] * nlanes; done = [False] * nlanes; sendv = [None] * nlanes
    first = True
    while not all(done):
        evs = []
        for i, g in enumerate(lanes):
            if done[i]: evs.append(None); continue
            try:
                ev = g.send(sendv[i]) if not first else next(g)
            except StopIteration:
                done[i] = True; ev = None
            evs.append(ev)
        first = False
        act = [e for e in evs if e is not None]
        if not act: break
        if len(act) != nlanes: raise RuntimeError('divergent sync: %d lanes' % len(act))
        kinds = {e[0] for e in act}
        if len(kinds) != 1: raise RuntimeError('mixed sync kinds')
        if act[0][0] == 'BAR':
            sendv = [None] * nlanes
        else:
            ids = {e[1][0] for e in act}
            if len(ids) != 1: raise RuntimeError('different shuffles %s' % ids)
            vals = [e[1][1] for e in evs]
            sendv = []
            for i, e in enumerate(evs):
                src = e[1][2] if e[1][3] == 'idx' else (i ^ e[1][2])
                sendv.append(vals[src % nlanes])
    return bufs

BIN = {
    'OpIAdd': lambda x, y, w: (x + y) & ((1 << w) - 1),
    'OpISub': lambda x, y, w: (x - y) & ((1 << w) - 1),
    'OpIMul': lambda x, y, w: (x * y) & ((1 << w) - 1),
    'OpUMod': lambda x, y, w: x % y,
    'OpSRem': lambda x, y, w: _srem(x, y, w),
    'OpBitwiseXor': lambda x, y, w: x ^ y,
    'OpBitwiseAnd': lambda x, y, w: x & y,
    'OpBitwiseOr': lambda x, y, w: x | y,
    'OpShiftLeftLogical': lambda x, y, w: (x << (y % w)) & ((1 << w) - 1),
    'OpShiftRightLogical': lambda x, y, w: x >> (y % w),
    'OpIEqual': lambda x, y, w: x == y,
    'OpINotEqual': lambda x, y, w: x != y,
    'OpULessThan': lambda x, y, w: x < y,
}
def _s(v, w): return v - (1 << w) if v >> (w - 1) & 1 else v
def _srem(x, y, w):
    a, b = _s(x, w), _s(y, w)
    r = abs(a) % abs(b); r = -r if a < 0 else r
    return r & ((1 << w) - 1)

CMP = {'OpIEqual','OpINotEqual','OpULessThan','OpSLessThan'}
M_types_of = {}
def M_width_of(x, env): return M_w.get(x, 32)
M_w = {}

def load(path):
    global M_types_of, M_w
    M = Module(path)
    # result-id -> type for pointer pointee lookup and widths (operand types needed by SConvert/SLessThan/SRem)
    rt = {}
    for g, (pt, sc) in M.globals.items(): rt[g] = pt
    rt['%gl_LocalInvocationID'] = None
    for c, v in M.consts.items(): pass
    for F in M.funcs.values():
        for res, op, a in F['code']:
            if res and a: rt[res] = a[0]
    # params types from function type
    for line in open(path):
        m = re.match(r'\s*(%[\w.]+)\s*=\s*OpFunctionParameter\s+(%[\w.]+)', line)
        if m: rt[m.group(1)] = m.group(2)
        m = re.match(r'\s*(%[\w.]+)\s*=\s*OpConstant\s+(%[\w.]+)', line)
        if m: rt[m.group(1)] = m.group(2)
    for k, t in rt.items():
        if t and t in M.types:
            if M.types[t][0] == 'OpTypePointer': M_types_of[k] = M.pointee(t)
            M_w[k] = M.width(t) if M.types[t][0] in ('OpTypeInt', 'OpTypeBool') else 64
    # signed compare needs operand width
    BIN['OpSLessThan'] = lambda x, y, w: _s(x, w) < _s(y, w)
    return M
M_w_cur = [32]
