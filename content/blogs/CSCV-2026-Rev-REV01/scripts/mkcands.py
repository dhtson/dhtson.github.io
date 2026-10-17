# Candidate list: Iris Xe devices from NEO devices_base.inl, IP from NEO platforms.h, EU 96/80, scraped driver versions.
import re
DEVS = [  # (dev, ip) ordered roughly by popularity
    (0x9A49, 0x03000000), (0x46A6, 0x0300C000), (0xA7A0, 0x0300C000), (0x46A8, 0x0300C000),
    (0xA7A1, 0x0300C000), (0x9A40, 0x03000000), (0x46AA, 0x0300C000), (0x4908, 0x03028000),
    (0x4905, 0x03028000), (0x4909, 0x03028000)]
CUS = [96, 80]
drv = sorted(set(l.strip() for l in open('/mnt/d/WSL_Ubuntu/cscv/work/rev01/ref/drv_scraped.txt') if l.strip()),
             key=lambda v: [int(x) for x in v.split('.')], reverse=True)
with open('/mnt/d/WSL_Ubuntu/cscv/work/rev01/cands.txt', 'w') as f:
    for d in drv:
        for dev, ip in DEVS:
            for cu in CUS:
                f.write('8086 %04X %08X %d %s\n' % (dev, ip, cu, d))
print(len(drv), 'drivers ->', len(drv) * len(DEVS) * len(CUS), 'candidates')
