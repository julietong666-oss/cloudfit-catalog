# Thanh toán thật và nối form tư vấn — 2026-11-03

## Phạm vi người dùng đã cho phép

- Dùng ảnh QR thật của doanh nghiệp đã gửi trong chat.
- Sau khi form tư vấn được API xác nhận lưu thành công, tự mở khung tư vấn trực tiếp và giữ ngữ cảnh tên/số điện thoại/gói/mã yêu cầu.
- Mở rộng backend để lưu hội thoại, phân công, hoá đơn, thanh toán và thông báo Telegram khi hoá đơn đã thanh toán; không còn thông báo mới chỉ do gửi form tư vấn khi hoàn tất chuyển đổi.
- Xác nhận nhận tiền tự động từ webhook/API; không coi khách bấm nút hoặc sự kiện demo trên trình duyệt là bằng chứng nhận tiền.

## Việc đã làm trong source, chưa deploy

Ảnh gốc được giữ nguyên ở `catalog/company-payment-qr.jpg`, SHA-256 `f5ab7a28f42c6efb533bfb43dc74c3fb36b1601417a7f1864769d24d5d293181`. Giải mã được: VietQR có BIN `970436`, mã nhận tiền `QRGD000903266666601`, dịch vụ `QRIBFTTA`, tiền tệ `704`. Không gắn sẵn số tiền (tag 54) hoặc nội dung hoá đơn (tag 62). Không suy diễn mã nhận tiền này thành số tài khoản ngân hàng thông thường.

Form chỉ phát sự kiện mở chat sau `saved:true` và đúng request_id. API lỗi, không xác nhận lưu hoặc validation thất bại không mở chat. Có nút tiếp tục chat để mở lại mà không gửi thêm request. Khung nối từ form giữ thông tin liên hệ/gói, hiển thị Chờ phân công và không gán nhân viên giả lập. Chưa có backend hội thoại nên câu trả lời bổ sung mới chỉ trong trang; UI ghi rõ giới hạn này. Yêu cầu thật không được sử dụng công cụ demo hoá đơn/nhận tiền.

## Phương án chọn: SePay cho Vietcombank thật

Nguồn chính thức đọc ngày 2026-11-03:

- https://developer.sepay.vn/vi/sepay-webhooks/tai-khoan-ngan-hang — Vietcombank doanh nghiệp/hộ kinh doanh nhận qua VA, không mặc định theo dõi mọi giao dịch của tài khoản chính.
- https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook — sự kiện giao dịch gửi POST tới backend để ứng dụng tự đối soát.
- https://gpmpay.com/ — phần ngân hàng đã go-live đang liệt kê MB Bank; phần 30+ ngân hàng khác còn thông báo giai đoạn MVP/xin cấp API.
- https://docs.gpmpay.com/simulator — phù hợp thử bài tập qua sự kiện SIMULATED, không phải bằng chứng tiền thật.

Khuyến nghị SePay cho yêu cầu hiện tại là đánh giá theo ngân hàng đang dùng. Không khẳng định QR VCB đã cung cấp thuộc một VA liên kết SePay; phải được chủ tài khoản và dịch vụ kiểm tra trước. Không đăng ký, mua gói hoặc kết nối tài khoản tài chính thay người dùng.

## Điều kiện còn thiếu để triển khai luồng tiền thật

1. Chủ tài khoản QR doanh nghiệp tạo tài khoản SePay và kết nối Vietcombank theo hướng dẫn chính thức. Xác minh loại tài khoản, VA và QR nhận tiền tương ứng. Nếu VA cần QR khác, phải lấy QR do dịch vụ/ngân hàng cấp; không tự thay đích nhận tiền.
2. Cấu hình webhook có xác thực; secret chỉ lưu ở backend/secrets, không gửi qua chat/repo/browser. Cần quyền cấu hình hợp lệ trước khi tích hợp triển khai, không tạo cổng nhận tiền chung không có xác thực.
3. Đọc lại schema/RLS/Auth thực, thiết kế dữ liệu hoá đơn và hội thoại bền vững, quyền admin và quyền truy cập của khách. Thông tin cá nhân không được đặt vào bảng demo công khai.
4. Chỉ backend xác minh sự kiện tiền vào khớp đúng tài khoản/VA, mã hoá đơn, VND và số tiền mới cập nhật thanh toán, tạo thông báo trong cùng giao dịch và cho khách nhận trạng thái thành công. Chống trùng theo ID giao dịch và hoá đơn. Sai/thiếu/thừa tiền, phiếu huỷ hoặc không khớp cần đối soát, không tự đăng ký gói.
5. Chuyển trigger Telegram từ lúc tạo yêu cầu tư vấn sang sự kiện hoá đơn được xác nhận thanh toán. Không đổi riêng câu chữ để biến một yêu cầu tư vấn thành thông báo thanh toán thành công. Giữ kiểm soát gửi trùng và kết quả gửi.

Backend thanh toán/hội thoại thật và chuyển trigger Telegram CHƯA thực hiện, vì chưa có kết nối dịch vụ nhận giao dịch. Production/GitHub không được cập nhật trong lượt chuẩn bị này. Chưa dùng QR mới trong checkout mô phỏng để tránh tạo nhận định sai rằng chuyển tiền thật sẽ được xác nhận tự động.

## Kiểm tra

55/55 Node tests, syntax check và build (20 files) đạt. Browser form→chat 390/1440px dùng API giả lập đạt: validation/consent; busy không gửi trùng; lỗi không mở chat; retry cùng UUID; thành công tự mở đúng ngữ cảnh; chưa có admin giả; hội thoại thật không hiện công cụ hoá đơn mẫu; mở lại không POST thêm. Không gửi dữ liệu thử vào Supabase/Telegram thật.
