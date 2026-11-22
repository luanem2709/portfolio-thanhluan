"""Chuyển ảnh trong assets/ sang WebP (kèm bản -sm cho màn hình nhỏ).

Chạy:  python tools/build_images.py
Ảnh gốc (jpg/png/gif) nằm trong assets-src/; WebP xuất ra assets/.
"""
import os
from PIL import Image, ImageOps, ImageSequence

A = 'assets'      # nơi xuất WebP
S = 'assets-src'  # ảnh gốc
# tên file -> (cạnh dài tối đa bản lớn, rộng tối đa bản -sm hoặc None)
STATIC = {
    'avatar.jpg': (240, None),
    'profile.jpg': (800, 480),
    'blog-cskh-game.jpg': (1280, 720),
    'blog-dev-tips.jpg': (1280, 720),
    'blog-discord-bot.jpg': (1280, 720),
    'blog-nodejs.jpg': (1280, 720),
    'blog-tiktok-analytics.jpg': (1280, 720),
    'cert1.jpg': (1000, 720),
    'cert5.jpg': (900, 720),
    'cert6.jpg': (1280, 720),
    'cisco-js1.jpg': (1100, 720),
    'cisco-js2.jpg': (1100, 720),
    'cisco-networking.jpg': (1100, 720),
    'hutech-hackathon-2025.jpg': (1000, 640),
    'hyundai-marketing.jpg': (927, 640),
    'hyundai-web.jpg': (640, None),
    'mola-experience.jpg': (480, None),
    'project3.jpg': (480, None),
    'project4.jpg': (713, 480),
    'funnygame-logo.png': (240, None),
}
total_old = total_new = 0
for name, (big, small) in STATIC.items():
    src = os.path.join(S, name)
    base = os.path.splitext(name)[0]
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        has_alpha = im.mode in ('RGBA', 'LA', 'P')
        im = im.convert('RGBA' if has_alpha else 'RGB')
        w, h = im.size
        def save(img, dst, q):
            img.save(dst, 'WEBP', quality=q, method=6)
            return os.path.getsize(dst)
        scale = min(1.0, big / max(w, h))
        large = im.resize((round(w * scale), round(h * scale)), Image.Resampling.LANCZOS) if scale < 1 else im
        n = save(large, os.path.join(A, base + '.webp'), 80)
        line = f'{name:28s} {os.path.getsize(src):8d} -> {base}.webp {n:7d} ({large.size[0]}x{large.size[1]})'
        total_new += n
        if small and large.size[0] > small:
            sm = large.resize((small, round(large.size[1] * small / large.size[0])), Image.Resampling.LANCZOS)
            m = save(sm, os.path.join(A, base + '-sm.webp'), 78)
            line += f' | -sm {m:7d} ({sm.size[0]}x{sm.size[1]})'
        total_old += os.path.getsize(src)
        print(line)

# GIF động -> WebP động
GIFS = {'project1.gif': 426, 'project2.gif': 426, 'project3.gif': 400}
for name, maxw in GIFS.items():
    src = os.path.join(S, name)
    base = os.path.splitext(name)[0]
    frames, durs = [], []
    with Image.open(src) as im:
        for fr in ImageSequence.Iterator(im):
            durs.append(fr.info.get('duration', 60) or 60)
            frames.append(fr.convert('RGBA').copy())
    # giảm số khung nếu quá dài
    step = 2 if len(frames) > 80 else 1
    kept = [frames[i] for i in range(0, len(frames), step)]
    kd = [sum(durs[i:i + step]) for i in range(0, len(frames), step)]
    w, h = kept[0].size
    if w > maxw:
        kept = [f.resize((maxw, round(h * maxw / w)), Image.Resampling.LANCZOS) for f in kept]
    dst = os.path.join(A, base + '-anim.webp')
    kept[0].save(dst, 'WEBP', save_all=True, append_images=kept[1:], duration=kd, loop=0, quality=55, method=4)
    print(f'{name:28s} {os.path.getsize(src):8d} -> {base}-anim.webp {os.path.getsize(dst):7d} ({kept[0].size[0]}x{kept[0].size[1]}, {len(kept)} frames)')
print('static total', total_old, '->', total_new)