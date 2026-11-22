# Portfolio — Nguyễn Thành Luân

Website: https://luanem2709.github.io/portfolio-thanhluan/

Portfolio cá nhân của sinh viên Công nghệ Phần mềm (HUTECH 2026), từng thực tập IT HelpDesk & quản trị Web tại Công ty TNHH Ô tô Hyundai Miền Nam.

## Nội dung

- Trang chủ: giới thiệu, số liệu, dự án nổi bật, kinh nghiệm & học vấn, kỹ năng
- Về tôi / Dự án / Blog / Thành tựu / Liên hệ
- Blog: 6 bài viết về thực tập, Node.js, Discord Bot, CSKH và nội dung số

## Công nghệ

HTML, CSS, JavaScript thuần (không framework), giao diện trắng – xanh da trời, animation chỉ dùng `transform`/`opacity`, triển khai bằng GitHub Pages.

## Cấu trúc & công cụ

- `assets/` — ảnh WebP, font tự host (Be Vietnam Pro, Font Awesome subset) đã tối ưu
- `assets-src/` — ảnh gốc; chạy `python tools/build_images.py` để xuất lại WebP
- `tools/build_icons.py` — tạo lại bộ icon Font Awesome chỉ gồm icon đang dùng
- `.github/workflows/deploy-pages.yml` — triển khai GitHub Pages, tự nén CSS/JS khi build

## Chạy local

```bash
git clone https://github.com/luanem2709/portfolio-thanhluan.git
cd portfolio-thanhluan
python -m http.server 8000
```

Mở http://localhost:8000

## Liên hệ

- Email: nguyenthanhluan.270924@gmail.com
- GitHub: [@luanem2709](https://github.com/luanem2709)
- Discord: https://discord.gg/NUh6Mf22

## License

MIT