#!/usr/bin/env python3
# usage: python3 solve.py ./checksum
import re, subprocess, sys
from collections import Counter

sys.setrecursionlimit(100000)
binary = sys.argv[1] if len(sys.argv) > 1 else "./checksum"
asm = subprocess.run(["objdump", "-dC", "-M", "intel", "--no-show-raw-insn", binary],
                     capture_output=True, text=True).stdout

# 1. parse every checksum_<sha1>_ function into (xor constants, children)
funcs, cur = {}, None
for line in asm.splitlines():
    m = re.match(r"^[0-9a-f]+ <checksum::checksum_([0-9a-f]{40})_>:", line)
    if m:
        cur = funcs.setdefault(m.group(1), {"own": 0, "kids": []})
        continue
    if not line.strip():
        cur = None
    if cur is None:
        continue
    if m := re.search(r"xor\s+BYTE PTR \[r(?:di|bx)\],(0x[0-9a-f]+)", line):
        cur["own"] ^= int(m.group(1), 16)
    elif re.search(r"\tnot\s+BYTE PTR", line):
        cur["own"] ^= 0xFF
    elif m := re.search(r"(?:call|jmp)\s+[0-9a-f]+ <checksum::checksum_([0-9a-f]{40})_>", line):
        cur["kids"].append(m.group(1))

# 2. roots = generated functions nobody calls (one per variable, FLAG included)
indeg = Counter(k for f in funcs.values() for k in f["kids"])
roots = [n for n in funcs if indeg[n] == 0]

def preorder(n, out):
    out.append(funcs[n]["own"])
    for k in funcs[n]["kids"]:
        preorder(k, out)
    return out

# 3. prefix XOR over the preorder walk; each 161/162-node block XORs to one char
PRINTABLE = set(range(0x21, 0x7F))

def decode(n):
    seq = preorder(n, [])
    P = [0]
    for c in seq:
        P.append(P[-1] ^ c)
    N, res = len(seq), []
    def go(b, s):
        if b == N:
            res.append(s)
            return
        rem = N - b
        for L in (161, 162) if rem > 162 else (rem,):
            if (P[b + L] ^ P[b]) in PRINTABLE:
                go(b + L, s + chr(P[b + L] ^ P[b]))
    go(0, "")
    return P[-1], res

for r in roots:
    chk, cands = decode(r)
    flags = [c for c in cands if re.fullmatch(r"FortID\{[0-9A-Za-z_]+\}", c)]
    print(f"root {r[:8]}  checksum={chk:02x}  decodings={len(cands)}")
    for c in (flags or cands)[:8]:
        print("   ", c)
