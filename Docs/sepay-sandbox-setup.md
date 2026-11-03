> Đã deploy xác minh API sau khi được duyệt: checkout v12, IPN v11, frontend READY. Giao dịch Sandbox 10.000 VND đã được API xác nhận, DB paid, popup và Telegram sent. Xem `Docs/sepay-api-release-2026-11-03.json`. Checkout hiện không phụ thuộc khóa IPN; callback IPN vẫn yêu cầu khóa hợp lệ. Các mốc chuẩn bị bên dưới là lịch sử.

> Bản local mới đã có xác minh trực tiếp qua API SePay Sandbox, CHƯA deploy. Xem `Docs/sepay-api-verification-2026-11-03.md` cho cách test, giới hạn và file thay đổi; `Docs/sepay-ipn-debug-2026-11-03.md` giữ bằng chứng lỗi trước đó. Mốc phát hành phía dưới là lịch sử.

# SePay Payment Gateway Sandbox — cấu hình và kiểm chứng

## Mốc phát hành trước bản sửa IPN

Website https://cloudfitk.vercel.app, deployment `dpl_7nrm5f5SHdCgDUQk8nwM8fGancdF` READY, 20 runtime assets khớp byte với build. Ba Edge Functions `sepay-sandbox`, `sepay-sandbox-ipn`, `sandbox-payment-notify` được quan sát ACTIVE version 3 trong lần khảo sát IPN ngày 2026-11-03; chưa phát hành bản sửa local. Migration `sepay_sandbox_invoices_and_paid_notifications` đã áp dụng sau kiểm thử PostgreSQL cục bộ.

Đây là Cổng thanh toán SePay Sandbox, không phải webhook biến động số dư tài khoản ngân hàng. Không dùng ảnh QR Vietcombank thật để thanh toán thử, không thu tiền thật, không kích hoạt gói thật. Ảnh nhận từ người dùng vẫn giữ nguyên ở source nhưng không nằm trong build website Sandbox.

## Cấu hình Secrets

Trong Supabase project `cloudfit-internal` → Edge Functions → Secrets, thêm từng dòng rồi Save:

| Name | Value |
|---|---|
| `SEPAY_SANDBOX_MERCHANT_ID` | Merchant ID Sandbox thật do SePay cấp, dạng `SP-TEST-…` |
| `SEPAY_SANDBOX_SECRET_KEY` | Secret Key Sandbox hiện hành do SePay cấp, dạng `spsk_test_…` |
| `SEPAY_SANDBOX_IPN_SECRET` | Khóa IPN riêng đã cấu hình trong tab IPN của SePay; khuyến nghị ít nhất 32 ký tự ngẫu nhiên |

SePay phân biệt khóa merchant và khóa IPN. Đặt khóa IPN riêng ở Cổng thanh toán → Cấu hình → IPN, chọn SECRET_KEY, rồi lưu đúng cùng giá trị vào `SEPAY_SANDBOX_IPN_SECRET`. Không mặc định sao chép hoặc fallback từ khóa merchant. Tên biến này do CloudFit quy định, không phải giá trị SePay tự điền vào Supabase. Không nhập cả code PHP/JS, không thêm dấu nháy hoặc khoảng trắng, không dùng chuỗi placeholder `XXXX`/`YOUR_*`. Nếu đã lộ khóa, tạo lại trên SePay trước khi dùng. Không ghi bất kỳ giá trị bí mật nào vào Git/chat/browser. Giữ nguyên TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID hiện có.

Trong SePay → Cổng thanh toán → Cấu hình → IPN (Sandbox):

- URL: `https://qibpsehkmzjwusllorbf.supabase.co/functions/v1/sepay-sandbox-ipn`
- Xác thực: `SECRET_KEY` (không chọn NONE).
- Khóa riêng ở tab IPN, được gửi qua `X-Secret-Key`, phải khớp chính xác `SEPAY_SANDBOX_IPN_SECRET`. Không thêm dấu nháy/khoảng trắng đầu cuối. Bản sửa không áp đặt prefix của merchant hoặc giới hạn 32 ký tự không được tài liệu SePay quy định; vẫn bắt buộc đối chiếu khóa, và nên dùng khóa ngẫu nhiên dài ít nhất 32 ký tự.

Các URL success/error/cancel được backend tạo sẵn về CloudFit; không phải URL IPN. Trang quay về chỉ hỏi trạng thái backend, không tự đặt paid từ query string.

## Cách thử bằng tài khoản Sandbox

Tư vấn trực tiếp → trả lời 5 câu → Góc admin mẫu → soạn phiếu → điền dữ liệu mẫu → gửi phiếu → **Thanh toán qua SePay Sandbox**. Backend lưu một hoá đơn thử rồi dùng SDK chính thức `sepay-pg-node@1.0.0` ký form; browser gửi POST tới `https://pay-sandbox.sepay.vn/v1/checkout/init`. Thao tác thử trên trang SePay, sau đó quay lại CloudFit.

