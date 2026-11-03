# Đã deploy và kiểm chứng SePay Sandbox qua API — 03/11/2026

Website https://cloudfitk.vercel.app, deployment `dpl_BnHbBDxwxKut78aPYt4ZtBpRqqj6` READY. Edge Functions: sepay-sandbox v12, sepay-sandbox-ipn v11. 20/20 assets live khớp build. Đã thử một hóa đơn giả lập 10.000 VND: SePay Sandbox chấp nhận checkout, nút Giả lập thanh toán tạo giao dịch thử, API xác nhận → DB paid → payment_verified=true → popup đúng nội dung; Telegram ghi sent/message 14, một delivery. Không có tiền thật, không đổi schema/RLS/Secrets.

Checkout đã tách phụ thuộc khóa IPN để dùng xác minh API độc lập. IPN riêng vẫn báo cấu hình khóa có ký tự không hợp lệ; nút onboarding thiếu header vẫn bị từ chối, không làm thành công giả. Đã kiểm popup bằng callback URL SePay cung cấp trong phiên tạo đơn; chưa xác minh tự động redirect từ trang SePay. Bằng chứng phát hành: `Docs/sepay-api-release-2026-11-03.json`. 82 tests cuối cùng và browser fixture với callback có tham số bổ sung đạt. Mã nguồn được đồng bộ lên nhánh main của GitHub; các mốc chưa commit/chưa deploy bên dưới là lịch sử chuẩn bị. Các mục dưới là lịch sử chuẩn bị.

# Xác minh thanh toán bằng API SePay Sandbox — local, chưa deploy

Bổ sung xác minh server-to-server qua API chi tiết đơn hàng chính thức trước settlement. Khi IPN thiếu/đến chậm, nút kiểm tra trạng thái vẫn có thể đối chiếu SePay bằng Merchant credentials ở backend. Frontend chỉ mở popup khi DB đã paid và backend trả payment_verified=true. Giữ xác thực IPN, không làm nút test thiếu khóa thành công giả. Không đổi schema/RLS/Secrets, không deploy hoặc gửi giao dịch/Telegram thật. 81 Node tests, check/build, Deno/SDK, PostgreSQL local và browser 390/1440px đạt. Chi tiết và 13 file thay đổi: `Docs/sepay-api-verification-2026-11-03.md`. Các mốc phía dưới là lịch sử.

# Sửa IPN Sandbox — 2026-11-03 (local, chưa deploy)

Đã xác nhận POST hiện trả 503 `sandbox_not_configured` từ guard cấu hình của handler version 3; không phải gateway chặn JWT (cả ba function có `verify_jwt: false`). Thiếu `SEPAY_SANDBOX_IPN_SECRET` đủ gây lỗi này trước khi truy cập DB. Khóa IPN độc lập với khóa merchant, phải được cấu hình khớp ở tab IPN SePay và Supabase.

Bản sửa local tách xác thực IPN khỏi merchant credentials, phân biệt lỗi cấu hình/DB, giữ kiểm tra khóa và settlement nguyên tử. Popup chỉ mở từ trạng thái backend hợp lệ; nút mô phỏng không mở popup. Đạt 72 Node tests, kiểm tra cú pháp/build, Deno/SDK, PostgreSQL cục bộ và browser fixture 390/1440px. Không deploy, không ghi thử Supabase/SePay/Telegram. Báo cáo và danh sách file: `Docs/sepay-ipn-debug-2026-11-03.md`. Các mục phía dưới là lịch sử trước bản sửa.

# SePay Sandbox đã phát hành — 2026-11-03

Website https://cloudfitk.vercel.app đã deploy bản SePay Sandbox `dpl_7nrm5f5SHdCgDUQk8nwM8fGancdF` READY. Thêm checkout qua SDK Node.js chính thức, lưu hoá đơn thử, endpoint IPN có xác thực, cập nhật paid nguyên tử, thông báo Telegram gắn nhãn THỬ NGHIỆM và popup dựa trên trạng thái backend. Success URL không phải bằng chứng thanh toán. Không dùng QR ngân hàng thật hoặc kích hoạt dịch vụ thật trong Sandbox.

Đã áp dụng schema sandbox và phát hành 3 Edge Functions version 2; đã chuyển trigger Telegram từ tạo yêu cầu tư vấn sang hoá đơn Sandbox paid. Form tư vấn lưu thành công tự mở khung chat, giữ ngữ cảnh tên/điện thoại/gói/mã yêu cầu, nhưng chat giữa nhân viên thật và khách chưa có backend. Khung yêu cầu thật hiển thị Chờ phân công, không dùng admin/delivery giả.

**Người dùng cần lưu 3 Secrets Sandbox và cấu hình IPN bên SePay** để chạy với tài khoản của mình. Hướng dẫn tại `Docs/sepay-sandbox-setup.md`; không gửi khóa qua chat. Code mẫu đã cung cấp chứa placeholder, không được dùng làm cấu hình. Chưa kiểm một giao dịch Sandbox thật qua tài khoản người dùng hoặc nhận tin Telegram thật.

