# CloudFit — kiểm tra lỗi SePay Sandbox IPN, 2026-11-03

## Trạng thái và phạm vi

Bản sửa chỉ ở workspace, chưa commit/push/deploy trong nhiệm vụ này. Không thay đổi cấu hình/Secrets, dữ liệu, migration, RLS hoặc function trên Supabase; không thay đổi Vercel. Không kết nối ngân hàng thật, không tạo giao dịch tiền thật, không gửi tin Telegram thật. Các thay đổi có sẵn từ công việc trước được giữ lại.

Đã đọc hướng dẫn repository và khảo sát đường đi: frontend `catalog/sepay-sandbox.mjs` → `sepay-sandbox` → RPC tạo hóa đơn → form SDK SePay Sandbox → `sepay-sandbox-ipn` → RPC settlement → trigger/outbox → `sandbox-payment-notify`; frontend quay về đọc trạng thái bằng capability token. Đã đối chiếu bản function đang triển khai với source trước sửa, không chỉ dựa vào thông báo EDGE_FUNCTION_ERROR.

## Nguyên nhân và bằng chứng

- Log POST IPN ngày 2026-11-03 lúc 05:20:02.631 và 05:20:10.914 UTC, tức 12:20:02 và 12:20:10 Việt Nam: HTTP 503, EDGE_FUNCTION_ERROR, function version 3. Trong khoảng log runtime đã đọc chỉ thấy Boot/Shutdown, không thấy exception tương ứng. Riêng nhãn EDGE_FUNCTION_ERROR không chứng minh có lỗi boot/import.
- Một POST chẩn đoán rỗng `{}`, không khóa, không mã hóa đơn, nhận trực tiếp HTTP 503, body `{"error":"sandbox_not_configured"}`, header `sb-error-code: EDGE_FUNCTION_ERROR`. Theo source đang chạy, request này dừng trước xác thực/body/DB, không tạo dữ liệu thanh toán.
- Bản source IPN version 3 gọi `sandboxConfig()` dùng chung, bắt buộc cả merchant ID, merchant secret và IPN secret; ngoại lệ cấu hình bị gom thành 503 `sandbox_not_configured`. Bản code này khớp source local trước sửa; artifact SHA-256: `5634c7015acad8b44cd1404b8cd888ebfe73539f2f0f6dcc2d582dd138d71129`.
- Với việc `SEPAY_SANDBOX_IPN_SECRET` chưa được cấu hình theo thông tin người dùng, guard đó chắc chắn từ chối mọi POST trước DB. Tái hiện local source trước sửa bằng merchant credentials giả lập hợp lệ và thiếu IPN key cho đúng 503/body, số lần gọi DB = 0. Không cần giả định rằng DB lỗi hay webhook chưa tới.
- Metadata đọc trực tiếp cho cả ba function: ACTIVE, version 3, `verify_jwt: false`. POST không Bearer vẫn vào handler. JWT của Supabase không phải nguyên nhân 503 này; không cần tắt thêm xác thực nào.
- Kiểm tra SQL chỉ đọc xác nhận các bảng/RPC settlement/trigger paid có tồn tại; RPC có quyền service_role, không có quyền anon. Không đọc hay sửa bản ghi hóa đơn thực tế.

Giới hạn kết luận: không đọc giá trị Secrets nên không khẳng định merchant credentials đã được SePay chấp nhận. Thiếu IPN key là điều kiện gây 503 đã xác định; sau khi cấu hình và triển khai bản sửa, lỗi DB hoặc đối chiếu giao dịch khác nếu có cần kiểm chứng riêng. Bản sửa không tự chữa cấu hình thiếu bằng cách chấp nhận request không khóa.

## Xác thực theo tài liệu chính thức

