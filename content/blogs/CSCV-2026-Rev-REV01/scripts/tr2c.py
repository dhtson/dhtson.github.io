# Trace compiler: record one execution of the keystream step f (0x140003A19) in unicorn and emit
# straight-line C (path and addresses are input independent - verified), then iterate natively.
exec(open('/mnt/d/WSL_Ubuntu/cscv/work/rev01/ksfast.py').read().split("if __name__")[0])
import capstone, struct
from capstone.x86 import *
md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_64); md.detail = True
FN = 0x140003a19
REGS64 = ['rax', 'rbx', 'rcx', 'rdx', 'rsi', 'rdi', 'rbp', 'rsp', 'r8', 'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15']
UCR = {r: getattr(x86_const, 'UC_X86_REG_' + r.upper()) for r in REGS64}
# record
tr = []; mem = []; entry = {}; snap = {}
started = [False]; depth = [0]
def hc(uc, a, sz, u):
    if a == FN and not started[0]:
        started[0] = True
        for r in REGS64: entry[r] = uc.reg_read(UCR[r])
    if started[0] and not snap.get('done'):
        tr.append(a)
def hm(uc, acc, addr, size, val, u):
    if started[0] and not snap.get('done'): mem.append((len(tr) - 1, acc == UC_MEM_WRITE, addr, size))
# snapshot regions before run
REG_STK = (STK, 0x200000); REG_CTX = (CTX, 0x10000); REG_IMG = (0x140e81000, 0x9000)
h1 = mu.hook_add(UC_HOOK_CODE, hc); h2 = mu.hook_add(UC_HOOK_MEM_READ | UC_HOOK_MEM_WRITE, hm)
STATE0 = 0x12345678
mu.mem_write(CTX, bytes(0x40) + struct.pack('<III', STATE0, 0, 0) + bytes(0x34))
mu.reg_write(UC_X86_REG_RSP, STK + 0x1f0000); mu.reg_write(UC_X86_REG_RBX, 1); mu.reg_write(UC_X86_REG_R12, OUTB)
init = {n: bytes(mu.mem_read(b, s)) for n, (b, s) in (('stk', REG_STK), ('ctx', REG_CTX), ('img', REG_IMG))}
mu.emu_start(DRV, DRV + len(code) - 1)
mu.hook_del(h1); mu.hook_del(h2)
# cut trace at the ret that leaves FN (back to DRV)
cache = {}
def ins(a):
    if a not in cache: cache[a] = next(md.disasm(bytes(mu.mem_read(a, 16)), a))
    return cache[a]
end = None
for i, a in enumerate(tr):
    if not (0x140000000 <= a < 0x140e8a000): end = i; break
tr = tr[:end]; mem = [m for m in mem if m[0] < end]
print('trace len', len(tr), 'mem accesses', len(mem))
maddr = {}
for i, w, a, s in mem: maddr.setdefault(i, []).append((w, a, s))
def region(a):
    for n, (b, s) in (('stk', REG_STK), ('ctx', REG_CTX), ('img', REG_IMG)):
        if b <= a < b + s: return '%s+0x%x' % (n, a - b)
    raise ValueError(hex(a))
SUB = {}  # sub-register map
for r in REGS64:
    SUB[r] = (r, 64)
for r64, r32, r16, r8 in [('rax', 'eax', 'ax', 'al'), ('rbx', 'ebx', 'bx', 'bl'), ('rcx', 'ecx', 'cx', 'cl'), ('rdx', 'edx', 'dx', 'dl'),
                          ('rsi', 'esi', 'si', 'sil'), ('rdi', 'edi', 'di', 'dil'), ('rbp', 'ebp', 'bp', 'bpl'), ('rsp', 'esp', 'sp', 'spl')] + \
                         [('r%d' % k, 'r%dd' % k, 'r%dw' % k, 'r%db' % k) for k in range(8, 16)]:
    SUB[r32] = (r64, 32); SUB[r16] = (r64, 16); SUB[r8] = (r64, 8)
MASK = {8: '0xffULL', 16: '0xffffULL', 32: '0xffffffffULL', 64: '0xffffffffffffffffULL'}
CT = {8: 'uint8_t', 16: 'uint16_t', 32: 'uint32_t', 64: 'uint64_t'}
out = []
def rget(name):
    r, w = SUB[name]
    return r if w == 64 else '(%s & %s)' % (r, MASK[w])
def rset(name, expr):
    r, w = SUB[name]
    if w == 64: return '%s = (uint64_t)(%s);' % (r, expr)
    if w == 32: return '%s = (uint64_t)(uint32_t)(%s);' % (r, expr)
    return '%s = (%s & ~%s) | ((uint64_t)(%s) & %s);' % (r, r, MASK[w], expr, MASK[w])
def mexpr(i, size, write=False):
    lst = maddr[i]
    a = [x for x in lst if x[0] == write] or lst
    return '(*(%s*)(%s))' % (CT[size * 8], region(a[0][1]))
def opval(i, op, insn):
    if op.type == X86_OP_REG: return rget(insn.reg_name(op.reg))
    if op.type == X86_OP_IMM: return '(%dULL & %s)' % (op.imm & 0xffffffffffffffff, MASK[op.size * 8])
    return '(uint64_t)' + mexpr(i, op.size)
def opset(i, op, insn, expr):
    if op.type == X86_OP_REG: return rset(insn.reg_name(op.reg), expr)
    return '%s = (%s)(%s);' % (mexpr(i, op.size, True), CT[op.size * 8], expr)
