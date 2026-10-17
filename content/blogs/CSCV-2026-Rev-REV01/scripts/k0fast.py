# Literal Python transliteration of kernel k0 (SPIR-V %16 + helpers), all 32 lanes at once.
U = 0xffffffff
def rot(x, n):
    n %= 32
    return ((x << n) | (x >> (32 - n))) & U if n else x
def h130(a, b):
    t = ((((a & b) << 1) & U) ^ U) + 1 & U
    v550 = ((a + b) & U) | t
    v560 = ((a + b) & U) & t
    return (v550 - (v560 ^ U) + U) & U
def h170(a, b):
    x = a ^ b; s = ((a & b) << 1) & U
    p = x | s; q = x & s
    v601 = (p | q) | (p & q)
    v636 = p & q & (p & q)
    return (v601 - (v636 ^ U) - 1) & U
def h792(x): return int.from_bytes(x.to_bytes(4, 'little'), 'big')
def h317(a, b, c): return a
def h351(a, b, c):
    v846 = rot(h130(a, (2779096485 + c * 73244475) & U), ((b + c) & U) % 31 + 1)
    v847 = h170(a | 1831565813, rot(v846 ^ ((b * 2654435761) & U), ((c * 3 + 5) & U) % 31 + 1))
    return h130(h170(v846, v847), h792(v846 ^ 3282421852))
def h293(p0, p1, p2, p3, p4):
    v646 = h130(p0 & p1, (p0 ^ U) & p2)
    v647 = (p0 & p1) | ((p0 ^ p1) & p2)
    c648, c649, c650, c651 = 2135587861, 2246822507, 461845907, 668265261
    v652 = (2654435761 * ((p4 + 1) & U)) & U
    v653 = h130(h130(v652, ((p3 + 1) * c648) & U), rot(p2, ((p4 + p3) & U) % 19 + 1))
    v654 = h317(v653, h351(v653 ^ p0, p3, p4), h170(p3 ^ p4, p2))
    v655 = h170(h170(p0, rot(p1, ((p3 + p4) & U) % 13 + 5)), v654)
    v656 = h317(v655, h170(h351(v655, p3 ^ 3, (p4 + 1) & U), v646), p1 ^ p2 ^ p3)
    v656 = h130(v656, rot(v646, ((p3 * 7 + p4) & U) % 23 + 1))
    v657 = h130(h130(c649, ((p4 + 1) * 16843009) & U), (p3 * c650) & U) | 1
    v658 = (v656 * v657) & U
    v659 = h351(v658 ^ v657, (p3 + 5) & U, p4 ^ 7)
    v656 = h317(v658, v659, h170(v647, p3 ^ p4))
    v660 = h130(v656, h792(h130(v647, rot(p2, ((p3 * 3 + p4) & U) % 29 + 1))))
    v661 = h170(rot(v660, ((p3 * 11 + p4 * 5) & U) % 31 + 1), (h130(v646, v647) * c651) & U)
    return h317(v661, h130(v661, h351(v661, p3, p4)), v646 ^ v647 ^ p2)

def k0(inp, key):
    # lane-0 key schedule into shared[26][32]
    sh = [[0] * 32 for _ in range(26)]
    k = list(key)
    v67 = h130(k[0], 2779096485)
    for i in range(26):
        v71 = (2654435761 * (i + 1)) & U
        for j in range(32):
            t = h170(h170(v67, k[(j + i) & 3]), v71)
            v67 = rot(t, ((j * 5 + i * 3) % 31) + 1)
            v67 = h130(v67, rot(k[(j * 3 + 1) & 3], ((j + i) % 29) + 1))
            sh[i][j] = v67
    L = range(32)
    v74 = [inp[l] for l in L]
    for r in range(26):
        v79 = [v74[(l + 31) & 31] for l in L]
        v80 = [v74[(l + 1) & 31] for l in L]
        v81 = [h130(v79[l], sh[r][(l + 3) & 31]) for l in L]
        v82 = [h170(v80[l], sh[r][(l + 11) & 31]) for l in L]
        v83 = [h293(h170(v74[l], sh[r][l]), v81[l], v82[l], l, r) for l in L]
        v84 = [h293(v82[l], v83[l], v81[l], (l ^ 13) & 31, r) for l in L]
        v74 = [h317(v83[l], v84[l], h170(l, r ^ v74[l])) for l in L]
        v85 = [v74[(l + 7) & 31] for l in L]
        v86 = [h130(h130(v74[l] >> 3, rot(v85[l], ((r + l) % 11) + 1)), h170((r * 40503) & U, l)) & 31 for l in L]
        v87 = [v74[v86[l]] for l in L]
        t356 = [h130(v87[l], h351(v74[l], l, r)) for l in L]
        v88 = [t356[(v86[l] ^ 9) & 31] for l in L]
        v87 = [h317(v87[l], v88[l], v74[l] ^ v86[l]) for l in L]
        v89 = [h130(v74[l], rot(v87[l], ((r + l) % 17) + 1)) for l in L]
        v89 = [h317(v89[l], h351(v89[l], l ^ 11, r), h170(v89[l], v87[l])) for l in L]
        v90 = [(h170(h170(v89[l], rot(v87[l], ((l * 5 + r) % 23) + 1)), (l * 11 + r * 17) & U) >> 2) & 31 for l in L]
        v91 = [v89[v90[l]] for l in L]
        t415 = [h130(v91[l], h351(v91[l], l, r)) for l in L]
        v92 = [t415[(v90[l] ^ 17) & 31] for l in L]
        v91 = [h317(v91[l], v92[l], (v90[l] + v89[l]) & U) for l in L]
        s434 = [v87[(l * 5 + r) & 31] for l in L]
        v93 = [h293(v89[l], v91[l], s434[l], l, r) for l in L]
        s446 = [v91[(l * 3 + r) & 31] for l in L]
        v94 = [h293(v91[l], v89[l], s446[l], l ^ 5, r) for l in L]
        v74 = [h317(v93[l], v94[l], v91[l] ^ v89[l] ^ l) for l in L]
        v95 = list(v74)
        for m in (16, 8, 4, 2, 1): v95 = [h130(v95[l], v95[l ^ m]) for l in L]
        v96 = list(v74)
        for m in (16, 8, 4, 2, 1): v96 = [h170(v96[l], v96[l ^ m]) for l in L]
        v74 = [h130(h170(v74[l], rot(v95[l], (r * 2 + l) % 31)), rot(v96[l], ((r * 3 + l * 7) % 31) + 1)) for l in L]
    return v74
