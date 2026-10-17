# Brute-force worker: worker.py HOST PORT CANDFILE WID NW DEADLINE_EPOCH OUTFILE
# Tests candidates idx % NW == WID that are not yet in done.txt; marks done only on a clean 0x96 reject.
import sys, time, os
_a = list(sys.argv)
sys.argv = [_a[0], _a[1], _a[2], '/dev/null']
exec(open('/mnt/d/WSL_Ubuntu/cscv/work/rev01/live.py').read().split("if __name__ == '__main__':")[0])
CF, WID, NW, DL, OUT = _a[3], int(_a[4]), int(_a[5]), float(_a[6]), _a[7]
D = '/mnt/d/WSL_Ubuntu/cscv/work/rev01/'
done = set()
if os.path.exists(D + 'done.txt'):
    done = set(l.strip() for l in open(D + 'done.txt'))
cands = [l.strip() for l in open(CF) if l.strip()]
with open(OUT, 'a') as lg, open(D + 'done.txt', 'a') as dn:
    for i, line in enumerate(cands):
        if i % NW != WID or line in done: continue
        if time.time() > DL or os.path.exists(D + 'HIT.txt'): break
        p = line.split()
        c = (int(p[0], 16), int(p[1], 16), int(p[2], 16), int(p[3]), p[4] if len(p) > 4 else '')
        try:
            ev, PT, ob = live_one(c, save_prefix=D + 'payload_%s' % line.replace(' ', '_'))
        except Exception as e:
            lg.write('ERR %s %r\n' % (line, e)); lg.flush(); continue
        types = [x[1][0] for x in PT if len(x[1]) == 7]
        if len(types) >= 2 and types[0] == 0xa7 and types[-1] == 0x96 and all(t in (0xa7, 0x96) for t in types):
            dn.write(line + '\n'); dn.flush()
        elif types and any(t not in (0xa7, 0x96) for t in types):
            msg = 'HIT %s types=%s ev=%s ocl=%d PT=%s' % (line, [hex(t) for t in types], ev, len(ob), [(x[0], x[1][:64].hex()) for x in PT])
            lg.write(msg + '\n'); lg.flush()
            open(D + 'HIT.txt', 'a').write(msg + '\n')
            break
        else:
            lg.write('ODD %s types=%s ev=%s\n' % (line, [hex(t) for t in types], ev[-3:])); lg.flush()
