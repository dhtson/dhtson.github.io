# Full live client: emulated chall.exe protocol + fast keystream skip for the payload + SPIR-V kernels.
# usage: final.py HOST PORT
import sys, time, struct, socket, ssl, os
_a = list(sys.argv); sys.argv = [_a[0], _a[1], _a[2], '/dev/null']
D = '/mnt/d/WSL_Ubuntu/cscv/work/rev01/'
inj = open(D + 'inject.py').read()
inj = '\n'.join(l for l in inj.splitlines() if 'UC_HOOK_BLOCK' not in l)
exec(inj)
BYPASS[0] = False
sys.path.insert(0, D)
import spvi, k0fast
SPV = spvi.load(D + 'payload/k.spvasm')
HOST, PORT = _a[1], int(_a[2])
ART = (0x8086, 0x46A6, 0x0300C000, 80, '32.0.101.7088')
T0 = time.time()
def log(*x): print('[%6.1f]' % (time.time() - T0), *x, flush=True)

ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
sock = ctx.wrap_socket(socket.create_connection((HOST, PORT), timeout=60), server_hostname=HOST)
sock.settimeout(120)
def recvn(n):
    b = b''
    while len(b) < n:
        d = sock.recv(min(n - len(b), 1 << 20))
        if not d: return None
        b += d
    return b

for (a, n), d in zip(regions, snap): mu.mem_write(a, d)
heap_ptr[0] = hp
cst = []; rbufs = set(); PT = []
TK = {'ctx': None, 'resp': 0, 'n': None, 'stop': False}
def u32s(b): return list(struct.unpack('<32I', b))
def h(uc, addr, size, ud):
    rcx = uc.reg_read(UC_X86_REG_RCX); rdx = uc.reg_read(UC_X86_REG_RDX); r8 = uc.reg_read(UC_X86_REG_R8)
    r9 = uc.reg_read(UC_X86_REG_R9); rsp = uc.reg_read(UC_X86_REG_RSP)
    if addr in stubs:
        n = stubs[addr]
        if n == 'malloc': v = malloc(rcx)
        elif n == 'calloc': v = malloc(rcx * rdx); uc.mem_write(v, b'\0' * (rcx * rdx))
        elif n == 'memcpy': uc.mem_write(rcx, rd(rdx, r8)); v = rcx
        elif n == 'strlen': v = len(cstr(rcx))
        else:
            v = 0
            extra = ''
            try:
                if n == 'fwrite': extra = rd(rcx, min(rdx * r8, 4096))
                elif n in ('fprintf', 'vfprintf'): extra = cstr(rdx)[:400]
            except Exception as e: extra = repr(e)
            log('IMP', n, hex(rcx), hex(rdx), hex(r8), hex(r9), extra)
        ret(v); return
    if addr == RECV:
        if TK['n'] is not None and TK['resp'] >= TK['n'] and r8 == 7:
            TK['stop'] = True; log('takeover point'); uc.emu_stop(); return
        d = recvn(r8)
        if d is None: log('server closed'); uc.emu_stop(); return
        uc.mem_write(rdx, d); rbufs.add((rdx, r8)); log('RECV', r8); ret(1); return
    if addr == CRYPT:
        if (rdx, r8 & 0xffffffff) in rbufs: TK['rctx'] = rcx
        else: TK['sctx'] = rcx
        n = r8 & 0xffffffff
        if n == 7 and rd(rdx, 1)[0] == 0xe9 and (rdx, n) not in rbufs: TK['resp'] += 1
        if n > 4096 and (rdx, n) in rbufs:
            # fast path: generate n keystream bytes from the state word at ctx, decrypt, advance state, skip
            st = struct.unpack('<I', rd(rcx, 4))[0]
            log('fast keystream', n, 'from state %08x' % st)
            import subprocess, os
            pr = subprocess.run([os.path.expanduser('~/fstep'), D + 'fstep_init.bin', '%08x' % st, str(n), 'd'], capture_output=True)
            ks, st2 = pr.stdout, int(pr.stderr.strip(), 16)
            assert len(ks) == n
            ct = rd(rdx, n); pt = bytes(a ^ b for a, b in zip(ct, ks))
            uc.mem_write(rdx, pt); uc.mem_write(rcx, struct.pack('<I', st2))
            rbufs.discard((rdx, n)); PT.append(('S', pt)); log('fast done, state %08x' % st2, pt[:8].hex())
            ret(0); return
        cst.append((rdx, n)); return
    if addr == CRYPT_RET:
        if cst:
            b, n = cst.pop()
            if (b, n) in rbufs:
                rbufs.discard((b, n)); PT.append(('S', rd(b, n)))
                if n == 17: TK['n'] = rd(b, n)[16]
                log('S>C PT', n, rd(b, min(n, 160)).hex())
            else: log('C>S PT', n, rd(b, min(n, 160)).hex())
        return
    if addr == SEND:
        sock.sendall(rd(rdx, r8)); log('SEND', r8); ret(1); return
    if addr == OCL:
        a5 = rq(rsp + 0x28); a6 = rq(rsp + 0x30)
        if rdx == 0:
            log('OCL op0 (program load)', hex(r9)); ret(1); return
        kname = 'k0' if rdx == 1 else 'k1'
        inp = u32s(rd(r8, 128)); key = list(struct.unpack('<4I', rd(a5, 16))); out = [0] * 32
        if kname == 'k0':
            out = k0fast.k0(inp, key)
            if __import__('os').environ.get('CORRUPT') and key != list(struct.unpack('<4I', rd(pkey, 16))): out[0] ^= 1
        else: spvi.run_group(SPV, kname, [inp, key, out])
        uc.mem_write(a6, struct.pack('<32I', *out))
        log('OCL op%d %s in=%s key=%s out=%s' % (rdx, kname, rd(r8, 128).hex(), rd(a5, 16).hex(), struct.pack('<32I', *out).hex()))
        ret(1); return
    if addr == RET_ADDR:
        log('client returned', hex(uc.reg_read(UC_X86_REG_RAX))); uc.emu_stop(); return
