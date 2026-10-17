# Solve one output group (diagonal) of k6 using 2 bitmaps, 4 InvMC rows and key-schedule relations.
import sys, time, json
GARGS = list(sys.argv)
sys.argv = ['x', 'lib']
exec(open('/mnt/d/WSL_Ubuntu/cscv/work/c03/sq6b.py').read().split("if __name__ == '__main__'")[0])
D = '/mnt/d/WSL_Ubuntu/cscv/work/c03/'
S = list(SBOX); SI = [0]*256
for i, v in enumerate(S): SI[v] = i
g = int(GARGS[1])
known = json.load(open(D + 'k6_known.json'))          # {"pos": val}
kb = {int(k): v for k, v in known.items()}
w20 = [0xb9, 0xba, 0xbf, 0x16]

def alive_for_k1(k1):
    """returns cupy bool array over (k0,k2,k3) [2^24] satisfying the group's key-schedule relation, or None if k1 invalid"""
    a = cp.zeros((256, 256, 256), dtype=cp.bool_)
    if g == 0:   # validation: k1 must equal known b13
        if k1 != kb[13]: return None
        a[:, :, :] = True
    elif g == 1:   # k1=b1 = 0xba ^ S(b14 ^ b10), k2=b14
        k2 = SI[k1 ^ w20[1]] ^ kb[10]
        a[:, k2, :] = True
    elif g == 2: # k2=b2 = 0xbf ^ S(b15 ^ b11), k3=b15
        for k3 in range(256): a[:, w20[2] ^ S[k3 ^ kb[11]], k3] = True
    elif g == 3: # k1=b9 known; k3=b3 = 0x16 ^ S(b12 ^ b8), k0=b12
        if k1 != kb[9]: return None
        if 8 in kb:
            for k0 in range(256): a[k0, :, w20[3] ^ S[k0 ^ kb[8]]] = True
        else:
            a[:, :, :] = True
    return a.reshape(-1)

paths = [D + 'bm0.bt', D + 'bm1.bt'] if g == 0 else [D + f'g{g}_s0.bt', D + f'g{g}_s1.bt']
Gs = [tables(r) for r in range(4)]
MB = mbtable()
Ps = [cp.asarray(load_bm(p)) for p in paths]
A1 = cp.empty(1 << 27, dtype=cp.uint32); A2 = cp.empty(1 << 27, dtype=cp.uint32); M = cp.empty(1 << 27, dtype=cp.uint32)
Mv = M.reshape(-1, 8)
log = open(D + f'group{g}.log', 'a', buffering=1)
found = []
k1s = [kb[9]] if g == 3 else ([kb[13]] if g == 0 else range(256))
t0 = time.time()
for k1 in k1s:
    alive = alive_for_k1(k1)
    if alive is None: continue
    for r in range(4):
        Mv[:] = (alive.astype(cp.uint32) * cp.uint32(0xffffffff))[:, None]
        for P in Ps:
            kA((65536,), (256,), (P, A1, Gs[r], np.int32(k1)), shared_mem=SH_A)
            kB((65536,), (256,), (A1, A2, Gs[r]), shared_mem=SH_B)
            kCD((65536,), (256,), (A2, M, Gs[r], MB, np.int32(0)), shared_mem=SH_CD)
        alive &= cp.any(Mv != 0, axis=1)
        if not bool(alive.any()): break
    idx = cp.asnumpy(cp.nonzero(alive)[0])
    for key in idx:
        k0, k2, k3 = int(key) >> 16, (int(key) >> 8) & 255, int(key) & 255
        found.append((k0, k1, k2, k3))
    log.write(f'{time.strftime("%H:%M:%S")} g{g} k1={k1:#04x} t={time.time()-t0:.0f}s found={found}\n')
log.write(f'DONE g{g} {found}\n')
print('FOUND', found)