Kiểm chứng: 63 Node tests, check/build (20 files), Deno check + test SDK, SQL PostgreSQL cục bộ, browser fixture và frontend production 390/1440 qua API intercept đều đạt; 20/20 assets live byte-identical. Không gửi request ghi thử vào Supabase/Telegram/SePay thật. Hash phát hành: `Docs/sepay-sandbox-release-2026-11-03.json`. Source đang local chưa commit/push mới, base Git 9a8aa1b. Các mốc phía dưới là lịch sử.

# Chuẩn bị luồng thật — 2026-11-03 (chưa deploy)

Đã nhận và giữ nguyên QR Vietcombank doanh nghiệp tại `catalog/company-payment-qr.jpg`. Đã nối UI form tư vấn → chat sau khi API xác nhận lưu, giữ tên/số điện thoại/gói/mã yêu cầu, hiển thị Chờ phân công. Chat thật chưa có backend hội thoại nên phần nhu cầu bổ sung vẫn chỉ trong trang và có ghi rõ; tách khỏi công cụ thanh toán mô phỏng. 55 tests, check/build và browser form→chat 390/1440px qua API giả lập đạt.

Người dùng đã cho phép mở rộng backend và chọn nhận tiền tự động. Khuyến nghị SePay để kết nối Vietcombank thật; chờ chủ tài khoản tạo/liên kết dịch vụ và xác minh QR/VA trước khi bật thanh toán. **Chưa nối webhook, chưa chuyển Telegram sang hoá đơn đã trả, chưa thay QR mặc định của checkout mẫu, chưa deploy/push các thay đổi mới.** Chi tiết, nguồn chính thức và điều kiện triển khai ở `Docs/live-payment-integration.md`. Mốc production bên dưới vẫn là bản trước.

# Đã deploy QR giả lập và toàn bộ cập nhật — 2026-11-03

Production **https://cloudfitk.vercel.app** — deployment **dpl_GejSsQc9Mk3XCpFsXrshxvQPXuzx**, **READY**. Phát hành toàn bộ nội dung tư vấn, CTA/chat mẫu, phân công admin mẫu, phiếu mua trong chat, thanh toán giả lập và popup cảm ơn. Tạo sẵn `catalog/demo-payment-qr.svg`; QR chỉ mã hoá `CLOUDFIT DEMO ONLY | NOT A BANK PAYMENT | NO REAL MONEY`, không chứa ngân hàng/tài khoản hoặc lệnh chuyển tiền. Dùng mặc định cho mọi phiếu, vẫn có thể chọn ảnh thay thế hoặc bấm **Dùng lại QR giả lập**.

Cách thử: **Tư vấn trực tiếp** → trả lời 5 câu → **Soạn phiếu xác nhận mua** → **Điền dữ liệu mẫu** → **Gửi phiếu vào chat** → **Thanh toán** để xem QR → trong Góc admin chọn **Mô phỏng nhận đủ tiền** để thấy popup. Thanh toán/huỷ/nhận tiền chỉ là mô phỏng trong bộ nhớ trình duyệt; không đăng ký hoặc kích hoạt gói thật, không gọi dịch vụ ngân hàng. Gửi form tư vấn gói hiện có vẫn dùng API thực như trước; không dùng thông tin thật để thử luồng mẫu.

Backend `telegram-notify` đã phát hành version **9 ACTIVE**, cập nhật cách gọi sang yêu cầu tư vấn cho mẫu Telegram và chỉ dẫn tóm tắt Gemini hiện có. Đã đối chiếu source live trước/sau: handler, xác thực token, claim/chống trùng và transport giữ nguyên; `verify_jwt=false` được giữ đúng cấu hình cũ vì function tự xác thực. Không đổi schema/RLS/RPC/Auth/env/secret và không gửi thử thật.

Kiểm chứng: **54/54 tests**, syntax check, build **18 runtime files**, `git diff --check` đạt. **18/18 assets production HTTP 200 và byte-identical với build.** Browser trước deploy và trên production đạt ở **390/1440px**, gồm phiếu/huỷ, QR mặc định, đổi/reset ảnh, đúng/sai số tiền, từ chối sự kiện sau huỷ, popup chỉ sau xác nhận nhận tiền mô phỏng, tách hội thoại khách hàng và không gửi POST ra dịch vụ thật. QR trong ảnh chụp production giải mã độc lập bằng ZXing cho đúng payload ở cả hai kích thước. Smoke test production chỉ đọc catalog thực, kiểm tìm kiếm/chi tiết/form tư vấn và gói quan tâm trong chat; không submit form thật. Runtime errors Vercel 1 giờ gần nhất: 0; chưa cấu hình drain riêng. Chưa kiểm nhận Telegram thật hoặc tiền thật trong đợt này.

