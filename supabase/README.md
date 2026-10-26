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
