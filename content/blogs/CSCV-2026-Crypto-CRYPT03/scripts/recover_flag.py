#!/usr/bin/env python3
# Last step of the solve: 13 bytes of the round-6 key came out of the integral attack, k6[2] follows from
# the key schedule once k6[15] is fixed, and k6[5], k6[15] are brute-forced against the known pair E(0).
# Needs aes.py from the challenge attachment next to this file.
import sys
from aes import AES6, crypt, SBOX, RCON

K6 = {0: 0x41, 13: 0x16, 10: 0x66, 7: 0x96,          # group 0
      9: 0x3b,                                          # key-schedule relation, row 0
      12: 0xd8, 6: 0x2c, 3: 0x80, 8: 0xed,             # group 3 (+ row 3 relation for k6[8])
      4: 0x5a, 1: 0x57, 14: 0x35, 11: 0xe5}            # group 1
NONCE = bytes.fromhex('80e5faeca1828e3c')
FLAG_CT = bytes.fromhex('57e00d56e9822cbbdaaacadf94de6574cb141679a2995e1ec744c9668cdc9fcc94985718a3322587ba1ab69a8d76878798a9')
E0 = bytes.fromhex('5d3d1ede1baef0f9beb46d8ea6256283')

def master_from_k6(k6):
    w = [None] * 28
    for c in range(4):
        w[24 + c] = list(k6[4 * c:4 * c + 4])
    for i in range(27, 3, -1):                      # w[i-4] = w[i] ^ f(w[i-1])
        t = w[i - 1][:]
        if i % 4 == 0:
            t = [SBOX[x] for x in t[1:] + t[:1]]
            t[0] ^= RCON[i // 4]
        w[i - 4] = [a ^ b for a, b in zip(w[i], t)]
    return bytes(sum(w[0:4], []))

for b15 in range(256):
    b2 = 0xbf ^ SBOX[b15 ^ K6[11]]                  # row 2: k6[2] = w20[2] ^ S(k6[15] ^ k6[11]), w20[2] = 0xbf
    for b5 in range(256):
        k6 = bytearray(16)
        for i, v in K6.items():
            k6[i] = v
        k6[15], k6[2], k6[5] = b15, b2, b5
        key = master_from_k6(bytes(k6))
        if AES6(key).encrypt_block(bytes(16)) == E0:
            print('key', key.hex(), 'k6', bytes(k6).hex())
            print(crypt(FLAG_CT, key, NONCE))
            sys.exit(0)
print('no key found')
