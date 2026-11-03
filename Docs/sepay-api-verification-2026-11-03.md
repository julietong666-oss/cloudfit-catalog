> ĐÃ TRIỂN KHAI sau khi người dùng phê duyệt. Website `https://cloudfitk.vercel.app`, deployment `dpl_BnHbBDxwxKut78aPYt4ZtBpRqqj6` READY; checkout v12, IPN v11. Bằng chứng chi tiết: `Docs/sepay-api-release-2026-11-03.json`. Các mô tả “chưa deploy” phía dưới ghi trạng thái lúc chuẩn bị bản sửa, không phải trạng thái hiện tại.
>
> Kiểm thử hosted: đúng một hóa đơn Sandbox 10.000 VND, API xác nhận paid, popup quan sát được khi mở callback được cung cấp trong phiên tạo đơn, Telegram sent (message 14), một delivery. Không có giao dịch tiền thật. Tự động redirect SePay chưa được xác minh. Checkout đã tách yêu cầu khóa IPN; IPN vẫn giữ nguyên guard và cấu hình khóa hiện tại đang có ký tự không hợp lệ. Không sửa Secrets/schema/RLS. Không coi nút onboarding thiếu khóa là giao dịch hợp lệ.

# Xác minh SePay Sandbox trực tiếp qua API — bản local, 03/11/2026

## Kết quả và giới hạn

Đã hoàn thiện bản local và chạy kiểm thử. Chưa deploy Supabase/Vercel, chưa push GitHub, chưa sửa cấu hình/Secrets/schema/RLS hoặc dữ liệu đang chạy. Không đọc khóa riêng của người dùng, không tạo giao dịch SePay thật hoặc gửi Telegram thật. Bản đang chạy vẫn là bản trước; thay đổi này chỉ có hiệu lực sau khi được phê duyệt triển khai.

Log SePay #39981 do người dùng cung cấp hiển thị Content-Type trong Request Headers, không hiển thị X-Secret-Key; Supabase nhận POST lúc 17:26:52 và trả 401. Log này cũng dùng PAYMENT_SUCCESS, mã INV mẫu và cờ webhook_test. Vì không thể khẳng định từ ảnh rằng header bị bỏ hay bị ẩn khi ghi log, bản sửa không mặc định lỗi do người dùng nhập sai khóa. Không hạ xác thực để làm nút test xanh, không coi test_mode/webhook_test là bằng chứng thanh toán.

## Cách mới

Giữ IPN có khóa riêng; đồng thời cho phép backend xác minh trực tiếp qua API khi trình duyệt hỏi trạng thái hóa đơn. Vì vậy callback IPN thiếu hoặc đến chậm không còn là điều kiện duy nhất quyết định việc xác nhận giao dịch.