def leaexpr(insn, op):
    m = op.mem; parts = []
    if m.base:
        b = insn.reg_name(m.base)
        parts.append(('0x%xULL' % (insn.address + insn.size)) if b == 'rip' else rget(b))
    if m.index: parts.append('%s*%d' % (rget(insn.reg_name(m.index)), m.scale))
    parts.append('%dLL' % m.disp)
    return '(' + ' + '.join('(uint64_t)(%s)' % p for p in parts) + ')'
for i, a in enumerate(tr):
    insn = ins(a); mn = insn.mnemonic; ops = insn.operands
    w = ops[0].size * 8 if ops else 64
    M = MASK.get(w)
    if mn in ('mov', 'movabs'):
        out.append(opset(i, ops[0], insn, opval(i, ops[1], insn)))
    elif mn == 'movzx':
        out.append(opset(i, ops[0], insn, opval(i, ops[1], insn)))
    elif mn == 'lea':
        out.append(opset(i, ops[0], insn, leaexpr(insn, ops[1])))
    elif mn in ('add', 'sub', 'xor', 'and', 'or'):
        c = {'add': '+', 'sub': '-', 'xor': '^', 'and': '&', 'or': '|'}[mn]
        src = opval(i, ops[1], insn)
        if ops[1].type == X86_OP_IMM and ops[1].size < ops[0].size:  # sign-extended imm
            v = ops[1].imm & 0xffffffffffffffff; src = '(%dULL & %s)' % (v, M)
        out.append(opset(i, ops[0], insn, '(%s %s %s) & %s' % (opval(i, ops[0], insn), c, src, M)))
    elif mn == 'not':
        out.append(opset(i, ops[0], insn, '(~%s) & %s' % (opval(i, ops[0], insn), M)))
    elif mn == 'neg':
        out.append(opset(i, ops[0], insn, '(0 - %s) & %s' % (opval(i, ops[0], insn), M)))
    elif mn in ('inc', 'dec'):
        out.append(opset(i, ops[0], insn, '(%s %s 1) & %s' % (opval(i, ops[0], insn), '+' if mn == 'inc' else '-', M)))
    elif mn in ('shl', 'shr'):
        cnt = opval(i, ops[1], insn) if len(ops) > 1 else '1'
        sh = '(%s & %d)' % (cnt, 63 if w == 64 else 31)
        out.append(opset(i, ops[0], insn, '(%s %s %s) & %s' % (opval(i, ops[0], insn), '<<' if mn == 'shl' else '>>', sh, M)))
    elif mn == 'imul':
        if len(ops) == 2: e = '(%s * %s) & %s' % (opval(i, ops[0], insn), opval(i, ops[1], insn), M)
        elif len(ops) == 3: e = '(%s * (%dULL)) & %s' % (opval(i, ops[1], insn), ops[2].imm & 0xffffffffffffffff, M)
        else: raise NotImplementedError('imul1')
        out.append(opset(i, ops[0], insn, e))
    elif mn == 'push':
        out.append('rsp -= 8; %s = %s;' % (mexpr(i, 8, True), opval(i, ops[0], insn)))
    elif mn == 'pop':
        out.append('%s rsp += 8;' % rset(insn.reg_name(ops[0].reg), mexpr(i, 8)))
    elif mn == 'call':
        out.append('rsp -= 8; %s = 0x%xULL;' % (mexpr(i, 8, True), insn.address + insn.size))
    elif mn == 'ret':
        out.append('rsp += 8;' + (' rsp += %d;' % ops[0].imm if ops else ''))
    elif mn == 'leave':
        out.append('rsp = rbp; rbp = %s; rsp += 8;' % mexpr(i, 8))
    elif mn in ('cmp', 'test', 'jmp', 'ja', 'je', 'jne', 'jb', 'jbe', 'jae', 'jl', 'jg', 'jle', 'jge', 'js', 'jns', 'nop'):
        pass
    else:
        raise NotImplementedError(mn + ' ' + insn.op_str)
stk_used = max(a - STK for _, _, a, _ in mem if STK <= a < STK + 0x200000) + 8
hdr = ['#include <stdint.h>', '#include <stdio.h>', '#include <stdlib.h>', '#include <string.h>',
       'static uint8_t stk_m[0x200000], ctx_m[0x10000], img_m[0x9000];',
       '#define stk (stk_m)', '#define ctx (ctx_m)', '#define img (img_m)']
body = ['static void step(void){', ' uint64_t ' + ', '.join('%s=0x%xULL' % (r, entry[r]) for r in REGS64) + ';'] + ['  ' + l for l in out] + ['}']
main = r'''
int main(int argc, char **argv){
  FILE *f = fopen(argv[1], "rb"); fread(stk_m, 1, sizeof stk_m, f); fread(ctx_m, 1, sizeof ctx_m, f); fread(img_m, 1, sizeof img_m, f); fclose(f);
  uint32_t st = (uint32_t)strtoul(argv[2], 0, 16); long n = atol(argv[3]); int dump = argc > 4;
  memcpy(ctx_m + 0x40, &st, 4);
  for (long i = 0; i < n; i++) { step(); if (dump) { uint32_t s; memcpy(&s, ctx_m + 0x40, 4); putchar(s >> 24); } }
  uint32_t s; memcpy(&s, ctx_m + 0x40, 4); fprintf(stderr, "%08x\n", s);
  return 0;
}'''
D = '/mnt/d/WSL_Ubuntu/cscv/work/rev01/'
open(D + 'fstep.c', 'w').write('\n'.join(hdr + body) + main)
open(D + 'fstep_init.bin', 'wb').write(init['stk'] + init['ctx'] + init['img'])
print('C lines', len(out))
