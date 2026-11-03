# Xác nhận đăng ký tư vấn và nối chat hiện có — bản mô phỏng

## Phạm vi đã chọn

Người dùng chọn tiếp tục mô phỏng vì chưa có back office/tài khoản nhân viên. Không bổ sung backend chat thật, schema, quyền nhân viên, AI, hay hệ thống chat khác. Không đổi Supabase Edge Functions, RLS, Secrets, SePay Sandbox hoặc trigger Telegram. Telegram hiện vẫn chỉ thông báo hóa đơn Sandbox paid theo cấu hình đã phát hành; không khôi phục thông báo yêu cầu tư vấn trong lần này.

## Luồng mới

Form giữ nguyên trường họ tên, điện thoại, đồng ý liên hệ và API purchase-request. Chỉ khi HTTP thành công, saved=true và request_id trùng yêu cầu gửi đi mới thay form bằng xác nhận:

- “CloudFit đã nhận yêu cầu tư vấn!”
- “Cảm ơn quý khách đã quan tâm. Đội ngũ CloudFit sẽ liên hệ để tư vấn giải pháp phù hợp.”
- Tên gói đã chọn, trạng thái “Chờ tư vấn”.
- “Chat ngay với nhân viên” và “Để nhân viên liên hệ sau”.

Không tự mở chat hoặc gửi tin khách hàng. Lựa chọn chat phát sự kiện sang đúng consult-dialog đang có trên trang. Handler chỉ xác nhận mở thành công sau khi showModal thành công; nếu module không có hoặc mở lỗi, form báo yêu cầu đã lưu và cho thử lại/liên hệ sau. Chọn liên hệ sau quay về #catalog và không xóa yêu cầu.

Chat giữ mã yêu cầu/gói trong sidebar. Nút “Mô phỏng nhân viên tiếp nhận” chỉ cập nhật trong bộ nhớ trang, hiển thị “Ngọc Anh · mô phỏng” và badge tiếp nhận mô phỏng. Không cấp quyền nhân viên, không gán admin thật, không ghi phân công vào DB và không gửi Telegram. Công cụ hóa đơn/nhận tiền mô phỏng vẫn bị ẩn đối với yêu cầu tư vấn đã lưu, giữ nguyên ranh giới với luồng SePay.

## Khôi phục và chống trùng

sessionStorage theo từng gói lưu metadata whitelist: version, state pending/saved, requestId, productId, productName. Không lưu họ tên, điện thoại hoặc câu trả lời vào receipt. Không đưa dữ liệu cá nhân hoặc token vào URL. Receipt không phải bằng chứng xác thực nhân viên hay quyền đọc dữ liệu backend; chỉ phục hồi UI đã được xác nhận trước đó.

- Pending: giữ cùng UUID khi thử lại/lỗi mạng hoặc tải lại cùng tab; RPC hiện có tiếp tục chống trùng theo UUID.
- Saved: giữ màn hình xác nhận khi quay lại hoặc tải lại cùng phiên; không có thao tác POST tự động.
- Click chat, tiếp nhận mô phỏng hoặc đóng/mở chat không gửi lại đăng ký.
- Mã đã xung đột thông tin không bị tự đổi thành UUID mới để gửi thêm yêu cầu.
- Khôi phục sau reload chỉ cần mã yêu cầu và gói, không yêu cầu lưu PII trong browser storage.

Giới hạn: receipt phục hồi trong cùng phiên/tab và khi sessionStorage hoạt động. Nếu browser chặn lưu phiên, UI vẫn giữ thành công trong trang hiện tại và cảnh báo giữ trang để tránh gửi lại sau reload. Không bảo đảm chống trùng giữa tab/thiết bị/phiên mới bằng frontend. Câu trả lời khảo sát và thao tác tiếp nhận mô phỏng vẫn mất khi reload; yêu cầu ban đầu trong Supabase không bị xóa.

## File sửa

1. catalog/purchase.mjs — receipt, màn hình xác nhận, hai lựa chọn, xử lý mở chat lỗi.
2. catalog/app.mjs — focus đúng tiêu đề xác nhận khi form được khôi phục.
3. catalog/consultation-chat.mjs — mở lại ngữ cảnh bằng receipt không có PII.
4. catalog/chat-ui.mjs — acknowledgement mở dialog, khôi phục focus, tiếp nhận nhân viên mô phỏng.
5. catalog/catalog.css — khối xác nhận, badge và hai nút theo thiết kế hiện có.
6. tests/purchase.test.mjs — validation receipt, whitelist dữ liệu và phiên khác gói.
7. tests/chat.test.mjs — receipt không PII và không tự tạo tin khách hàng.
8. tests/purchase-browser.mjs — toàn bộ luồng và lỗi trên mobile/desktop.
9. Docs/consultation-confirmation-2026-11-03.md — báo cáo này.
10. README.md — ghi chú cập nhật.

## Kiểm thử

84/84 Node tests, syntax check và build đạt. Browser fixture ở 390/1440px đạt cho đăng ký → API lỗi/thử lại cùng ID → xác nhận → lựa chọn → mở chat → tiếp nhận mô phỏng → đóng/mở → liên hệ sau → quay lại/reload → lỗi chat/khôi phục. Có kiểm tra không tự gửi tin khách hàng, không POST khi thao tác chat, không PII URL/storage receipt và không tràn ngang.

Browser suites SePay Sandbox và phiếu thanh toán mẫu ở 390/1440px đều đạt. Mọi API/payment request trong kiểm thử được intercept local; không gửi yêu cầu tư vấn, tin Telegram hay giao dịch thử vào hệ thống thật trong lần này. Chưa kiểm chứng tiếp nhận bởi nhân viên thật vì scope chỉ mô phỏng.
