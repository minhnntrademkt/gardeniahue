# DỰ ÁN GARDENIA HUẾ - CÔNG CỤ TÍNH PHƯƠNG ÁN TÀI CHÍNH & TIẾN ĐỘ THANH TOÁN

> **Đơn vị phát triển:** IUC Group & Đất Xanh Miền Trung  
> **Phạm vi dự án:** Khu dân cư CTR11, CTR12 và LK10-LK13, Khu A, Đô thị mới An Vân Dương, TP Huế  
> **Chính sách bán hàng:** Đợt 1 (Áp dụng 22/10/2026 - 30/11/2026 cho danh mục 75 sản phẩm)

---

## 📌 TỔNG QUAN TÍNH NĂNG
1. **Tra cứu & Lọc Bảng Hàng 75 Căn Thông Minh (Phễu 3 tầng)**:
   - Tầng 1: Loại hình sản phẩm (Shophouse 30 căn / Liền kề 45 căn).
   - Tầng 2: Phân khu (tự động co danh sách theo loại hình, ẩn hoàn toàn phân khu 0 căn).
   - Tầng 3: Khoảng giá niêm yết (tự động co danh sách theo loại hình và phân khu).
   - Thẻ tag bộ lọc thời gian thực kèm nút xóa nhanh từng tiêu chí.
2. **Bóc tách Chi phí Ban đầu & Vốn Tự Có**:
   - Đặt cọc 100.000.000 VNĐ.
   - Tiến độ thanh toán chuẩn xác từng ngày theo ngày ký Phiếu đặt cọc.
3. **Chi tiết 2 Phương án Thanh toán Chính thức**:
   - **Phương án 1 (Tiến độ 24 tháng)**: Chiết khấu 18%, 11 đợt thanh toán, quyền thuê nhà 0 đồng 18 tháng để kinh doanh sớm.
   - **Phương án 2 (Vay vốn Ngân hàng 70%)**: Chiết khấu 4%, vốn tự có 30%, CĐT hỗ trợ lãi suất 0% & ân hạn gốc 24 tháng, quyền thuê nhà 0 đồng 300 ngày.
   - **Đối chiếu song song**: Bảng so sánh trực tiếp quyền lợi, vốn tự có và dòng tiền 2 phương án.
4. **Công cụ Hỗ trợ Bán hàng**:
   - Nút **Sao chép gửi Zalo**: Tự động sinh nội dung tư vấn ngắn gọn, đầy đủ thông số căn và tiến độ gửi khách hàng.
   - Nút **In phiếu phương án (A4)**: Xuất bản in A4 sạch sẽ, trang trọng.
5. **Chính sách Quà tặng & Tiện ích Resort**:
   - Gói du lịch 20tr, nâng cấp mặt ngoài cao cấp, cảnh quan sân vườn, miễn phí vận hành 3 năm, chính sách khai thác dòng tiền 12 tháng không lợi nhuận 85/15.

---

## 🔒 HỆ THỐNG BẢO MẬT DỮ LIỆU & CHỐNG CLONE MÃ NGUỒN
Ứng dụng được trang bị 5 lớp bảo mật tối tân:
- **Xóa bỏ tệp `data.js` trong bản online**: Dữ liệu 75 căn được nén ma trận (xóa 100% key), hoán vị Byte (Fisher-Yates) và mã hóa nhị phân đa tầng (`Xorshift128 Stream Cipher`).
- **Private Scope Isolation**: Không gắn bất kỳ biến dữ liệu nào lên `window`.
- **Làm rối mã nguồn (Obfuscation)**: Toàn bộ hàm, chuỗi văn bản và công thức được mã hóa, nén gọn trên 1 dòng.
- **Lá chắn chống Copy & Inspect**: Chặn chuột phải, chặn phím tắt F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C; chống bôi đen kéo thả bảng giá thô.
- **Anti-AI Scraper & W3C TDM-Reservation**: Nhúng thẻ `noindex, nofollow, noarchive`, `tdm-reservation="1"`, kèm `robots.txt`, `llms.txt`, `ai.txt` chặn hơn 25 công cụ thu thập và AI Crawlers.
- **Tự động chặn nhúng Iframe**: Chống hành vi nhúng web vào trang khác.

---

## 🚀 HƯỚNG DẪN DEPLOY TRỰC TIẾP LÊN HOSTING

### Cách 1: Deploy lên Vercel (Khuyên dùng)
- Đăng nhập [vercel.com](https://vercel.com) -> New Project -> Import repository `gardeniahue`.
- Vercel sẽ tự động nhận cấu hình `outputDirectory: "dist"` từ `vercel.json` và deploy trang bảo mật online ngay lập tức.

### Cách 2: Deploy lên Netlify
- Đăng nhập [netlify.com](https://netlify.com) -> Add new site -> Import repository `gardeniahue`.
- Netlify sẽ tự động nhận `publish = "dist"` từ `netlify.toml` và hoàn tất deploy.

### Cách 3: Deploy lên GitHub Pages
- Vào GitHub Repository -> **Settings** -> **Pages**.
- Tại mục **Build and deployment** / **Branch**: Chọn nhánh `main` và thư mục `/docs` -> Bấm **Save**.
- Trang web bảo mật sẽ chạy trực tiếp tại `https://minhnntrademkt.github.io/gardeniahue/`.

### Cách 4: Deploy lên Hosting cPanel / VPS / Apache
- Tải toàn bộ các tệp **bên trong thư mục `dist/`** và upload vào thư mục `public_html` của hosting.
- Tệp `.htaccess` đã được thiết lập sẵn đầy đủ Security Headers.

---

## 🛠️ LỆNH ĐÓNG GÓI BẢO MẬT CỤC BỘ
Mỗi khi chỉnh sửa giá/chính sách trong `data.js` hoặc thêm tên miền cho phép:
```powershell
node build_secure.js
```
Hệ thống sẽ tự động cập nhật bản mã hóa mới vào cả 2 thư mục `dist/` và `docs/`.

