"""Tạo bộ icon Font Awesome Free (subset) chỉ gồm các icon đang dùng.

Chạy lại sau khi thêm icon mới:  python tools/build_icons.py
Yêu cầu: pip install fonttools brotli, và các file gốc Font Awesome 6.5.0
(all.min.css, fa-solid-900.woff2, fa-brands-400.woff2, fa-regular-400.woff2)
đặt trong thư mục chỉ định bởi biến môi trường FA_SRC (mặc định %TEMP%/fa).

Font Awesome Free: icons CC BY 4.0, fonts SIL OFL 1.1, code MIT — https://fontawesome.com/license/free
"""
import glob, os, re, sys
from fontTools import subset
from fontTools.ttLib import TTFont

SRC = os.environ.get('FA_SRC') or os.path.join(os.environ.get('TEMP', '/tmp'), 'fa')
EXTRA_SOLID = ['fa-exclamation-circle', 'fa-exclamation-triangle', 'fa-info-circle', 'fa-check-circle', 'fa-xmark']

used = {}  # class -> set(prefix)
for f in glob.glob('**/*.html', recursive=True) + glob.glob('js/*.js') + glob.glob('*.js'):
    if f.startswith('.git') or f.startswith('dist'):
        continue
    t = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.finditer(r'\b(fas|far|fab)\s+((?:fa-[a-z0-9-]+\s*)+)', t):
        for c in m.group(2).split():
            used.setdefault(c, set()).add(m.group(1))
for c in EXTRA_SOLID:
    used.setdefault(c, set()).add('fas')
used.pop('fa-spin', None)

css = open(os.path.join(SRC, 'all.min.css'), encoding='utf-8').read()
cp = {}
for sel, code in re.findall(r'((?:\.fa-[a-z0-9-]+(?::before|::before)?,?)+)\{content:"\\([0-9a-f]+)"\}', css):
    for c in re.findall(r'\.(fa-[a-z0-9-]+)', sel):
        cp[c] = int(code, 16)

missing = [c for c in used if c not in cp]
if missing:
    sys.exit('Không tìm thấy mã icon cho: %s' % missing)

groups = {'fas': {}, 'far': {}, 'fab': {}}
for c, prefixes in used.items():
    p = 'fab' if 'fab' in prefixes else ('far' if 'far' in prefixes else 'fas')
    groups[p][c] = cp[c]

files = {'fas': 'fa-solid-900', 'far': 'fa-regular-400', 'fab': 'fa-brands-400'}
out_names = {'fas': 'fa-solid-subset', 'far': 'fa-regular-subset', 'fab': 'fa-brands-subset'}
for p, icons in groups.items():
    if not icons:
        continue
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = []
    opts.name_IDs = []
    opts.notdef_outline = False
    font = TTFont(os.path.join(SRC, files[p] + '.woff2'))
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=sorted(set(icons.values())))
    sub.subset(font)
    dst = os.path.join('assets', 'fonts', out_names[p] + '.woff2')
    font.flavor = 'woff2'
    font.save(dst)
    print(dst, os.path.getsize(dst), 'bytes,', len(icons), 'icons')

rules = []
for p in ('fas', 'far', 'fab'):
    for c, code in sorted(groups[p].items()):
        rules.append('.%s::before{content:"\\%x"}' % (c, code))

head = '''/*! Font Awesome Free 6.5.0 (subset) — https://fontawesome.com
 * Icons CC BY 4.0, Fonts SIL OFL 1.1, Code MIT. Tạo bởi tools/build_icons.py */
@font-face{font-family:"Font Awesome 6 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(../assets/fonts/fa-brands-subset.woff2) format("woff2")}
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:400;font-display:swap;src:url(../assets/fonts/fa-regular-subset.woff2) format("woff2")}
@font-face{font-family:"Font Awesome 6 Free";font-style:normal;font-weight:900;font-display:swap;src:url(../assets/fonts/fa-solid-subset.woff2) format("woff2")}
.fas,.far,.fab,.fa-solid,.fa-regular,.fa-brands{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto}
.fas,.far,.fa-solid,.fa-regular{font-family:"Font Awesome 6 Free"}
.fab,.fa-brands{font-family:"Font Awesome 6 Brands"}
.fas,.fa-solid{font-weight:900}
.far,.fab,.fa-regular,.fa-brands{font-weight:400}
.fa-spin{animation:fa-spin 2s infinite linear}
@keyframes fa-spin{0%{transform:rotate(0)}to{transform:rotate(1turn)}}
@media (prefers-reduced-motion:reduce){.fa-spin{animation-duration:.01ms}}
'''
open('css/icons.css', 'w', encoding='utf-8', newline='\n').write(head + '\n'.join(rules) + '\n')
print('css/icons.css', os.path.getsize('css/icons.css'), 'bytes')