Trong bản local mới, IPN có khóa hợp lệ chỉ là tín hiệu để backend tra API SePay Sandbox. Backend kiểm mã CFSBX, tiền VND, CAPTURED/APPROVED và giao dịch PAYMENT/BANK_TRANSFER rồi gọi settlement. Nút kiểm tra trạng thái cũng tra API nên không bắt buộc nhận IPN trước. Sau settlement, UI phải đọc lại DB paid và payment_verified=true mới hiện popup. Trigger/outbox Telegram giữ cơ chế chống trùng và nhãn **THỬ NGHIỆM — SEPAY SANDBOX**. Nút test thiếu X-Secret-Key vẫn bị từ chối, không tạo paid từ payload mẫu. Thiếu/bị sai khóa, production credentials hoặc placeholder sẽ fail closed. Checkout hiện chỉ cần merchant credentials hợp lệ; IPN có guard khóa riêng, và status xác minh qua API độc lập.

## Dữ liệu và quyền

- `sepay_sandbox_invoices` chỉ có environment sandbox, amount/currency cố định sau tạo, token truy cập chỉ lưu SHA-256; token gốc ở sessionStorage của trình duyệt tạo checkout, không có trong URL callback.
- Endpoint checkout cho phép tạo phiếu thử công khai (sandbox-only, không phải công cụ lập hoá đơn thật của admin), hạn mức 3 phiếu/số điện thoại/giờ và 100 phiếu toàn bộ/giờ. Dữ liệu phiếu được giữ để đối soát, không tự kích hoạt bất kỳ dịch vụ thật nào.
- `sandbox_payment_deliveries` lưu pending/processing/sent/failed/unknown. Claim nguyên tử trước khi gọi Telegram; sự kiện paid và transaction ID chống lặp. Không tự retry trạng thái processing/unknown. Gửi lỗi không xoá trạng thái paid.
- Hai bảng bật RLS, không cấp SELECT/INSERT cho anon/authenticated; các RPC chỉ service_role. Người dùng đọc một hoá đơn bằng capability token 64 ký tự, không có API đọc danh sách công khai.
- Trigger cũ `purchase_requests_telegram_insert` đã gỡ: form tư vấn chỉ lưu yêu cầu và mở chat, không gửi Telegram nữa. Bản ghi/delivery lịch sử được giữ nguyên, không xoá dữ liệu cũ.
- Khung chat nối từ form vẫn là phần thu thập nhu cầu ở frontend, chờ phân công, chưa có inbox/hội thoại thật giữa nhân viên và khách. Không giả gán nhân viên mẫu và không cho yêu cầu tư vấn thật vào công cụ hoá đơn mô phỏng.

## Bằng chứng kiểm tra

- 63 Node tests, syntax check/build đạt.
- Deno check ba entrypoint đạt; Deno test dùng SDK chính thức kiểm endpoint Sandbox, thứ tự field và HMAC đạt. SDK ghim phiên bản, có `deno.lock`.
- PostgreSQL WASM cục bộ (PGlite 0.3.14): lặp tạo phiếu không nhân bản, không sửa số tiền khi retry, capability sai không đọc được, sai số tiền không paid, lặp IPN chỉ một delivery, phiếu huỷ không paid, anon không đọc/gọi RPC được. `net.http_post` trong test chỉ là hàm cục bộ ghi đếm, không nối mạng.
- Browser fixture 390/1440: form→chat, luồng cũ, và SePay checkout→callback→status→popup đều đạt. Trên frontend production cũng chạy kiểm tra Sandbox bằng API/provider được intercept giả lập ở cả hai kích thước, không POST tới backend/provider thật. URL `?result=success` không tự xác nhận; missing keys không mở SePay; popup không lặp sau reload.
- Backend live GET cả ba function trả 405 đúng dự kiến, không có ghi dữ liệu hoặc gọi Telegram. Kiểm tra SQL read-only sau phát hành: hai bảng RLS bật, anon SELECT/INSERT false, 0 invoice và 0 delivery; chỉ còn trigger paid trên invoice. Advisor không có WARNING/ERROR, có INFO backend-only RLS không policy: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Chưa kiểm một giao dịch Sandbox thực sự qua tài khoản SePay của người dùng hoặc Telegram nhận tin: chờ người dùng lưu Secrets và cấu hình IPN rồi tự thử. Không dùng khóa đã gửi trong chat. Không gửi dữ liệu thử vào Supabase/Telegram thật trong lượt kiểm tra này.

Chạy test đặc biệt: dùng Deno `deno test --config supabase/functions/sepay-sandbox/deno.json --allow-env tests/sepay-sdk.test.ts`; test SQL cần PGlite 0.3.14, chỉ định đường dẫn module bằng `PGLITE_MODULE` rồi chạy `node tests/sepay-database.test.mjs`. Browser cần fixture server và PLAYWRIGHT_MODULE/CHROME_PATH như README.

## Nguồn chính thức

- https://developer.sepay.vn/vi/cong-thanh-toan/sandbox
- https://developer.sepay.vn/vi/cong-thanh-toan/sdk/nodejs
- https://developer.sepay.vn/vi/cong-thanh-toan/IPN
- https://supabase.com/docs/guides/functions

Chỉ dẫn SePay nói rõ IPN gửi `X-Secret-Key` khi bật SECRET_KEY; đây không phải HMAC ký body IPN. HMAC SDK dùng để ký form checkout. Không trộn hai cơ chế xác thực.
