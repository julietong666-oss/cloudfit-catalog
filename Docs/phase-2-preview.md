# Nhịp 2 — khảo sát và preview để chốt phạm vi

Trạng thái: CHƯA DUYỆT, CHƯA ÁP DỤNG. Không phải migration đã chạy.
Khảo sát 2026-10-26, sau khi đọc lại development-plan.md mục 15 và source.

## Project và hiện trạng thật

- Project: `cloudfit-internal`, ref `qibpsehkmzjwusllorbf`, Singapore `ap-southeast-1`, ACTIVE_HEALTHY, Postgres 17.
- Auth: 0 users, 0 confirmed. Không có A/B thật để đăng nhập. Không tạo user, không đọc mật khẩu/hash/token, không đổi Confirm Email.
- `app_members`: 0 dòng; đã có `user_id uuid NOT NULL` (PK/FK tới Auth), `is_active`, `created_at`. Client chỉ SELECT membership của chính mình. Không có cột role hoặc quan hệ phân công.
- `products`: 3 dòng, đều là demo; chưa có user_id. Catalog là dữ liệu dùng chung/công khai theo plan, không tự chuyển thành dữ liệu riêng theo người.
- `demo_customers`: 3 dòng giả, chưa có user_id; chưa có chủ sở hữu. Constraint email chỉ cho example.com, comment cảnh báo không chứa khách thật.
- Cả 3 bảng đều RLS ON. Client hiện không có INSERT/UPDATE/DELETE ở cả 3 bảng.

| Bảng | Policy hiện tại | Quyền thực tế |
|---|---|---|
| app_members | members_read_own_membership | authenticated SELECT khi auth.uid() = user_id |
| products | demo_products_read | anon/authenticated SELECT khi is_demo = true |
| products | active_members_read_products | thành viên active SELECT tất cả sản phẩm, kể cả nội bộ nếu có |
| demo_customers | demo_customers_read | anon/authenticated SELECT USING (true), đọc chéo toàn bộ khách giả |

Đã kiểm cả grants cấp bảng và grants cấp cột trong snapshot; `products` có SELECT cấp cột cho anon. Không chỉ dựa trên danh sách grants cấp bảng.

## Kiểm Login/F5 thực sự đã chạy lại

- Node: 15/15 tests đạt, gồm SDK instance mới khôi phục session, refresh, logout, user bị vô hiệu hóa (HTTP giả lập).
- Trình duyệt 4175, SDK thật/HTTP fixture: Login A thấy a@example.com; F5 vẫn A; logout thành guest; Login B thấy b@example.com; F5 vẫn B; logout rồi F5 là guest.
- Trình duyệt 4173: F5 trạng thái guest chính xác. A/B thật CHƯA KIỂM vì Auth có 0 user.
- Chưa kiểm API A/B thật đọc chéo, ghi chéo, khóa membership, đa tab/mất mạng thật. Không coi test SDK giả lập là kiểm chứng RLS.

## Bản sao đã tạo thực sự

- Chụp snapshot đọc từ DB thật trong một câu SELECT, thời điểm 2026-10-26T15:11:44.527566+00:00 (22:11:44 ngày 26/10/2026, giờ Việt Nam).
- File: `/Users/kylie/.codex/visualizations/2026/10/26/01a178b1-d427-7f62-997f-9a19a6a94314/backups/cloudfit-internal/public-before-phase2-202610261511445275660000.json`.
- JSON 72.828 bytes; đã đọc lại/parse, xác nhận project, 3 products + 3 demo_customers + 0 app_members, 4 policy, RLS ON. Quyền file 0600.
- SHA-256: `b0f1bdbd588d706e29d5273805e5b64abf4f1faf3af7ed2af0bb8d600c2cf369`; file `.sha256` nằm cạnh JSON.
- Nội dung: toàn bộ dòng của 3 bảng, columns/defaults, constraints/FK, indexes, policies, grants bảng/cột, RLS flags, owner/comment, triggers (không có trigger do người dùng tạo).
- Phạm vi là snapshot logic của 3 bảng public. Không phải full-project pg_dump/PITR; không gồm Auth/Storage. CLI pg_dump/supabase không có trong PATH. Chưa diễn tập restore; chưa đủ để khẳng định khôi phục toàn project. Bản sao nằm ngoài web root đang phục vụ.
- Trước APPLY phải kiểm độ mới, thay đổi ngoài phiên, chụp lại và kiểm tra bản sao phù hợp gói đã duyệt. Nếu gói đổi Auth, role, function hoặc bảng khác, phải mở rộng backup. Chưa backup đủ/kiểm chứng phục hồi cần thiết thì không APPLY.

## Các quyết định phải chốt