Nguồn: [IPN SePay](https://developer.sepay.vn/vi/cong-thanh-toan/IPN), [môi trường Sandbox](https://developer.sepay.vn/vi/cong-thanh-toan/sandbox).

SePay phân biệt Merchant Secret Key dùng ký checkout với IPN Secret Key tự cấu hình ở tab IPN. Khi Auth Type là SECRET_KEY, SePay gửi khóa IPN bằng header X-Secret-Key; tên header không phân biệt hoa thường. CloudFit phải so khớp khóa đó với biến do dự án đặt tên `SEPAY_SANDBOX_IPN_SECRET`. Không suy ra khóa IPN từ Merchant Secret Key.

Bản sửa vẫn bắt buộc khóa riêng được cấu hình rõ ràng, không rỗng, không chứa ký tự điều khiển/khoảng trắng đầu cuối, và đối chiếu bằng hash với vòng so sánh cố định. Không áp đặt prefix merchant hoặc độ dài 32 bắt buộc mà tài liệu không yêu cầu; khuyến nghị dùng khóa ngẫu nhiên riêng dài ít nhất 32 ký tự. Không tạo hay cấu hình khóa giả trên server.

## Thay đổi chính xác trong nhiệm vụ này

| File | Thay đổi |
|---|---|
| `supabase/functions/_shared/sepay-sandbox.mjs` | Tách `sandboxIpnSecret` khỏi `sandboxConfig`, thêm lỗi cấu hình có mã/tên biến an toàn; kiểm tra placeholder merchant chính xác hơn; bắt buộc notification_type; cho mã invoice test thông thường đi tới đối chiếu DB thay vì bị regex CFSBX từ chối sớm. Không tự tạo invoice từ IPN. |
| `supabase/functions/sepay-sandbox-ipn/handler.mjs` | IPN chỉ dùng khóa riêng; phân biệt lỗi cấu hình/backend/DB/tạm thời; log chỉ mã và giai đoạn; giữ 401 khi khóa sai, 400 payload không hợp lệ, 409 không khớp hóa đơn; chỉ ACK thanh toán khi RPC trả accepted === true. |
| `supabase/functions/sepay-sandbox/handler.mjs` | Checkout vẫn yêu cầu cả merchant credentials Sandbox và cấu hình IPN; status/cancel dựa vào quyền capability và DB, không bị khóa bởi cấu hình merchant/IPN không liên quan; trả mã cấu hình cụ thể. |
| `catalog/sepay-sandbox.mjs` | Nhận diện mã lỗi cấu hình mới; kiểm tra invoice number/ID/amount/environment/status từ API trước popup; đặt nội dung popup đúng yêu cầu, giữ nhãn Sandbox và thông tin không phát sinh tiền thật. |
| `catalog/chat-ui.mjs` | Bỏ mở popup thành công từ nút mô phỏng nhận tiền trong chat; giữ thông báo rõ đây chỉ là mô phỏng. |
| `catalog/chat.css` | Cho mã hóa đơn dài xuống dòng trong popup, tránh bị cắt trên màn hình điện thoại. |
| `tests/sepay-sandbox.test.mjs` | Thêm tái hiện thiếu khóa; auth độc lập; không fallback merchant; kiểm tra trạng thái thất bại/void, invoice không tồn tại, lỗi DB và che thông tin nhạy cảm, accepted boolean, notifier chỉ gửi hóa đơn paid và chống gửi lặp. |
| `tests/sepay-database.test.mjs` | Kết nối handler IPN thật với PostgreSQL WASM cục bộ; kiểm tra wrong key, declined, unknown invoice, wrong amount, valid paid, callback đồng thời/trùng và transaction xung đột. |
| `tests/sepay-browser.mjs` | Chặn popup khi URL success nhưng backend lỗi/pending hoặc paid payload không hợp lệ; xác nhận popup sau backend paid hợp lệ, không lặp sau reload và không tràn mã hóa đơn trên điện thoại. |
| `tests/chat-order-browser.mjs` | Xác nhận mô phỏng thủ công không mở popup thanh toán thành công. |
| `supabase/functions/.env.example` | Chú thích khóa IPN riêng; không có giá trị Secrets thật. |
| `Docs/sepay-sandbox-setup.md` | Sửa hướng dẫn phân biệt khóa, bổ sung trạng thái local chưa deploy và liên kết báo cáo này. |
| `README.md` | Ghi trạng thái bản sửa và bằng chứng/kiểm tra mới, giữ lịch sử phát hành cũ bên dưới. |
| `Docs/sepay-ipn-debug-2026-11-03.md` | Báo cáo này. |

`sandbox-payment-notify` và SQL settlement/outbox được khảo sát, kiểm thử nhưng không sửa source trong nhiệm vụ này. Không thay đổi schema/RLS. Những file khác có diff từ trước không phải thay đổi mới của nhiệm vụ này.

## Kiểm chứng phát triển đã chạy

- `npm test`: 72/72 Node tests đạt, bao gồm các trường hợp IPN và notifier nêu trên; đây là tổng suite, không phải 72 giao dịch SePay.
- `npm run check`, `npm run build`: đạt; build tĩnh 20 runtime files. `git diff --check`: đạt.
- `deno check --config supabase/functions/sepay-sandbox/deno.json supabase/functions/sepay-sandbox/index.ts supabase/functions/sepay-sandbox-ipn/index.ts supabase/functions/sandbox-payment-notify/index.ts`: đạt.
- `deno test --config supabase/functions/sepay-sandbox/deno.json --allow-env tests/sepay-sdk.test.ts`: 1/1 đạt với SDK chính thức được ghim phiên bản, kiểm endpoint Sandbox và chữ ký checkout.
- `PGLITE_MODULE=/tmp/cloudfit-sandbox-tools/node_modules/@electric-sql/pglite/dist/index.js node tests/sepay-database.test.mjs`: đạt. PostgreSQL WASM chạy trong tiến trình local; net.http_post là stub local, không gửi Supabase/Telegram. Settlement cập nhật paid và tạo đúng một outbox cho callback lặp/đồng thời.
- Server fixture `node tests/serve-fixtures.mjs`; `node tests/sepay-browser.mjs` và `node tests/chat-order-browser.mjs`: đạt ở 390px và 1440px bằng Chrome headless. Mọi payment/API request được intercept local; không gửi tới SePay/Supabase/Telegram thật. Đã xem ảnh popup ở 390px và sửa tràn mã invoice.

Máy này dùng Node/Deno/PGlite/Playwright từ runtime/cache hoặc `/tmp`, không thêm dependency vào repository. Khi chạy browser đặt PLAYWRIGHT_MODULE trỏ module Playwright và CHROME_PATH trỏ executable có sẵn; khi chạy PostgreSQL cần PGlite cục bộ. Các lệnh trên không tự cài dependency hoặc deploy.

## Secret cần người dùng cấu hình riêng

Giữ hai giá trị Sandbox hiện có: `SEPAY_SANDBOX_MERCHANT_ID`, `SEPAY_SANDBOX_SECRET_KEY`. Bổ sung `SEPAY_SANDBOX_IPN_SECRET` bằng đúng khóa IPN đã cấu hình bên SePay. Tự cấu hình riêng trong dashboard, không gửi giá trị qua chat, không đưa vào Git, code frontend, ảnh chụp hay log. Khóa nên riêng biệt, ngẫu nhiên, dài ít nhất 32 ký tự. Không copy cả đoạn PHP/JS vào Value.

Trong SePay, bật Test Mode → Cổng thanh toán → Cấu hình → IPN:

1. URL: `https://qibpsehkmzjwusllorbf.supabase.co/functions/v1/sepay-sandbox-ipn`.
2. Auth Type: SECRET_KEY, không chọn NONE.
3. Đặt khóa IPN riêng và lưu cùng giá trị ở Supabase → Edge Functions → Secrets, Name `SEPAY_SANDBOX_IPN_SECRET`, Value chỉ giá trị khóa, không dấu nháy/khoảng trắng.

Bản sửa vẫn trả 503 `ipn_not_configured` nếu chưa làm bước cấu hình này. Chỉ deploy code không thể thay thế cấu hình còn thiếu. Chưa thực hiện bất kỳ bước cấu hình hay triển khai nào ở trên.

## Kiểm tra lại sau khi được phê duyệt triển khai

1. Review bản sửa, phê duyệt riêng trước khi triển khai backend/frontend. Khi triển khai phải giữ IPN không yêu cầu JWT Supabase (`verify_jwt: false`); bảo vệ bằng khóa IPN riêng. Không bật Live Mode hoặc dùng QR ngân hàng thật.
2. Cấu hình IPN/Secret như trên. Trong bản sửa, POST thiếu/sai header phải nhận 401; GET bằng trình duyệt nhận 405 là đúng. Không log giá trị header để kiểm tra.
3. Trên CloudFit, tạo một phiếu **Sandbox** hợp lệ qua luồng chat mẫu → phiếu → Thanh toán qua SePay Sandbox; dùng dữ liệu giả lập. Ghi mã CFSBX và số tiền thử từ phiếu, không sửa bản ghi trực tiếp trong DB.
4. Thực hiện thanh toán giả lập tại SePay Sandbox. Kiểm tra callback ORDER_PAID dùng mã hóa đơn/số tiền đã lưu, VND, BANK_TRANSFER, trạng thái CAPTURED/APPROVED. Callback hợp lệ nhận HTTP 200 JSON success true sau khi DB chấp nhận.
5. Nếu dùng nút gửi test IPN với mã hóa đơn ví dụ chưa tồn tại, nhận 409 payment_not_matched là đúng; mẫu CARD không thuộc phương thức BANK_TRANSFER của CloudFit sẽ bị từ chối. Không đổi handler thành luôn trả 200 để làm nút test hiện xanh.
6. Quay lại CloudFit: khi DB pending hoặc API lỗi, không có popup dù URL success. Chỉ khi API đọc đúng hóa đơn Sandbox paid mới có popup “Thanh toán thành công — Cảm ơn quý khách đã tin tưởng và sử dụng CloudFit”. Nhãn thử nghiệm và thông báo không phát sinh tiền thật vẫn hiển thị.
7. Gửi lại đúng IPN: không tạo giao dịch/outbox/thông báo trùng; thử thất bại/void, sai khóa, sai tiền và invoice không tồn tại: không được đánh dấu paid hoặc mở popup. Kiểm tra Telegram thật chỉ sau khi được phép gửi tin test, dùng nhãn THỬ NGHIỆM.

Chưa xác minh thực tế: SePay chấp nhận merchant credentials của người dùng, cấu hình Auth Type/khóa ở dashboard, IPN có khóa thật đến bản sửa trên Supabase, settlement trên DB hosted, trigger gọi notifier và nhận tin Telegram thật, popup trên bản website đã deploy. Các bước này cần cấu hình của người dùng và phê duyệt triển khai; không được coi kết quả mock/local là xác nhận end-to-end thật.
