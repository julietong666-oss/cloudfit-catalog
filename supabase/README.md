# Supabase — CloudFit nội bộ

## Cập nhật chế độ demo — 2026-10-23

Đã áp dụng migration `enable_synthetic_demo_catalog_and_customers` (bản SQL ở `demo-access.sql`) sau migration khởi tạo. `products.is_demo` mặc định false; chỉ ba gói mẫu hiện có được đánh dấu true và cho phép đọc công khai. `demo_customers` chỉ chứa ba khách hàng giả lập, có email `example.com`, được đọc công khai và không cho client ghi. Bảng này tuyệt đối không dành cho khách hàng thật.

Website đã kết nối Supabase bằng publishable key, lọc `is_demo = true`; hiển thị danh mục và khách hàng demo. Không có fallback sang JSON khi lỗi. Quyền thành viên nội bộ vẫn được giữ cho sản phẩm không phải demo. Các ghi chú về website chưa kết nối bên dưới mô tả thời điểm khởi tạo, đã được thay thế bởi cập nhật này.

`verify.sql` đã cập nhật theo quyền demo: kiểm tra người ngoài xem đúng ba gói, không thấy sản phẩm nội bộ thử; thành viên hoạt động thấy cả nội bộ, thành viên bị vô hiệu hóa chỉ thấy demo. Dữ liệu thử được rollback. Seed khách hàng nằm trong `demo-seed.sql`. Đã kiểm chứng qua trình duyệt và SQL; 13 unit tests đạt, Security Advisor không có cảnh báo.

Đã khởi tạo ngày 2026-10-23 theo xác nhận của chủ dự án.

- Tổ chức: JK Company.
- Project: `cloudfit-internal` (`qibpsehkmzjwusllorbf`).
- Khu vực: Singapore (`ap-southeast-1`).
- Dashboard: https://supabase.com/dashboard/project/qibpsehkmzjwusllorbf
- API URL: https://qibpsehkmzjwusllorbf.supabase.co

## Cấu trúc và dữ liệu

- `products`: ba gói lấy từ `catalog/products.json`; giữ nguyên ID và nội dung mẫu, giá hiển thị và ghi chú chưa xác minh. Tên trường trong database dùng snake_case; khi nối giao diện cần ánh xạ sang camelCase đang dùng.
- `app_members`: `user_id` tham chiếu Supabase Auth, `is_active` và thời điểm tạo. Hiện chưa cấp quyền cho người dùng thật nào.
- Không có bảng đơn hàng, tư vấn hoặc lịch sử lựa chọn.

`schema.sql` là bản sao DDL đã áp dụng bằng migration từ xa `create_internal_catalog`, không phải migration CLI tự sinh. `seed.sql` nạp ba gói và bỏ qua ID đã có, không ghi đè nội dung chỉnh sửa. Không chạy lại schema trên project đã có bảng.

## Quyền truy cập

RLS được bật trên cả hai bảng. Người chưa đăng nhập không được đọc/ghi. Tài khoản đăng nhập chỉ đọc được dòng thành viên của chính mình; chỉ thành viên có `is_active = true` mới đọc được sản phẩm. Client không có quyền tạo/sửa/xóa sản phẩm hoặc thành viên. Quản trị Supabase quản lý dữ liệu và cấp quyền; người dùng không tự cấp quyền cho mình.

Để cấp quyền lần đầu, tạo người dùng bằng quy trình Supabase Auth được chọn, rồi quản trị thêm UUID của người đó vào `app_members`. Chưa chọn phương thức đăng nhập hoặc tạo tài khoản thật; không tự gửi thư mời. Không dùng secret/service_role key trong trình duyệt.

## Kiểm chứng ngày 2026-10-23

Đã chạy `verify.sql` bằng Supabase SQL: tạo người dùng thử trong transaction rồi rollback toàn bộ. Kiểm tra vai trò anon và authenticated với claims mô phỏng: người ngoài bị chặn; thành viên hoạt động đọc đúng ba gói; thành viên bị vô hiệu hóa không đọc được; client không có quyền ghi. Không giữ lại tài khoản/thành viên thử. Security và performance advisors không trả về cảnh báo.