1. Áp dụng sở hữu cho bảng nào? Đề xuất hẹp để học quyền: chỉ demo_customers; giữ catalog products công khai và app_members nguyên trạng. Đây là lựa chọn CHƯA DUYỆT, không phải diễn giải rằng mọi bảng phải có user_id.
2. Ba dòng khách giả cũ chưa có chủ: giữ nguyên và ẩn bằng user_id NULL; hoặc giữ khu demo công khai riêng; hoặc chủ dự án chỉ định chủ từng dòng. Không xóa, không tự backfill, không tự dùng auth.uid() của người chạy migration.
3. Plan chưa cho form khách/đơn thật hoặc CRUD tùy ý. Mặc định gói chỉ thay quyền đọc; INSERT khách giả để thử ownership cần được duyệt rõ. UPDATE/DELETE chưa có quyền được duyệt nên giữ bị cấm.
4. Plan có Admin lớn/nhỏ và phân công; schema hiện không có role/assignment. Owner-only không thay thế mô hình đó. Cần chốt vai trò/phân công trước khi gọi toàn bộ Nhịp 2 hoàn tất. Không tự cấp membership/role cho người đăng ký mới.
5. A/B thật: chủ dự án tạo hoặc duyệt luồng tạo riêng; Auto confirm từng tài khoản thử không thay Confirm Email của đăng ký thật. Không gửi mật khẩu trong chat.

## Gói dự kiến có điều kiện: demo_customers_owner_access_v1

Chỉ có thể chốt tên và SQL migration sau các quyết định trên. Không có migration nào được tạo trong lịch sử Supabase hoặc áp dụng. SQL sau là preview theo phương án **chỉ demo_customers, giữ dòng cũ NULL/ẩn, SELECT của chủ và thành viên active**; nếu chọn phương án khác phải viết lại rồi duyệt lại.

```sql
-- PREVIEW ONLY: không chạy trước duyệt đúng gói và backup phù hợp.
begin;
alter table public.demo_customers enable row level security;
alter table public.demo_customers
  add column user_id uuid references auth.users(id) on delete restrict;
-- Đặt default sau ADD COLUMN: không điền chủ cho 3 dòng cũ.
alter table public.demo_customers alter column user_id set default auth.uid();
create index demo_customers_user_id_idx on public.demo_customers(user_id);
drop policy demo_customers_read on public.demo_customers;
revoke all on public.demo_customers from public, anon, authenticated;
grant select on public.demo_customers to authenticated;
create policy demo_customers_owner_select
on public.demo_customers for select to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.app_members m
    where m.user_id = (select auth.uid()) and m.is_active
  )
);
commit;
```

Trước APPLY, kiểm tra lại toàn bộ policy/grants cấp bảng/cột của target. Nếu có policy permissive mới hoặc grant mở ngoài preview thì dừng, lập preview bổ sung; không để policy USING(true)/FOR ALL cũ OR với policy mới. Không đổi policy sản phẩm công khai vì chúng thuộc bảng khác và có mục đích công khai được plan giữ lại. Không thêm quyền SELECT toàn bảng cho mọi authenticated thiếu ownership.

**Chỉ nếu được duyệt INSERT khách giả**, thêm trong cùng giao dịch:

```sql
grant insert (id, company_name, contact_name, email, product_id, stage)
on public.demo_customers to authenticated;
create policy demo_customers_owner_insert
on public.demo_customers for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.app_members m
    where m.user_id = (select auth.uid()) and m.is_active
  )
);
```

Client không được INSERT cột user_id; DB điền từ auth.uid() của JWT. WITH CHECK từ chối owner NULL/khác user. Tạo mới trong UI phải đi qua phiên đã xác minh, không tin ID tự nhập. Constraint dữ liệu giả giữ nguyên. Chưa có quyền UPDATE/DELETE: không tạo policy hoặc GRANT cho chúng. Nếu UPDATE được duyệt sau, phải có SELECT và cả USING(owner + active) lẫn WITH CHECK(owner + active); DELETE chỉ USING nếu được duyệt riêng.

Tác động phương án trên: guest không còn đọc demo_customers, thành viên active chỉ thấy dòng của mình, người ngoài/không active không thấy; 3 dòng cũ vẫn tồn tại nhưng NULL nên không hiển thị. Catalog public không đổi. Không có thay đổi dữ liệu hoặc quyền nào hiện đã thực hiện. Điều kiện active giữ cơ chế khóa membership tại DB; chưa thay cho phân biệt vai trò/phân công Admin.

## UI dự kiến trong cùng gói duyệt

Source hiện có hai module rời: auth-ui không báo phiên cho app; data khách demo chưa gửi bearer token; app chỉ tải một lần và giữ products/customers, query/filter, chi tiết và kết quả chọn trong bộ nhớ/sessionStorage. Logout hiện chỉ xóa session SDK, chưa xóa state catalog. Vì dữ liệu hiện là public demo, chưa có private data bị lộ từ luồng này; phải sửa trước khi đấu dữ liệu riêng.