- Endpoint chính thức: GET `https://pgapi-sandbox.sepay.vn/v1/order/detail/{order_invoice_number}`.
- Xác thực server-to-server: Basic Auth bằng SEPAY_SANDBOX_MERCHANT_ID và SEPAY_SANDBOX_SECRET_KEY. Không dùng IPN key thay merchant key, không gửi merchant secret xuống browser.
- Nguồn: [API chi tiết đơn hàng](https://developer.sepay.vn/vi/cong-thanh-toan/API/don-hang/chi-tiet-don-hang), [xác thực và môi trường](https://developer.sepay.vn/vi/cong-thanh-toan/API/tong-quan), [IPN](https://developer.sepay.vn/vi/cong-thanh-toan/IPN).

Không tạo endpoint xác minh giả của SePay, không chuyển sang host Production và không dùng ảnh QR ngân hàng thật.

## Điều kiện xác nhận

Backend đối chiếu mã hóa đơn, số tiền nguyên VND, trạng thái CAPTURED và một giao dịch PAYMENT/BANK_TRANSFER/APPROVED khớp số tiền, tiền tệ, UUID hợp lệ. Dùng data.id và transactions[].id, không nhầm với mã order_id dạng chữ. Với IPN, các UUID còn phải khớp callback. Giao dịch thiếu, thất bại, hoàn tiền/hủy đã được chấp thuận hoặc nhiều giao dịch khớp gây mơ hồ đều không được tự xác nhận.

Chỉ sau xác minh API mới gọi RPC settlement hiện có. RPC tiếp tục kiểm hóa đơn tồn tại, môi trường Sandbox, số tiền/currency DB, hạn sử dụng, trạng thái và định danh giao dịch; khóa bản ghi và ràng buộc unique ngăn xử lý trùng. Không tạo hóa đơn từ callback.

Sau settlement từ thao tác status, backend đọc lại hóa đơn bằng capability token. Chỉ khi DB trả paid mới trả payment_verified=true. Frontend yêu cầu cả paid lẫn boolean này rồi mới mở popup. Query success, payload frontend hoặc thông báo mô phỏng không thể tự đặt cờ xác minh.

Không cần migration mới: dùng các RPC và ràng buộc đang có. Để không coi hóa đơn paid cũ là đã được API đối chiếu, mỗi lần status cho pending/paid đều đi qua bộ xác minh. Nếu API không xác nhận hóa đơn paid cũ, request trả lỗi an toàn và không mở popup; không tự sửa/xóa trạng thái lịch sử.

Bộ xác minh gộp request đồng thời và cache phản hồi API tối đa 5 giây trong một worker, tối đa 100 mã hóa đơn. Đây là giới hạn tại worker, không phải hạn mức chung cho mọi Edge worker. Sau cache vẫn kiểm điều kiện và DB. API lỗi thì xóa cache lỗi để lần sau có thể thử lại. Có timeout 6 giây và chặn redirect; chỉ truy vấn mã CFSBX đúng định dạng vào host cố định.

## IPN và chẩn đoán

- Thiếu/sai X-Secret-Key vẫn 401 trước khi gọi API hoặc DB. Log mới chỉ ghi ipn_secret_missing hoặc ipn_secret_mismatch; không ghi khóa, hash khóa, header, payload hay dữ liệu khách hàng.
- Nhận diện ORDER_PAID và PAYMENT_SUCCESS như hai tên sự kiện đầu vào. Cả hai đều yêu cầu xác thực IPN, dữ liệu hợp lệ, API SePay xác nhận và settlement được DB chấp nhận. Chỉ đổi tên sự kiện không đủ để trả thành công thanh toán.
- Callback có khóa nhưng mã INV mẫu không thuộc hóa đơn CloudFit bị từ chối; không gán cho một gói giả.
- API chưa có đơn (404) hoặc đơn chưa CAPTURED: status pending vẫn pending. API lỗi xác thực, hạn mức, mạng hoặc 5xx: không paid và không fallback sang tin payload IPN. IPN nhận lỗi có thể thử lại; không ACK đã thanh toán khi chưa xác minh.
- Telegram giữ nguyên trigger/outbox và handler hiện có. Xác minh từ API cũng đi qua settlement nên dùng cùng cơ chế chống trùng; không gọi Telegram trực tiếp từ frontend.

## Các file thay đổi trong lần này

1. `supabase/functions/_shared/sepay-verification.mjs` — mới: client API Sandbox, xác minh, cache/coalescing, helper gọi settlement.
2. `supabase/functions/_shared/sepay-sandbox.mjs` — nhận diện PAYMENT_SUCCESS bên cạnh ORDER_PAID; giữ validation.
3. `supabase/functions/sepay-sandbox/handler.mjs` — tra API từ status sau kiểm capability, settlement và đọc lại DB, trả payment_verified.
4. `supabase/functions/sepay-sandbox-ipn/handler.mjs` — xác minh API trước settlement, thêm chẩn đoán auth an toàn.
5. `catalog/sepay-sandbox.mjs` — yêu cầu cờ xác minh trước popup, nội dung chờ/đã xác minh phản ánh cả API và IPN.
6. `package.json` — thêm suite và syntax check module mới.
7. `tests/sepay-verification.test.mjs` — mới: API/auth, dữ liệu sai, lỗi, cache, phục hồi không IPN, DB commit, legacy paid và onboarding.
8. `tests/sepay-sandbox.test.mjs` — mock API chính thức ở local cho các test settlement và cập nhật kỳ vọng kiểm API.
9. `tests/sepay-database.test.mjs` — ghép handler thật, API fixture và PostgreSQL local; kiểm phục hồi không IPN và IPN đến muộn/đồng thời.
10. `tests/sepay-browser.mjs` — kiểm paid thiếu payment_verified không mở popup, giữ kiểm mobile/desktop và URL giả.
11. `Docs/sepay-sandbox-setup.md` — cập nhật hướng dẫn luồng API.
12. `README.md` — trạng thái bản local mới.
13. `Docs/sepay-api-verification-2026-11-03.md` — báo cáo này.

Không sửa `sandbox-payment-notify` hoặc SQL schema trong lần này. Workspace vẫn có các thay đổi cũ từ công việc trước; danh sách trên chỉ mô tả phần mới của lần này.

## Kiểm thử đã đạt

- npm test: 81/81 Node tests; npm run check/build đạt, 20 runtime assets.
- Deno check cả ba entrypoint đạt; Deno test SDK chính thức 1/1 đạt.
- PostgreSQL WASM/PGlite local: xác minh bằng API fixture rồi settlement; tiền sai/khóa sai/hóa đơn lạ không paid; API recovery không IPN; IPN trùng/đến muộn và request song song không tăng outbox/thông báo.
- Chrome headless ở 390px và 1440px: suite SePay và phiếu chat đạt. URL success/API lỗi/pending/paid chưa được API xác minh/mô phỏng thủ công không mở popup. Backend paid+verified mới mở popup; reload không lặp.
- git diff --check đạt.

Mọi payment/API/Telegram request trong test được chặn hoặc thay bằng fixture local. PGlite dùng stub net.http_post, không gọi Supabase hoặc Telegram thật. Chỉ tải tài liệu công khai và package đã ghim phục vụ kiểm tra. Chưa xác minh Merchant credentials của tài khoản người dùng qua một giao dịch SePay Sandbox thực tế.

## Triển khai và test thật trong Sandbox sau khi được duyệt

Kế hoạch lúc chuẩn bị: triển khai hai Edge Functions sepay-sandbox và sepay-sandbox-ipn cùng các shared modules, rồi frontend build mới. Giữ verify_jwt=false như hiện tại; IPN dùng khóa riêng, status dùng capability token. Không cần thay schema, không thay Secrets hiện có hoặc bật Live Mode. Không tự triển khai trong nhiệm vụ này.

Sau đó tạo phiếu thử ngay từ CloudFit → Thanh toán qua SePay Sandbox → hoàn tất thanh toán giả lập ở SePay → quay về → Kiểm tra lại trạng thái. Backend sẽ tra API ngay cả khi không nhận được IPN. Chỉ khi API và DB hợp lệ mới có popup cảm ơn; Telegram vẫn mang nhãn THỬ NGHIỆM.

Nút Gửi test ở onboarding gửi request thiếu khóa vẫn có thể báo đỏ. Bản sửa không cam kết làm nút đó xanh; mục tiêu là xác nhận giao dịch Sandbox thực sự của CloudFit bằng API chính thức. Nếu SePay chặn checkout do onboarding chưa hoàn tất hoặc API không cho quyền tra cứu, cần xác minh phản hồi thực tế/tài khoản với SePay; không tự bỏ xác thực hoặc giả lập thành công.