Đây là kiểm chứng tại database; chưa phải kiểm thử đăng nhập/API từ trình duyệt. Webapp vẫn đọc JSON và chưa kết nối Supabase. Bước tiếp theo là chọn cách đăng nhập, cấp quyền cho thành viên thật, kết nối UI và kiểm chứng đầu-cuối.


## Telegram — chuẩn bị tích hợp ngày 2026-10-30

Chủ dự án đã duyệt tích hợp thực tế cho **yêu cầu đăng ký mua gói mới**, Admin lớn nhận, kênh liên hệ là số điện thoại. Giữ project `cloudfit-internal` (`qibpsehkmzjwusllorbf`); xem mục 17 của `Docs/development-plan-updated.md` cho quyết định mới thay giới hạn bài thử độc lập trước đó.

- Đã chuẩn bị transport `functions/_shared/telegram.mjs`; đây chưa phải Edge Function có entrypoint và chưa deploy. Module chỉ gửi bản ghi do backend tin cậy cung cấp; caller phải xác minh bản ghi đã commit, kiểm soát gọi lặp/đồng thời và lưu kết quả gửi. Không dùng module trực tiếp từ frontend.
- Cấu hình bí mật trên Supabase Edge Function Secrets bằng tên `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID`; không gửi giá trị qua chat hoặc ghi vào repo.
- `npm run test:telegram`: 8/8 ca HTTP giả lập đạt. `npm test`: 23/23 đạt; `npm run check` và `npm run build` đạt. Chưa kiểm chứng DB lỗi/rollback, trigger, quyền endpoint, chống trùng hoặc nhận tin thật. Test không thay thế nghiệm thu tích hợp.
- Mất mạng/timeout hoặc phản hồi không đủ bằng chứng trả trạng thái `unknown`; không tự gửi lại. Telegram trả lỗi xác định trả `failed`; thành công trả `sent` kèm message ID, không kèm token/nội dung cá nhân.
- Mốc chờ: kết nối Supabase hiện tại chưa có quyền vào project đích. Sau khi chủ dự án kết nối lại đúng tài khoản, đọc schema/quyền và function hiện có trước khi triển khai phần lưu DB, xác thực, trạng thái gửi và trigger. Không chuyển sang project khác và không đổi cấu hình catalog để né lỗi quyền.
- Test function riêng trước nối UI. Chưa thay nút chọn gói hoặc thêm form mua; UI và luồng lưu phải được đối chiếu trước khi nối. Tin thử phải có nhãn dữ liệu thử.


## Trạng thái Telegram sau triển khai — 2026-10-30

Ghi chú này thay thế mốc chờ quyền ở phần chuẩn bị phía trên. Đã áp dụng migration `purchase_requests_telegram_backend` từ `telegram-schema.sql` và deploy Edge Function `telegram-notify` version 2. Hai bảng mới chỉ cho backend truy cập; schema `telegram_private` không dành cho client. Function tự xác thực bằng token ngẫu nhiên dùng một lần theo bản ghi, lưu hash trong DB và claim nguyên tử; gateway JWT tắt vì dùng cơ chế này. Source ở `functions/telegram-notify/` và `functions/_shared/telegram.mjs`.

Gửi thử riêng với yêu cầu `a1eca41d-5af9-4725-8b79-f97f96792a08`: Telegram từ chối vì `telegram_chat_not_found`; bản ghi còn nguyên, trạng thái failed, chưa có message ID. Cần Admin lớn bấm Start với bot và kiểm tra secret chat đích trực tiếp trong Dashboard; không gửi giá trị qua chat. Khi đã sửa, quản trị gọi `select telegram_private.dispatch('a1eca41d-5af9-4725-8b79-f97f96792a08'::uuid);` để thử lại cùng yêu cầu. Không in nội dung hàng đợi HTTP vì header chứa token dùng một lần.

