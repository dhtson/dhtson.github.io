#!/usr/bin/env python3
import subprocess
from pathlib import Path

BINARY = Path("./glyphs")
FLAG = 'uiuctf{oRig1naLLy_7HiS_W4s_gonna_be_moR3_FoCU53d_0N_the_GLYpH_p4rt_BU7_1_f3LL_d0WN_7h3_l4mbD4_c4lc_R4bb1t_H0Le_s0_H3r3_w3_4r3_noW_41n7_7H47_gr3at}'
ACCEPTED_FILLER = 'XAActAAoRig1naLLy_7HiAAW4s_gonna_be_moR3_FoCU53d_0N_the_GAAAA_p4rt_BU7_AAf3AA_d0WN_7h3_AAmbD4_c4lc_R4AAAA_H0Le_AA_HAA3_w3AAr3_noW_4AA7_7H47_gAAat}'

for candidate in [FLAG, ACCEPTED_FILLER]:
    out = subprocess.check_output([str(BINARY), candidate], timeout=5)
    print(len(candidate), out.decode().strip())