Deployment từ snapshot source local (base Git `5ac1881`, có thay đổi chưa commit), không commit/push Git. Bản trước để rollback frontend: `dpl_FHZL6EyZVfq9L7bdUQTHeKSrVoGs`; backend trước đó: telegram-notify v8. Hash runtime và bằng chứng lưu tại `Docs/consultation-release-2026-11-03.json`. Tài liệu lịch sử “chưa deploy” phía dưới đã được mốc này thay thế. Công cụ tạo/giải mã QR chỉ dùng trong `/tmp/cloudfit-qr-tools`; không thêm dependency vào runtime website.

# Phiếu mua và thanh toán trong chat mẫu — 2026-11-02 (local, chưa deploy)

Theo lựa chọn của chủ dự án, mở rộng **bản mẫu tương tác**, chưa kết nối thanh toán thật. Sau 5 bước tư vấn, Góc admin cho soạn và gửi phiếu vào hội thoại: tên pháp lý doanh nghiệp, mã số thuế, địa chỉ, đại diện/liên hệ, điện thoại, email, gói, số người dùng, thời hạn và tổng thanh toán VND đã gồm thuế/phí. Có điền dữ liệu giả lập; giá mẫu 12 triệu chỉ phục vụ thử giao diện, không phải báo giá.

Khách xem phiếu ngay trong chat, có **Thanh toán** và **Huỷ**. Thanh toán chỉ chuyển `offered → awaiting_payment`, hiện QR và nội dung chuyển khoản theo mã phiếu. Admin mẫu có thể chọn **ảnh QR ngân hàng cố định** từ máy (PNG/JPG/WebP ≤5 MB); cùng một ảnh được dùng cho tất cả phiếu/khách trong trang. Ảnh chỉ ở bộ nhớ với blob URL, không tải lên dịch vụ ngoài, không lưu qua reload. Chưa có ảnh QR doanh nghiệp thật trong repository; khi chưa chọn ảnh, UI hiển thị vị trí chờ QR, không tạo mã ngân hàng giả.

**Chỉ sự kiện nhận đủ tiền khớp phiếu mới chuyển sang `paid` và mở popup “Đã đăng ký gói thành công” kèm lời cảm ơn.** Bản mẫu có công cụ “Mô phỏng hệ thống thanh toán” riêng với hai ca nhận đủ tiền/sai số tiền, không có nút khách tự xác nhận đã nhận tiền. Mới gửi phiếu, mở QR, sai số tiền, sai phiếu/loại tiền, giao dịch ghi nợ hoặc thông báo sau huỷ đều không báo đăng ký thành công. Sự kiện lặp không thêm thông báo thành công; phiếu đã trả không huỷ/làm lại; chỉ tạo phiếu mới sau huỷ và giữ lịch sử phiếu cũ. Mọi kết quả thành công được ghi rõ là mô phỏng.

Không có order/payment backend, webhook ngân hàng, kích hoạt gói hoặc xác nhận chuyển khoản thật. Logic ở client chỉ phục vụ thiết kế, không được dùng làm bằng chứng thanh toán. Khi triển khai thật cần backend xác minh sự kiện từ dịch vụ nhận tiền, đối chiếu đúng tài khoản/mã phiếu/số tiền/VND và cập nhật thanh toán/đăng ký nguyên tử, chống lặp; phiếu đã huỷ nhưng tiền đến cần đối soát. Không đổi DB/schema/RLS/RPC/env/xác thực; không gửi dữ liệu thật vào Supabase/Telegram và chưa deploy.

Đã kiểm: 54/54 Node tests; `check`, `build` (17 files), cú pháp script browser và `git diff --check`. Playwright với Chrome 2 đạt luồng chat cũ và luồng phiếu/huỷ/QR/popup ở 390/1440px; chặn mọi API ngoài, không phát sinh POST thật. Ảnh test upload chỉ là ảnh PNG 1 pixel, không phải QR ngân hàng. Đã kiểm ảnh giao diện mobile/desktop. Chạy `node tests/serve-fixtures.mjs`, sau đó `npm run test:checkout:ui` với `PLAYWRIGHT_MODULE`/`CHROME_PATH` như phần dưới. Chưa kiểm nhận tiền, giao dịch hoặc thông báo khách hàng thật.

File thêm: `catalog/chat-order.mjs`, `tests/chat-order.test.mjs`, `tests/chat-order-browser.mjs`. File sửa: `catalog/chat-ui.mjs`, `catalog/chat.css`, `code.html`, `scripts/build-static.mjs`, `package.json`, `README.md`. Giữ thay đổi các lần trước.

# Chat tư vấn mẫu — 2026-11-02 (local, chưa deploy)