ST['h'] = h
VEN, DEV, IPV, CU, DRV = ART; DRVb = DRV.encode(); L = min(len(DRVb), 0xaf)
gpustr = b'Intel(R) Iris(R) Xe Graphics::VEN_%04X::DEV_%04X::IP_%08X::DRV_%s::CU_%u' % (VEN, DEV, IPV, DRVb, CU)
buf70 = bytearray(0x1c0); struct.pack_into('<IIII', buf70, 0, VEN, DEV, IPV, CU); buf70[0x10] = L; buf70[0x11:0x11 + L] = DRVb[:L]
key = [struct.unpack('<I', rd(0x140e82000 + 4 * i, 4))[0] ^ 0x5a3c1e78 for i in range(4)]
p70 = malloc(0x200); mu.mem_write(p70, bytes(buf70)); pstr = malloc(0x200); mu.mem_write(pstr, gpustr + b'\0')
pkey = malloc(0x10); mu.mem_write(pkey, struct.pack('<4I', *key))
rsp = ((STACK + STACK_SZ - 0x10000) & ~0xf) - 0x48
mu.mem_write(rsp, struct.pack('<Q', RET_ADDR))
for off, v in ((0x28, OCL), (0x30, p70), (0x38, L + 0x11), (0x40, pstr), (0x48, pkey)): mu.mem_write(rsp + off, struct.pack('<Q', v))
mu.reg_write(UC_X86_REG_RSP, rsp); mu.reg_write(UC_X86_REG_RCX, 0x1234); mu.reg_write(UC_X86_REG_RDX, SEND)
mu.reg_write(UC_X86_REG_R8, RECV); mu.reg_write(UC_X86_REG_R9, 0)
try: mu.emu_start(0x1409e3bb3, 0, count=0)
except UcError as e: log('ERR', e, hex(mu.reg_read(UC_X86_REG_RIP)))

import json, subprocess, os
WT = {int(k): v for k, v in json.load(open(D + 'wtable_empty.json')).items()} if os.path.exists(D + 'wtable_empty.json') else {}
assert TK['stop'], 'no takeover'
SS = {'r': struct.unpack('<I', rd(TK['rctx'], 4))[0], 's': struct.unpack('<I', rd(TK['sctx'], 4))[0]}
log('ctx r %x s %x' % (TK['rctx'], TK['sctx']))
def ks(n, d):
    pr = subprocess.run([os.path.expanduser('~/fstep'), D + 'fstep_init.bin', '%08x' % SS[d], str(n), 'd'], capture_output=True)
    SS[d] = int(pr.stderr.strip(), 16); return pr.stdout
def xr(a, b): return bytes(p ^ q for p, q in zip(a, b))
def recv_msg(timeout=8):
    sock.settimeout(timeout)
    try: c = recvn(7)
    except Exception as e: return ('TIMEOUT', repr(e))
    if c is None: return ('CLOSED',)
    h_ = xr(c, ks(7, 'r')); t = h_[0]; n = struct.unpack('<I', h_[1:5])[0]; w = struct.unpack('<H', h_[5:7])[0]
    body = b''
    if 0 < n < 1 << 24:
        cb = recvn(n); body = xr(cb, ks(n, 'r')) if cb else b''
    return ('MSG', hex(t), n, hex(w), body[:200].hex())
def send_msg(t, body=b'', w=None):
    if w is None: w = WT[t]
    h_ = bytes([t]) + struct.pack('<I', len(body)) + struct.pack('<H', w)
    sock.sendall(xr(h_, ks(7, 's')))
    if body: sock.sendall(xr(body, ks(len(body), 's')))
log('takeover states', SS)
m = recv_msg(); log('S>', m)
PLAN = [int(x, 16) for x in os.environ.get('PLAN', '48').split(',')]
BODY = bytes.fromhex(os.environ.get('BODY', ''))
WB = int(os.environ['W'], 16) if os.environ.get('W') else None
for t in PLAN:
    send_msg(t, BODY, WB if BODY else None); log('C> type', hex(t), 'body', len(BODY))
    m = recv_msg(); log('S>', m)
    if m[0] != 'MSG': break
    while True:
        m2 = recv_msg(timeout=1.5)
        if m2[0] != 'MSG': break
        log('S> (extra)', m2)
