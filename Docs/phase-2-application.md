# SQL Nhịp 2 — kết quả áp dụng ngày 26/10/2026

Project: **cloudfit-internal**, ref `qibpsehkmzjwusllorbf`.
Người dùng duyệt bằng yêu cầu “áp dụng nhịp SQL 2”.
Trạng thái: **APPLIED_SQL_ONLY**; không coi toàn bộ Nhịp 2 hoặc UI đã hoàn tất.

## Migration đã chạy

- Version `20261026163718`, name `demo_customers_owner_v1`.
- SQL khớp nguyên bản `supabase/demo-customers-owner-v1.preview.sql` đã trình; SHA-256 `6bd890df93b2880fa79b1fd0883448d1ba583f43d80dd87ccfd388d020a31e48`.
- Tệp preview giữ nguyên nội dung để bảo toàn checksum lịch sử. Đây là migration đã ghi trong Supabase, không chỉ thao tác local.
- Chỉ `demo_customers`: thêm UUID `user_id`, FK Auth với ON DELETE RESTRICT, default `auth.uid()`, index owner. ADD COLUMN trước SET DEFAULT nên không điền chủ cho dòng cũ.
- Bỏ `demo_customers_read`; thu hồi quyền cấp bảng và cấp cột cũ. SELECT dùng USING(owner + active membership); INSERT dùng WITH CHECK(owner + active membership).
- Client không có quyền ghi cột user_id; DB tự điền từ JWT. Client chỉ INSERT các trường dữ liệu giả đã duyệt, không UPDATE/DELETE.

## Sao lưu trước thay đổi thật

- Chụp từ DB thật lúc `2026-10-26T16:34:04.263273+00:00` — 23:34:04 giờ Việt Nam.
- JSON: `/Users/kylie/.codex/visualizations/2026/10/26/01a178b1-d427-7f62-997f-9a19a6a94314/backups/cloudfit-internal/before-sql2-202610261634042632730000.json`.
- SHA-256: `4dd1abd0c23cb0e8ee504111216d50fdf8e3602165260631f3c767725faa0405`.
- Có file `.restore.sql`, `.sha256`, `.verification.json` cùng tên nằm cạnh bản JSON; quyền JSON/restore/report là 0600, nằm ngoài web root.
- Dữ liệu: 3 products, 3 demo_customers, 0 app_members; metadata columns/defaults, constraints, indexes, policies, table/column grants, RLS, comments/owners, triggers.
- Đã đọc lại JSON/kiểm checksum; đã khôi phục bản sao trong PostgreSQL WASM cục bộ PGlite 0.5.12 (Postgres 18.6), xác nhận đúng toàn bộ dòng của cả 3 bảng, 4 policy và RLS flags. Schema/constraint/index/grants phục hồi từ snapshot và SQL migration chạy được trên bản khôi phục.
- Lab tạo placeholder auth.users/auth.uid và A/B cục bộ để kiểm policy. Không phải sao lưu Auth/Storage, không phải full-project pg_dump/PITR. Production đang Postgres 17; diễn tập này không chứng minh khôi phục toàn bộ project hoặc Supabase Auth.
- Ngay trước APPLY đã kiểm lại dữ liệu/target policy/schema không đổi so với bản sao.

## Kiểm chứng đã chạy

- **22/22 kiểm tra lab đạt**: restore; cú pháp migration; giữ 3 dòng NULL; chỉ hai policy owner; guest/nonmember bị chặn; INSERT A/B đúng chủ; SELECT không filter vẫn tách A/B; A đọc B trả 0; không giả owner hoặc NULL; UPDATE/DELETE bị chặn; không tự sửa membership; khóa B mất đọc/ghi nhưng lịch sử còn; catalog public vẫn đọc.
- **DB thật**: migration có trong lịch sử; cả 3 bảng RLS ON; đúng 2 policy SELECT/INSERT ở target; anon không có SELECT cấp bảng/cột; authenticated không INSERT được user_id, không UPDATE/DELETE; 3 dòng vẫn còn và đều NULL owner; products và app_members so với backup không đổi.
- **Role simulation trên DB thật**: SET LOCAL ROLE authenticated + uid giả không có membership, SELECT không thấy dòng; toàn bộ giao dịch rollback. Không tạo A/B hay membership thật.
- **REST thật bằng publishable client**: guest đọc demo_customers HTTP 401; catalog HTTP 200, đủ 3 sản phẩm.
- **Auth settings đọc lại**: Confirm Email vẫn ON. Không đổi Auth settings, không tạo user.
- **Security Advisor sau migration**: 0 cảnh báo.

## Chưa kiểm / chưa triển khai

- Project có 0 Auth users, nên chưa kiểm Login/F5, INSERT/SELECT bằng JWT thật của A/B, hoặc khóa tài khoản thật. Test A/B dương tính chỉ chạy trong lab.
- Không triển khai vai trò Admin lớn/nhỏ và quan hệ phân công. Owner-only + membership active không thay thế toàn bộ contract Admin trong plan.
- Chỉ SQL đã áp dụng ở lượt này. UI production hiện vẫn dùng loader khách demo không gửi JWT; từ sau migration API này sẽ từ chối guest, nên mục khách demo có thể báo lỗi quyền. Cần triển khai gói UI đã mô tả trong preview: session đã xác minh, bearer token + owner filter, hủy request cũ, xóa state khi logout/đổi user, form chỉ tạo dữ liệu giả. Chưa sửa/deploy UI hoặc thêm quyền để né lỗi.
- Không commit/push/deploy trong lượt áp dụng SQL này.

## Khôi phục

Không tự chạy restore đè production. Với lỗi quyền, ưu tiên sửa tiếp theo hướng fail-closed. Không tự khôi phục USING(true) vì có thể làm lộ dòng riêng được tạo sau migration. Nếu cần phục hồi dữ liệu, xác định phạm vi/bản sao phù hợp và bảo toàn dòng phát sinh sau backup trước khi chủ dự án duyệt thao tác.