CTA trên header đã đổi thành **Tư vấn trực tiếp**, mở dialog chat theo thiết kế CloudFit. **Đăng nhập Admin** chuyển xuống footer, giữ route `#identity` và module xác thực hiện có. Chat có 5 bước: quy mô người dùng nội bộ/khách hàng cuối, bối cảnh công ty, mong muốn, ngân sách, thời gian triển khai. Có gợi ý trả lời, nhập tự do, tóm tắt cập nhật, làm lại và giữ ngữ cảnh gói đang xem nếu có.

Tên admin phụ trách xuất hiện trên đầu hội thoại và trong phần thông tin khách hàng. Mở **Xem phân công khách hàng · dữ liệu mẫu** để xem ba khách hàng mẫu, admin phụ trách và tiến độ; chọn từng khách để kiểm tra các hội thoại độc lập. Tên admin, khách hàng và phân công là fixture của bản thiết kế, không lấy từ Auth hoặc DB thật. Không hiển thị trạng thái online hoặc xác nhận đã gửi cho admin thật.

Phạm vi: bản mẫu tương tác với phản hồi theo kịch bản cố định, không phải chat trực tiếp đã tích hợp. Module chat không gọi API/AI, không ghi Supabase/Telegram, không dùng localStorage/sessionStorage; nội dung chỉ ở bộ nhớ trang, tải lại sẽ mất. Chưa thay đổi schema, RLS, RPC, biến môi trường hoặc xác thực. Chưa có backend hội thoại, quyền xem theo phân công, phân công thật, giao diện admin trả lời hoặc Realtime. Không dùng dữ liệu khách hàng thật để thử mẫu.

Đã kiểm: 47/47 Node tests; `check`, `build` (16 runtime files), `git diff --check`. Browser bằng Playwright với Chrome 2 đạt ở 390/1440px: mở/đóng/Escape/trả focus, đủ 5 bước, tóm tắt, phân công, tách biệt khách hàng, làm lại, render nội dung như văn bản, không tràn dialog, CTA không bị auth đổi nhãn và link Admin ở footer hoạt động. Đã xem ảnh chụp mobile/desktop. API ngoài bị chặn trong browser test; chỉ cho phép CDN Tailwind và font hiện có. Không kiểm chat với admin thật vì chưa có backend. Không commit/push/deploy.

Chạy `node tests/serve-fixtures.mjs` rồi `npm run test:chat:ui`; dùng `PLAYWRIGHT_MODULE` và `CHROME_PATH` trỏ tới thư viện/trình duyệt có sẵn. Phiên này dùng `CHROME_PATH='/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome'`; Chrome mặc định từng bị `spawn EPERM`.

File của bản chat: `catalog/chat.mjs`, `catalog/chat-ui.mjs`, `catalog/chat.css`, `code.html`, `scripts/build-static.mjs`, `package.json`, `tests/chat.test.mjs`, `tests/chat-browser.mjs`, `tests/layout.test.mjs`, `README.md`. Giữ các thay đổi nội dung tư vấn ở lần trước.

# Nội dung tư vấn — 2026-11-02 (local, chưa deploy)

Đã đổi form trong chi tiết gói sang **Đăng ký tư vấn gói dịch vụ**, mô tả theo nhu cầu/số lượng người dùng/ngân sách, CTA **Gửi yêu cầu tư vấn**, đồng ý liên hệ và phản hồi đang gửi/lỗi/thành công. Form hiển thị tên gói quan tâm; nút mở là **Đăng ký tư vấn gói này**. Giữ các trường, validation, UUID gửi lại, khóa gửi đồng thời và chỉ báo thành công sau API xác nhận lưu. Không thêm thanh toán/kích hoạt hoặc tư vấn AI. Mẫu Telegram và câu hướng dẫn tóm tắt Gemini hiện có chỉ đổi cách gọi sang yêu cầu tư vấn; giữ transport và luồng thông báo.

**Phạm vi đã được chủ dự án chốt trong phiên: giữ nguyên schema, hoàn tất luồng có gói.** Luồng chưa chọn gói chưa được triển khai: handler bắt buộc `product_id`; RPC chỉ nhận gói tồn tại và bảng `purchase_requests.product_id` có `NOT NULL` cùng khóa ngoại tới `products`. Không thể lưu yêu cầu chung với hợp đồng hiện tại mà không gán sai gói. Chưa thêm CTA chung dẫn vào một luồng không gửi được. Giữ nguyên schema, SQL/RPC, RLS, API intake, cấu hình và thông tin xác thực; không chuẩn bị hoặc áp dụng thay đổi nullable/RPC trong lần này theo quyết định trên.

Kiểm tra: 43/43 Node tests đạt; `check`, `build` (13 files), kiểm tra cú pháp script browser và `git diff --check` đạt. API/config/SQL intake khớp hash baseline; form được loại khỏi kiểm tra byte vì nội dung được sửa theo yêu cầu, baseline lịch sử giữ nguyên. Playwright chưa chạy được vì Chrome `spawn EPERM`; chưa xác nhận giao diện/responsive và thao tác form bằng browser. Không kiểm luồng lưu DB/nhận Telegram thật, không gửi dữ liệu thử vào dịch vụ thật. Không commit/push/deploy hoặc áp dụng DB.

