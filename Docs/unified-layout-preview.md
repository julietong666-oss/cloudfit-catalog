# Preview hợp nhất thiết kế gốc — 2026-10-30

**Trạng thái hiện hành 2026-10-31:** chủ dự án đã duyệt preview; đã phát hành production. Các ghi chú preview bên dưới mô tả mốc trước duyệt.
**Preview:** http://127.0.0.1:4173/
**Production làm mốc:** https://cloudfitk.vercel.app — HTML/app/CSS/purchase/config local đã đối chiếu khớp byte trước sửa; không lấy bản GitHub cũ.

## Thay đổi

- Bỏ details/summary và tiêu đề “Bản mẫu giao diện gốc”; trợ lý, mục tiêu/ngân sách, thẻ thông tin và banner hiển thị sẵn.
- Loại ba thẻ gói hard-code và thay bằng một danh sách duy nhất từ Supabase trong vùng giải pháp gốc. Tìm kiếm header, ô tìm chính và bộ lọc dùng cùng state/nguồn dữ liệu hiện tại.
- Thẻ được dựng theo khung gốc (biểu tượng, tên/mô tả, chi phí tham khảo, thông tin và nhãn); đường dẫn #product/<id> giữ nguyên mã gói và luồng đăng ký.
- Mục tiêu/ngân sách có trạng thái chọn và aria-pressed nhưng ghi rõ chỉ minh họa, chưa có thuật toán AI/tính giá/xếp hạng. Nút xem gói chỉ cuộn tới danh sách đang có, không giả lập đề xuất.
- Đổi tiền, so sánh, điều kiện Credits, thông báo và các menu chưa triển khai được disable/aria-disabled và ghi rõ Sắp có. Giữ cảnh báo nội dung, giá, số liệu và tư cách đối tác chưa xác minh.

## Bảo toàn

`purchase.mjs`, source API purchase-request, RPC, data.mjs và cấu hình kết nối khớp hash baseline ở unified-preview-baseline.json. Không migration/deploy backend, không thay schema/Auth/RLS/secret, không thay chống trùng/lỗi/xác nhận lưu; không gửi bản ghi thử thật trong lần này. Chỉ có UI source/build và kiểm thử preview được cập nhật.

## Kiểm tra

- 42 tests đạt, syntax check và build đạt (13 runtime files, thêm design-ui.mjs).
- HTML balanced, ID duy nhất, không còn details/summary hoặc danh sách giải pháp viết cứng trùng.
- Local /, design-ui.mjs và purchase.mjs HTTP 200, MIME đúng; server đang phục vụ preview.
- Đã gửi yêu cầu mở browser panel trong chat; công cụ trả queued. Link preview có thể mở trực tiếp.
- Không ghi nhận visual/mobile/browser E2E đã đạt: môi trường trước đó chặn Chrome bằng spawn EPERM; thay đổi lần này được kiểm chứng source/unit/HTTP, chờ chủ dự án xem trực tiếp.
- Đối chiếu cuối: production vẫn còn nội dung trước thay đổi và purchase.mjs cùng hash, chưa phát hành preview lên production.

Sau khi chủ dự án duyệt giao diện preview mới thực hiện cập nhật production. Preview local dùng origin đã được API cho phép; không thêm origin hosted preview vào API hoặc thay cấu hình để thử.


## Phát hành được duyệt — 2026-10-31

Production https://cloudfitk.vercel.app đã cập nhật bản preview được duyệt. Deployment `dpl_2YqtPCBaNPvEHbK9g8PjnMufKK3e`, target production, READY; baseline để hoàn tác `dpl_XWtBRZ3V5RiWD4QHYPQh2h6uY8XM`. 42 tests, syntax check và build đạt trước phát hành. Sau phát hành HTML, app/CSS/design-ui/purchase đều HTTP 200 và khớp byte bản build; homepage không còn details hoặc tiêu đề bản mẫu. Hash purchase/API/config/data vẫn nguyên, không thay DB/secret/phân quyền và không phát sinh đăng ký thử mới. Không có Git commit mới; deployment dùng 13 runtime files được build từ preview đã duyệt. Giới hạn browser QA tự động vẫn như ghi chú trước.
