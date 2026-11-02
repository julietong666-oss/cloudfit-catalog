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