`tests/purchase-browser.mjs` nay chạy với `node tests/serve-fixtures.mjs` tại port 4174: chặn tất cả request ngoài, giả lập lỗi/thành công của API, kiểm validation, gói quan tâm, khóa gửi trùng, giữ UUID khi gửi lại và trạng thái đã lưu tại 390/1440px. Script không dùng `route.continue()` cho API thật. Có thể chạy bằng `PLAYWRIGHT_MODULE`/`CHROME_PATH` như hướng dẫn phía dưới khi Chrome hoạt động. Nội dung Telegram/Gemini chỉ được cập nhật trong source backend, chưa được triển khai lên Edge Function.

Các mục bên dưới là lịch sử dự án.

# UI production — 2026-10-30

Đã tích hợp Mekong Cloud Horizon từ `Docs/DESIGN.md` lên https://cloudfitk.vercel.app, deployment `dpl_XWtBRZ3V5RiWD4QHYPQh2h6uY8XM` READY. Mốc trước sửa: `dpl_GHn83S3EayLGaTcevc6h2frk55YF`, được đối chiếu byte trực tiếp với production.

Chỉ sửa `catalog/app.mjs` và `catalog/catalog.css`: thẻ gói, bố cục chi tiết/đăng ký và style form. `purchase.mjs` cùng API/RPC được bảo toàn hash; không deploy backend, không đổi DB/secret và không gửi tin thử mới. 40 tests/check/build đạt; assets live khớp build. Browser/visual QA chưa đạt do Chrome bị spawn EPERM; chưa có ảnh QA mới. Chi tiết ở plan mục 20 và `Docs/ui-production-baseline.json`.

# Cập nhật website — 2026-10-30

Website production: https://cloudfitk.vercel.app — deployment `dpl_GHn83S3EayLGaTcevc6h2frk55YF` READY.

Chi tiết gói có nút **Đăng ký gói này**, mở form họ tên/số điện thoại và đồng ý liên hệ. Supabase `purchase-request` xác nhận lưu rồi UI mới báo đã tiếp nhận. Trigger sau commit tiếp tục Gemini → Telegram; Gemini lỗi dùng mẫu cũ, không mất yêu cầu. Không có thanh toán.

API không mở quyền đọc/ghi bảng cho client; RPC service-only xử lý gói hợp lệ, chống trùng UUID và giới hạn ba yêu cầu/số điện thoại/giờ. Client không chứa backend secrets. Cập nhật build gồm 12 runtime files.

Kiểm chứng: 40 tests, check, build đạt; API thật gửi lặp cùng ID chỉ có một bản ghi và một delivery; transaction kiểm giới hạn đã rollback. Production assets HTTP 200 khớp build, CORS 204 và POST thử 201; ca production có Gemini generated và Telegram message ID 10. Browser test Chrome bị spawn EPERM, chưa ghi nhận mobile/desktop E2E đạt. Xem `tests/purchase-browser.mjs`; chạy bằng Playwright sẵn có qua PLAYWRIGHT_MODULE và CHROME_PATH nếu cần.

Các phần dưới đây là lịch sử triển khai. Trạng thái hiện hành xem Development Plan mục 19; ghi chú cũ “chưa deploy/chưa nối UI” đã được mốc này thay thế.

# CloudFit — tìm kiếm và lọc (FR-02/03)

## Nhịp 1 — Danh tính (2026-10-26)

Đã thêm Email + Password Login, Sign up, Logout, email hiện tại và Session bằng SDK Supabase 2.118.0 ghim phiên bản, phục vụ từ source. SDK giữ/làm mới phiên và nhận callback xác nhận email; khi khôi phục trang, UI gọi `getUser()` để xác minh danh tính trước khi hiển thị email. Logout dùng scope `local`: đăng xuất trình duyệt hiện tại; các tab cùng origin được SDK đồng bộ. Không đăng xuất các thiết bị khác.

Đọc kế hoạch tại `Docs/development-plan.md` (thư mục thực tế viết hoa). Source là HTML + CSS + ES modules thuần, dùng Node test runner; không có lint/type-check/build. Baseline 13 test đạt. Thư mục không có Git, nên không có baseline Git diff.

**Cấu hình thật đã đọc:** Email enabled, đăng ký enabled, `mailer_autoconfirm=false` (Confirm Email ON). Không đổi Auth settings. Đã đọc cấu trúc/chính sách `app_members`: có sẵn `user_id`, `is_active`, `created_at`, SELECT chỉ membership của chính mình; hiện có 0 thành viên. Không thêm cột, migration, policy hoặc membership. Không triển khai màn hình Admin/phân quyền. Đăng ký không tự cấp quyền Admin.

**Đã chạy và đạt:**

