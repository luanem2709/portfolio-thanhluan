"""Tạo ảnh chia sẻ mạng xã hội assets/og-cover.jpg (1200x630). Chạy: python tools/build_og.py
Cần font Segoe UI (Windows) và assets-src/profile.jpg."""
from PIL import Image, ImageDraw, ImageFont, ImageOps
W, H = 1200, 630
bg = Image.new('RGB', (W, H), '#f5f9ff')
d = ImageDraw.Draw(bg)
for x in range(W):
    t = x / W
    d.line([(x, 0), (x, H)], fill=tuple(int(a + (b - a) * t) for a, b in zip((245, 249, 255), (186, 230, 253))))
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
od.ellipse((700, -140, 1340, 500), fill=(56, 189, 248, 60))
od.ellipse((-160, 380, 360, 900), fill=(3, 105, 161, 28))
bg = Image.alpha_composite(bg.convert('RGBA'), ov)
d = ImageDraw.Draw(bg)
F = 'C:/Windows/Fonts/'
bold = lambda s: ImageFont.truetype(F + 'segoeuib.ttf', s)
reg = lambda s: ImageFont.truetype(F + 'segoeui.ttf', s)
d.rounded_rectangle((80, 92, 470, 142), 25, fill=(224, 242, 254), outline=(147, 197, 253))
d.text((104, 100), 'Sẵn sàng nhận việc', font=bold(26), fill=(3, 105, 161))
d.text((80, 180), 'Nguyễn Thành Luân', font=bold(62), fill=(11, 31, 51))
d.text((80, 268), 'Software Engineer · Web & IT Specialist', font=bold(32), fill=(3, 105, 161))
for i, ln in enumerate(['Công nghệ Phần mềm — HUTECH (2026)', 'Thực tập IT HelpDesk & Quản trị Web', 'tại Hyundai Miền Nam']):
    d.text((80, 340 + i * 44), ln, font=reg(30), fill=(55, 81, 106))
d.text((80, 540), 'luanem2709.github.io/portfolio-thanhluan', font=bold(26), fill=(2, 132, 199))
p = ImageOps.fit(Image.open('assets-src/profile.jpg').convert('RGB'), (360, 360), Image.Resampling.LANCZOS, centering=(0.5, 0.2))
mask = Image.new('L', (360, 360), 0); ImageDraw.Draw(mask).ellipse((0, 0, 359, 359), fill=255)
ring = Image.new('RGBA', (392, 392), (0, 0, 0, 0)); ImageDraw.Draw(ring).ellipse((0, 0, 391, 391), fill=(255, 255, 255, 255), outline=(147, 197, 253), width=4)
bg.alpha_composite(ring, (762, 119))
bg.paste(p, (778, 135), mask)
bg.convert('RGB').save('assets/og-cover.jpg', 'JPEG', quality=86, optimize=True, progressive=True)