from PIL import Image, ImageDraw, ImageFont
import glob, sys
lines = open(sys.argv[1]).read().rstrip().expandtabs(8).splitlines()
fp = sorted(p for p in glob.glob('/usr/share/fonts/**/*Mono*.ttf', recursive=True) if 'Bold' not in p and 'Oblique' not in p)
f = ImageFont.truetype(fp[0], 18)
W = max(int(f.getlength(l)) for l in lines) + 60
H = len(lines) * 26 + 70
im = Image.new('RGB', (W, H), (30, 30, 36))
d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, 32], fill=(48, 48, 56))
for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
    d.ellipse([14 + i * 22, 10, 26 + i * 22, 22], fill=c)
title = 'dhtson@wsl: ~/fortid/checksum'
d.text(((W - f.getlength(title)) // 2, 7), title, font=f, fill=(170, 170, 180))
y = 48
for l in lines:
    col = (220, 220, 220)
    if 'FortID{cH3ck5um_1s_n0t_s3cur3}' in l or l.strip() == 'dog' or l == '0x39':
        col = (110, 230, 120)
    if l.startswith('$'):
        col = (120, 200, 255)
    d.text((24, y), l, font=f, fill=col)
    y += 26
im.save(sys.argv[2])
print(fp[0], im.size)