- 15/15 test: 13 test cũ + 2 test danh tính, chạy bằng Node bundled. Test SDK dùng HTTP giả lập: signup không có session; A/B đăng nhập, xác minh email, khôi phục phiên bằng SDK instance mới, refresh token, logout xóa session, server vô hiệu hóa user. Đây không phải tài khoản thật.
- Kiểm tra cú pháp toàn bộ danh sách `check` trong `package.json` và các script test mới bằng `node --check`.
- Trình duyệt tích hợp với `tests/serve-auth-fixtures.mjs`: sai mật khẩu, email chưa xác nhận, signup nhắc xác nhận và không đăng nhập, A rồi B hiển thị đúng email, F5, Logout rồi F5 vẫn là guest.
- Trình duyệt trang thật: form tải được; catalog vẫn hiển thị 3 gói. Đo DOM ở viewport thực tế 375px và 1440px: `scrollWidth === innerWidth`.
- API Supabase thật: đăng nhập bằng thông tin ngẫu nhiên không tồn tại trả HTTP 400 / `invalid_credentials`; đọc lại Confirm Email ON; đọc công khai 3 gói demo trả HTTP 200. Không in mật khẩu, khóa hay token.

**Chưa kiểm:** A/B thật (chưa tạo), đăng ký/nhận/bấm email xác nhận thật, SMTP/rate limit/Redirect URL allowlist, khóa user thật, mất mạng UI thật, auto-refresh theo thời gian thực và đồng bộ nhiều tab. Test refresh/invalidation SDK là giả lập. Chrome headless đã thử nhưng bị `spawn EPERM` cả ngoài sandbox; không ghi nhận Playwright E2E là đạt. Chưa kiểm quyền Admin/RLS Nhịp 2.

**Tự kiểm với project thật:**

1. Chạy `npm start` (hoặc Node bundled như hướng dẫn bên dưới), mở http://127.0.0.1:4173/#identity. Nếu Node/npm không có trong PATH, chạy `/Users/kylie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/serve.mjs`.
2. Trong Supabase Authentication → URL Configuration, kiểm tra URL local đang dùng được cho phép redirect về. Form gửi `emailRedirectTo` về origin/path hiện tại; cần allowlist đúng URL này. Không tắt Confirm Email. Cấu hình redirect chưa được tự sửa.
3. Đăng ký bằng email bạn nhận được thư. Phải thấy nhắc xác nhận, chưa có email đang đăng nhập. Đăng nhập trước xác nhận phải bị từ chối. Mở thư xác nhận (kể cả thư rác), bấm link rồi đăng nhập lại nếu cần.
4. Để thử nhanh A/B, trong Authentication → Users → Add user → Create new user, tạo hai tài khoản thử với **Auto confirm** riêng cho từng tài khoản. Tự nhập mật khẩu và giữ riêng; không dùng thông tin khách thật. Tùy chọn này không thay thế Confirm Email trong cấu hình đăng ký thật. Không cần thêm hai tài khoản vào `app_members` để kiểm danh tính.
5. Đăng nhập A, kiểm đúng email trên form/header; F5 vẫn A. Đăng xuất, F5 phải là guest. Đăng nhập B, F5 phải đúng B, không còn email A. Thử sai mật khẩu, ngắt mạng và thử lại. Có thể dùng tab thứ hai cùng origin để kiểm đồng bộ phiên.
6. Tài khoản đăng ký mới chưa là Admin. Giữ kiểm tra phân quyền, khóa thành viên và dữ liệu phân công sang Nhịp 2.

**Chạy kiểm thử:** `npm test`, `npm run check`. UI fixture: `npm run test:auth:ui`, mở http://127.0.0.1:4175/#identity. Server fixture ghi “HTTP giả lập”, chấp nhận thông tin thử tại local và không gọi Auth thật; không phát hành server này. Dùng email fixture `a@example.com`, `b@example.com`, `wrong@example.com`, `unconfirmed@example.com` để thử các trạng thái. Không nhập mật khẩu thật vào fixture.

**File đổi/thêm trong Nhịp 1:** `code.html`, `catalog/catalog.css`, `catalog/auth.mjs`, `catalog/auth-ui.mjs`, `catalog/vendor/supabase-2.118.0.js`, `catalog/vendor/supabase-LICENSE`, `catalog/vendor/README.md`, `scripts/serve.mjs`, `package.json`, `tests/auth.test.mjs`, `tests/serve-auth-fixtures.mjs`, `tests/serve-fixtures.mjs` (MIME JavaScript cho SDK), `README.md`. Giữ nguyên `catalog/app.mjs`, `catalog/data.mjs`, cấu hình khóa công khai và toàn bộ SQL.