- Dùng một nguồn session đã xác minh, cập nhật userId và trạng thái checking/guest/authenticated cho app.
- Khi đổi A/B, logout hoặc hết phiên: hủy request cũ/đổi generation, xóa mảng dữ liệu riêng, DOM chi tiết/thông báo chọn, query/filter và đúng key cloudfit.catalog. Không xóa bừa toàn bộ localStorage hoặc dữ liệu SDK.
- Request riêng gửi bearer token của phiên hiện tại và lọc user_id hiện tại; không request riêng lúc guest/checking. Response phiên A về chậm phải bị bỏ khi đã chuyển B.
- F5: không hiển thị cache riêng trước xác minh; đọc lại từ DB theo session mới. Public products vẫn tải riêng theo is_demo.
- Server RLS vẫn là nơi chặn đọc/ghi chéo kể cả bỏ bộ lọc UI hoặc gọi REST trực tiếp.

## Kiểm chứng và rollback dự kiến sau duyệt

- Preflight: đúng ref, schema/policy/grants không lệch preview; backup có checksum/đọc lại và phù hợp toàn bộ phạm vi; có A/B xác nhận, danh tính/membership do chủ dự án chốt.
- API guest không đọc target riêng; A không đọc B kể cả truy vấn không có filter; A không giả owner B; user không active bị chặn. Kiểm SQL role/JWT claims trong giao dịch rollback và REST bằng JWT thật; không dùng service_role để kết luận RLS đúng.
- Nếu duyệt INSERT: A/B tự tạo dòng giả, owner đúng uid server; payload có owner khác/NULL không được chấp nhận. Không UPDATE/DELETE ngoài scope.
- UI A/F5, B/F5, logout/F5, response đến muộn, nhiều tab, mất mạng và phiên hết hạn; account cũ không còn dữ liệu tạm.
- Rollback giao dịch nếu migration lỗi. Sau commit, ưu tiên bản sửa tiếp theo chặn quyền (fail closed); không tự khôi phục policy USING(true) làm lộ các dòng riêng mới. Restore dữ liệu/schema chỉ sau xác nhận phạm vi và diễn tập trên môi trường riêng; không tự xóa các dòng phát sinh sau backup.

File source chức năng chưa sửa trong lượt chuẩn bị này. Chỉ thêm tài liệu preview và bản sao ngoài web root. Không commit/push/deploy.

Tài liệu đối chiếu: https://supabase.com/docs/guides/database/postgres/row-level-security


## Phương án đã chọn sau trả lời “đầy đủ nhất” — gói trình duyệt v1

Chọn phạm vi demo_customers riêng theo chủ; products tiếp tục public; app_members giữ nguyên. Chọn bảo toàn 3 dòng cũ với user_id NULL và ẩn, không xóa/gán chủ. Gói có SELECT + INSERT dữ liệu giả, không có UPDATE/DELETE hoặc khách thật. Đây là đề xuất cụ thể để duyệt theo yêu cầu “duyệt đúng gói”, chưa coi trả lời chọn phương án chung là phê duyệt migration.

SQL đầy đủ ở `supabase/demo-customers-owner-v1.preview.sql` (không phải migration đã chạy). Bổ sung revoke cả grants cấp cột, kiểm tra drift, RLS vẫn ON. Tên migration dự kiến sau duyệt: `demo_customers_owner_v1`; chưa tạo timestamp/lịch sử migration khi CLI không sẵn và scope chưa duyệt.

UI dự kiến thay `catalog/auth.mjs`, `catalog/auth-ui.mjs`, `catalog/app.mjs`, `catalog/data.mjs`, `code.html`, CSS và tests: chia sẻ phiên đã xác minh, xóa state khi đổi user/logout, hủy/bỏ phản hồi cũ, tải dữ liệu riêng bằng JWT + user_id filter. Form chỉ tạo bản ghi giả với email example.com; DB tự gắn owner, không có ô chọn chủ. Tên ID sinh bằng crypto.randomUUID. Chỉ báo thành công khi DB trả thành công. Guest không tải demo_customers; không có quyền/chưa active thì báo rõ.

A/B thật chưa có: cần tạo bằng Supabase Auth quản trị với Auto confirm riêng từng tài khoản, giữ Confirm Email ON, sau đó duyệt cấp membership active riêng cho 2 UUID thử. Không gửi mật khẩu qua chat. Công cụ Supabase hiện có chưa cung cấp chức năng quản trị Auth users; không dùng SQL để tự tạo auth.users/password. Hai tài khoản học ownership không đại diện đầy đủ hai vai trò Admin lớn/nhỏ. Nếu cần nghiệm thu Admin lớn/nhỏ/phân công theo plan phải duyệt gói schema vai trò/phân công riêng trước; không tự cho một user đọc toàn bộ.

Điều kiện APPLY: duyệt đúng gói SQL+UI này, xác nhận xử lý NULL/ẩn của 3 dòng cũ, có backup đủ và kiểm chứng khôi phục phù hợp, có đường tạo A/B/membership đã duyệt. Không đáp ứng thì giữ trạng thái PREPARED, không gọi apply_migration/DDL hoặc thay dữ liệu thật. Phải trình lại nếu phạm vi hoặc chính sách thay đổi.