`telegram-trigger.sql` **chưa áp dụng** vì chưa đạt ca gửi thật thành công; chưa nối UI. Sau khi đạt, áp dụng trigger bằng migration riêng rồi kiểm chứng INSERT sau commit, rollback không gửi, Telegram lỗi không xóa yêu cầu, gọi lặp không gửi thêm. Cột trạng thái có pending/processing/sent/failed/unknown; processing/unknown cần đối chiếu, không tự gửi lại. Không có retry định kỳ.

Kiểm thử: 30 tests toàn dự án đạt (15 ca Telegram giả lập), syntax check và build đạt; gọi function không token thật trả 401; SQL kiểm tra quyền client bị chặn. Advisor có hai mục INFO cho bảng RLS không policy do backend-only, không có WARNING/ERROR. Chưa nghiệm thu tin thật hoặc trigger. Chi tiết bằng chứng và phần còn chờ ở mục 17.1 của plan.


## Telegram đã gửi thành công, trigger đã bật — 2026-10-30

Mốc này thay thế trạng thái `telegram_chat_not_found`/trigger chưa bật ở phần triển khai trước. Function test riêng đã gửi thành công trên yêu cầu cũ (message ID 4), sau đó migration `enable_purchase_requests_telegram_trigger` đã bật trigger INSERT. Tạo yêu cầu giả lập mới `be7d8ec2-992b-47b0-a816-bab5aadf8b63` đã tự gửi thành công (message ID 5), không gọi dispatch thủ công. Telegram API xác nhận, chưa có phản hồi người nhận xác nhận đọc tin.

Kiểm tra transaction rollback: yêu cầu, delivery và hàng đợi HTTP thử đều 0. Gọi dispatch lại cho bản ghi đã sent và UPDATE bản ghi đó giữ nguyên message ID/HTTP request ID 5, không tạo lệnh gửi mới. Hai yêu cầu thử được giữ lại với `is_test = true`; không dùng dữ liệu thật. Chưa nối UI; quyền frontend vẫn đóng. Xem mục 17.2 của Development Plan.


## Gemini trước Telegram — 2026-10-30

Đã deploy `telegram-notify` version 8: sau khi xác thực/claim và đọc yêu cầu đã lưu, gọi Gemini `gemini-3.5-flash-lite` với duy nhất tên gói. Cấu hình backend: `GEMINI_API_KEY`; không gửi giá trị qua chat hoặc đưa vào repo. Không gửi tên người/số điện thoại sang Gemini.

Gemini tối đa 6 giây; lỗi/quota/timeout/JSON hoặc nội dung sai → Telegram dùng mẫu cũ. Thành công → thêm dòng “Tóm tắt AI (tham khảo)” trong cùng tin. Kết quả HTTP có `summary_status`/`summary_code` an toàn, không thay đổi cột DB; trạng thái Telegram sent không đồng nghĩa Gemini generated.

Bằng chứng: Telegram message ID 7 vẫn sent dù Gemini timeout; message ID 8 có summary_status generated. Toàn bộ 35 tests, syntax check và build đạt; dữ liệu thử giả lập, chưa nối UI. Xem Development Plan mục 18. Có thể bỏ secret Gemini hoặc deploy lại handler cũ để dùng mẫu Telegram mà giữ trigger và bản ghi.


## Website intake đã bật — 2026-10-30

Production https://cloudfitk.vercel.app đã nối form → Edge Function `purchase-request` → RPC `submit_purchase_request` → bảng yêu cầu → trigger Gemini/Telegram. RPC chỉ service_role, không mở policy cho client. Source migration: `purchase-intake.sql`. Handler public kiểm tra consent, input, honeypot, origin; DB lấy tên gói, chống trùng request UUID và giới hạn ba yêu cầu/số điện thoại/giờ. Không có CAPTCHA/xác thực số điện thoại trong phạm vi này.

API thật gửi lặp cùng UUID chỉ tạo một yêu cầu và delivery (message ID 9); test giới hạn trong transaction đã rollback hoàn toàn. POST từ origin production ca thử `d4c236d8-2851-410b-9b79-e7052267ac20` trả 201. Không nhập số điện thoại thật vào fixture. Không đổi Gemini/Telegram secrets hoặc quyền ba bảng cũ.