Không commit/push/deploy. Tài liệu Supabase đối chiếu: [signUp](https://supabase.com/docs/reference/javascript/auth-signup), [Auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).

## Kết nối Supabase và khách hàng demo — 2026-10-23

Website hiện đọc trực tiếp Supabase qua `catalog/data.mjs`, không tải `products.json` ở chế độ chạy thật. Gồm ba gói có `is_demo = true` và ba khách hàng giả lập trong `demo_customers`. Khu vực “Khách hàng demo” ghi rõ dữ liệu giả; email dùng `example.com`. Không nhập khách hàng thật vào bảng demo công khai.

Chạy local bằng lệnh bên dưới, mở http://127.0.0.1:4173/#catalog. Đã cấu hình URL và publishable key trong `catalog/supabase-config.mjs`; đây là khóa dành cho trình duyệt. Không cần khóa quản trị hay cài thêm thư viện. Chưa deploy website.

RLS chỉ cho phép xem công khai sản phẩm demo; sản phẩm nội bộ vẫn cần thành viên hoạt động. `app_members` vẫn riêng tư; client không được ghi vào các bảng. Nút chọn chỉ xác nhận trên màn hình, không lưu khách hàng, đơn hàng hay lựa chọn.

Đã kiểm chứng: 13 unit tests đạt; trình duyệt hiển thị ba gói và ba khách hàng từ Supabase, tìm Vertex AI trả đúng một gói, mở đúng chi tiết và quay lại giữ từ khóa. Kiểm tra SQL xác nhận bản ghi nội bộ không lộ cho người ngoài, còn thành viên hoạt động đọc được. Security Advisor không có cảnh báo. Chưa triển khai giao diện đăng nhập nội bộ.

Kiểm thử UI fixture dùng máy chủ 4174 thay thế lớp `data.mjs` bằng nguồn fixture tại chỗ để không gọi Supabase. Các báo cáo kiểm thử cũ bên dưới là lịch sử; số test/lệnh mới xem `package.json` (`npm test`, `npm run check`).

## Chạy local

Dự án giữ HTML + Tailwind CDN của bản mẫu, dùng ES modules thuần; không có thư viện mới cần cài. Node 22+:

```sh
node scripts/serve.mjs
```

Mở http://127.0.0.1:4173. Không mở bằng file:// vì danh mục được tải bằng fetch.

Trên môi trường Codex hiện tại, Node không nằm trong PATH, có thể thay `node` bằng:
`/Users/kylie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`.

## Kiểm thử

```sh
node --test tests/logic.test.mjs
node --check catalog/logic.mjs
node --check catalog/app.mjs
node --check scripts/serve.mjs
```

Để tự thử với fixture giả định A/B/C (không phải sản phẩm Google Cloud):

```sh
node tests/serve-fixtures.mjs
```

Mở http://127.0.0.1:4174. Máy chủ này chỉ phục vụ fixture trong kiểm thử, không đổi dữ liệu website chính. Ghi `empty`, `error`, `invalid` vào `tests/.test-mode` rồi tải lại để thử danh mục rỗng, HTTP 500 hoặc nhãn thiếu. Ghi `products` để trở lại fixture. Không phát hành máy chủ kiểm thử.

`tests/browser.mjs` là kịch bản Playwright tự động cho các tương tác và viewport 375/1440. Nó cần Playwright đã có sẵn và Chrome; không tự cài thư viện. Có thể cấu hình `PLAYWRIGHT_MODULE` (đường dẫn module Playwright) và `CHROME_PATH`. Khởi động website ở 4173 trước khi chạy. Trong phiên triển khai, Chrome headless bị `spawn EPERM`; kịch bản chưa chạy thành công, kiểm thử UI được thực hiện bằng trình duyệt tích hợp thay thế.

## Dữ liệu cần duyệt

`catalog/products.json` là nguồn duy nhất cho danh mục, tìm kiếm, lọc và chi tiết; hiện có ba gói giải pháp mẫu theo ảnh người dùng yêu cầu bổ sung: Startup Foundation Stack, Modern AI-Ready SaaS, Smart Workspace & Sync. Nội dung, giá tham chiếu và nhãn minh họa được ghi rõ chưa xác minh; không phải báo giá hoặc danh sách sản phẩm chính thức.

Mỗi bản ghi sau khi được duyệt cần `id` duy nhất, `name`, `shortDescription`, `needTags` không rỗng chứa một hoặc nhiều giá trị chính xác: `Lưu trữ`, `Tích hợp`, `Cộng tác`; `detailDescription` là chuỗi tùy chọn. Mô tả chi tiết thiếu được thông báo rõ. Nhãn thiếu/sai hoặc ID trùng hiển thị lỗi dữ liệu và nút thử lại, không âm thầm gán nhãn.

Tìm không phân biệt hoa thường, trim hai đầu, chỉ trong tên và hai trường mô tả. Điều kiện từ khóa và nhu cầu kết hợp AND. “Tất cả” chỉ bỏ điều kiện nhu cầu. State được giữ trong sessionStorage của tab; khi storage bị chặn vẫn thao tác được bằng bộ nhớ trong trang. Chi tiết dùng hash `#product/<id>`.

## Kết quả kiểm chứng — 2026-10-19

- PASS: 9 unit tests với Node test runner, 0 fail.
- PASS: kiểm tra cú pháp ba module ứng dụng/máy chủ bằng `node --check`.
- PASS bằng trình duyệt tích hợp với fixture: tìm tên/mô tả ngắn/chi tiết, hoa thường, khoảng trắng, từ khóa không khớp; ba nhóm lọc, sản phẩm nhiều nhãn, AND; xóa từ khóa giữ nhóm, đổi nhóm giữ từ khóa, đặt lại, xóa điều kiện.
- PASS: mở đúng chi tiết, liên kết quay lại, Browser Back, khôi phục state sau tải lại.
- PASS: Enter/Space kích hoạt nút; focus input sau reset; label và trạng thái `aria-pressed`.
- PASS: danh mục rỗng không bị hiểu thành không khớp tìm kiếm; dữ liệu thiếu nhãn báo lỗi; HTTP 500 có thử lại và phục hồi.
- PASS: 375px (`scrollWidth = innerWidth = 375`) và desktop 1440px (`scrollWidth = innerWidth = 1440`), bộ lọc xuống dòng, thao tác chi tiết trên mobile.
- BLOCKED: tự động hóa Chrome headless (`spawn EPERM`). Không ghi nhận kịch bản Playwright là pass.
- N/A: lint, type-check, build — repository ban đầu không có cấu hình/lệnh tương ứng; JavaScript thuần và HTML tĩnh không cần bước build. Syntax check không thay thế lint/type-check.

## File và phạm vi thay đổi

- `code.html`: thay vùng tìm kiếm/bộ lọc trang chính bằng danh mục có dữ liệu; liên kết module/CSS và đồng bộ tìm kiếm header. Giữ phần gói giải pháp gốc trong vùng mở rộng có cảnh báo chưa xác minh; không sửa logic gợi ý/so sánh.
- `catalog/app.mjs`: UI, tải dữ liệu, trạng thái, chi tiết và điều hướng.
- `catalog/logic.mjs`: tìm/lọc, kiểm tra schema và state phiên.
- `catalog/catalog.css`: bố cục, focus, nút chọn, responsive theo màu/font hiện có.
- `catalog/products.json`: nguồn chung của ba gói mẫu theo ảnh người dùng.
- `scripts/serve.mjs`, `package.json`: chạy local và lệnh kiểm tra, không thêm dependencies.
- `tests/fixtures.mjs`, `tests/logic.test.mjs`, `tests/browser.mjs`, `tests/serve-fixtures.mjs`: fixture và kiểm thử.
- `README.md`: hướng dẫn và báo cáo này.

Chưa thể nghiệm thu với sản phẩm thật cho đến khi chủ dự án duyệt nội dung và nhãn. Hero/footer cũ vẫn có các tuyên bố về giá, hiệu quả, đối tác; chưa được xác minh, cần chủ dự án rà soát riêng trước phát hành. PRD/Development Plan giữ nguyên. Không deploy.

## Cập nhật theo ảnh gói giải pháp

- Bổ sung ba gói từ ảnh vào nguồn danh mục, tìm được theo tên và thành phần trong mô tả (Cloud SQL, Vertex AI, Gmail...).
- Giá giữ đúng số liệu trong ảnh và ghi rõ chưa xác minh. Các nhãn nhu cầu là minh họa, cần duyệt trước dùng thật. Không chép các khẳng định hiệu năng/tiết kiệm/chứng nhận sang danh mục mới.
- Chi tiết có nút “Chọn gói này”, chỉ xác nhận lựa chọn trong giao diện; không tạo đơn hoặc thanh toán. Luồng đặt mua thực tế cần nơi nhận đơn và yêu cầu riêng.
- Kiểm thử sau cập nhật: 10/10 unit tests pass; cú pháp app pass; trình duyệt xác nhận ba thẻ hiển thị, từ khóa Vertex AI khớp đúng một gói, mở đúng chi tiết và hiện xác nhận đúng tên gói.
- File cập nhật lần này: catalog/products.json, catalog/app.mjs, catalog/catalog.css, tests/logic.test.mjs, README.md.


## Build cho Vercel

Chạy `npm run build` để tạo `dist/` gồm đúng 11 file runtime. `index.html` và `code.html` cùng nội dung để cả `/` và `/code.html` hoạt động. `vercel.json` dùng framework Other, bỏ bước install (không có dependency npm), chạy script build và chỉ phục vụ `dist/`. Tài liệu Docs, tests, SQL Supabase và bản sao DB không nằm trong output. `dist/` và `.vercel/` không commit.

Build/deploy không chạy SQL Nhịp 2, không sửa RLS hay cấu hình Auth. Login thật và link xác nhận email trên domain Vercel cần kiểm chứng riêng với tài khoản/email do chủ dự án quản lý.
