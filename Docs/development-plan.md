# Development Plan — Google Cloud Compare

**Tệp:** `docs/development-plan.md`  
**Phiên bản:** 0.3 — thêm quyết định AUTH-01…04 và hai nhịp thực hiện; cần khảo sát và duyệt schema trước triển khai  
**Ngày cập nhật:** 2026-10-26  
**Nguồn:** PRD v0.2 và phụ lục AUTH duyệt 2026-10-26; design v0.2 được viện dẫn nhưng chưa được cung cấp trực tiếp để đối chiếu; quyết định MVP trong hội thoại.  
**Đích nhận bàn giao:** Codex sau khi các điểm chặn nghiệp vụ được duyệt.  
**Nhãn:** **[ĐÃ XÁC NHẬN]** — có trong quyết định/PRD; **[ĐỀ XUẤT]** — phương án triển khai chưa duyệt; **[CẦN XÁC NHẬN]** — thiếu quyết định; **[ĐIỂM CHẶN]** — không triển khai logic/phát hành liên quan trước khi có quyết định.

## 1. Mục tiêu triển khai

**[ĐÃ XÁC NHẬN]** Xây website responsive cho startup/doanh nghiệp nhỏ (cá nhân là nhóm phụ), dùng **dữ liệu sản phẩm Google Cloud mẫu**, để hoàn thành một hành trình: **Tìm → So sánh → Chọn**. MVP có đúng sáu nhóm chức năng P0:

| Mã | Năng lực | Tiêu chí đầu ra |
|---|---|---|
| FR-01 | Danh mục sản phẩm | Liệt kê nội dung từ cùng một bộ dữ liệu mẫu |
| FR-02 | Tìm kiếm | Tìm/xóa tìm; có trạng thái không khớp |
| FR-03 | Lọc theo nhu cầu | Áp dụng, nhìn thấy và bỏ điều kiện lọc |
| FR-04 | Chi tiết sản phẩm | Hiển thị dữ liệu đúng; phân biệt mục thiếu |
| FR-05 | So sánh tối đa 3 sản phẩm | Không trùng, không vượt 3, bỏ sản phẩm, bảng đúng tiêu chí |
| FR-06 | Gợi ý theo nhu cầu | Chỉ nêu những sản phẩm trong bộ mẫu theo quy tắc đã duyệt |

**Hành trình dự kiến [ĐỀ XUẤT từ PRD]:** danh mục → tìm/lọc → chi tiết → chọn tối đa 3 để so sánh → xem bảng → chọn một sản phẩm. Nhánh phụ: chọn nhu cầu → xem gợi ý → chi tiết/so sánh → chọn.

**Hoàn tất về mặt sản phẩm:** thỏa OK-01...OK-10 của PRD; xem thêm mục 14. Không đồng nghĩa website bán hàng, cung cấp báo giá, kích hoạt dịch vụ hoặc website chính thức của Google.

## 2. Ràng buộc và nguyên tắc

**Điều chỉnh ngày 2026-10-23 [ĐÃ XÁC NHẬN]:** dùng Supabase để lưu dữ liệu cho webapp nội bộ. Quyết định này thay thế hướng không dùng database trước đây trong kế hoạch. PRD vẫn mô tả phạm vi cũ; chưa coi các chi tiết mới về dữ liệu, đăng nhập và quyền truy cập là yêu cầu đã chốt. Lần cập nhật này chỉ sửa tài liệu, chưa khởi tạo project, bảng hay kết nối ứng dụng.

1. **[ĐÃ XÁC NHẬN]** Không triển khai giỏ hàng, thanh toán, quản lý đơn, tư vấn phức tạp hoặc hệ thống bán hàng đầy đủ. **[ĐÃ DUYỆT AUTH-01/02]** Chỉ Admin lớn và Admin nhỏ đăng nhập; xác thực Email + Password, giữ Confirm Email ON là phương án kỹ thuật đã duyệt trong phụ lục, vẫn chưa cấu hình.
2. **[ĐÃ DUYỆT AUTH-02]** Không tự thêm AI chatbot, CRM, admin dashboard đầy đủ, API Google Cloud/Marketplace, analytics cá nhân hoặc tính giá. Chỉ bổ sung khu vực đăng nhập/quyền dữ liệu Admin tối thiểu; quản lý khách/đơn/chat/lịch hẹn/bảo hành làm sau.
3. **[ĐÃ XÁC NHẬN]** Responsive: hoàn tất hành trình trên mobile và desktop; không để giao diện so sánh mất dữ liệu khi màn hình hẹp.
4. **[ĐỀ XUẤT UI/UX theo design v0.2]** Lấy nguyên tắc Material Design 3; dùng **bảng màu riêng** (`#1D4ED8` primary, `#F8FAFC` background, `#FFFFFF` surface, `#0F172A` text) và Roboto dự kiến. Đây **không phải** bộ nhận diện Google đã được phép dùng.
5. **[ĐIỂM CHẶN]** Không công bố dưới tên/logo/biểu tượng/cách diễn đạt dễ gây hiểu nhầm là sản phẩm Google hay Google Partner khi chưa xác nhận tư cách và quyền thương hiệu.
6. **[ĐỀ XUẤT]** Một nguồn dữ liệu mẫu cho cả danh mục, chi tiết, so sánh, gợi ý; thiếu trường phải hiển thị “Chưa có dữ liệu”, không bịa giá, tính năng hoặc mức phù hợp.
7. Không sửa mã hay cấu trúc dữ liệu hiện có khi chưa khảo sát repository. Mọi thay đổi phá vỡ hợp đồng công khai hoặc xóa dữ liệu phải xin phê duyệt riêng.
8. Các mục có `[CẦN XÁC NHẬN]` không được tự chọn giá trị rồi trình bày như quyết định của chủ dự án.

## 3. Repository discovery gate — Phase đầu tiên bắt buộc

**Chưa có bằng chứng đã kiểm tra repository.** Trước mọi sửa code, Codex phải:

- [ ] Đọc `docs/project-overview-prd.md`, `docs/design-guidelines.md`, `docs/development-plan.md` và `docs/process.md` nếu có; báo nếu tài liệu ở đường dẫn khác.
- [ ] Liệt kê ngắn cấu trúc dự án liên quan, stack, package manager, môi trường, lệnh chạy thực tế; không giả định repo trống.
- [ ] Xác định các file/module hiện có cho sản phẩm, dữ liệu, UI, test; với file chưa tồn tại ghi `<Codex xác nhận sau khi khảo sát repo>`.
- [ ] Kiểm tra có thể chạy test, lint, type-check, build và deploy bằng lệnh nào; ghi trạng thái baseline trước thay đổi.
- [ ] Kiểm tra đã có cơ chế dữ liệu/session/backend hay chưa; không tự xóa hoặc thay thế phần có sẵn.
- [ ] Báo mâu thuẫn giữa repo và tài liệu, thay đổi ngoài phạm vi, hoặc quyết định chưa chốt cho chủ dự án trước khi viết logic phụ thuộc quyết định đó.
- [ ] Trình bày đề xuất danh sách file sẽ tạo/sửa và thứ tự triển khai; chờ phê duyệt các thay đổi nhạy cảm.

**Đầu ra gate:** `Repository discovery report` ghi stack, lệnh chạy, module liên quan, xung đột, các quyết định còn mở và kế hoạch chi tiết đã điều chỉnh. **Tiêu chí đạt:** mọi giả định về repo được thay bằng kết quả kiểm tra thực tế.

## 4. Technical approach

| Hạng mục | Kết luận |
|---|---|
| Stack hiện có | `<Codex xác nhận sau khi khảo sát repo>` |
| Stack đề xuất nếu repo trống | **[ĐỀ XUẤT — cần xác nhận sau khảo sát repo]** React + TypeScript + Vite |
| Giao diện | **[ĐỀ XUẤT]** CSS với design tokens theo guideline v0.2, semantic HTML; thư viện thành phần chỉ chọn nếu phù hợp repo |
| Dữ liệu | **[ĐÃ XÁC NHẬN]** Supabase cho dữ liệu cần lưu lâu dài của webapp nội bộ; loại dữ liệu và quyền đọc/ghi chờ chốt theo mục 5 |
| Logic | **[ĐỀ XUẤT]** Hàm thuần cho tìm, lọc, giới hạn so sánh và gợi ý theo quy tắc được duyệt |
| Kiểm thử | **[ĐỀ XUẤT]** Unit: Vitest; UI: Testing Library; hành trình: Playwright hoặc công cụ tương đương đã có trong repo |
| Triển khai thử | **[CẦN XÁC NHẬN]** nền tảng triển khai, tên miền, người sở hữu; không tự xuất bản |

**Lý do:** Supabase đáp ứng hướng lưu và đọc lại dữ liệu nội bộ đã được chủ dự án yêu cầu. Dữ liệu không tự cập nhật từ Google; không mặc định có màn hình quản trị hoặc đồng bộ lựa chọn giữa thiết bị khi chưa chốt phạm vi. **Ưu tiên sử dụng stack hiện có**, không đổi framework chỉ để kết nối Supabase.

### Database Decision Gate

**Kết luận [ĐÃ XÁC NHẬN]: DÙNG SUPABASE để lưu dữ liệu cho webapp nội bộ.** Việc chọn nền tảng đã chốt; dữ liệu cụ thể cần lưu và người được truy cập vẫn **[CẦN XÁC NHẬN]**. Không tạo bảng chỉ để giống demo.

- **Cần dùng lại:** thông tin phục vụ công việc ở lần truy cập sau hoặc cho đồng nghiệp. Các ứng viên để chốt là danh mục gói, lựa chọn đã lưu, hoặc yêu cầu mua/tư vấn; chưa mặc định triển khai tất cả.
- **Chỉ giữ tạm:** từ khóa, bộ lọc, popup/tab đang mở và danh sách đang so sánh. Không lưu những thao tác này vào database nếu chưa có nhu cầu cụ thể.
- **Hiện trạng đã kiểm tra:** `catalog/products.json` đang cấp dữ liệu cho danh mục; `catalog/app.mjs` và `catalog/logic.mjs` giữ trạng thái tìm/lọc trong tab qua sessionStorage. Nút “Chọn gói này” chỉ xác nhận trên giao diện, chưa ghi dữ liệu lên Supabase.
- **Nguồn dữ liệu sau tích hợp:** với loại dữ liệu đã chuyển sang Supabase, các màn hình đọc từ cùng nguồn đó; file mẫu dùng cho phát triển/kiểm thử, không ghi song song hai nơi. Chỉ chuyển dữ liệu mẫu sau khi nội dung và cách chuyển được duyệt.
- **Lưu thành công:** chỉ thông báo sau khi Supabase xác nhận ghi thành công. Đóng/mở lại trang và đăng nhập lại phải đọc được bản ghi đã lưu theo đúng quyền. Mất mạng hoặc lỗi quyền phải báo rõ, giữ nội dung đang nhập và cho thử lại; không coi dữ liệu tạm là đã lưu.
- **Trước khi tạo project/bảng:** chốt DB-02…DB-05 ở mục 13. Chỉ dùng tổ chức/project được chọn; xác nhận chi phí nếu phát sinh. Sau đó mới thiết kế bảng, quyền truy cập và kết nối UI.

## 5. Dữ liệu và phạm vi lưu trữ dự kiến

Các entity dưới đây mô tả dữ liệu hiện có/đề xuất, **không phải danh sách bảng phải tạo**. Tên bảng, trường, liên kết và quy tắc bắt buộc chỉ được thiết kế sau khi chốt loại dữ liệu cần lưu.

| Entity | Field dự kiến | Quy tắc/ràng buộc | Trạng thái |
|---|---|---|---|
| `Product` | `id`, `name`, `shortDescription`, `detailDescription` | `id` duy nhất, không rỗng; dùng thống nhất ở mọi view | **[ĐỀ XUẤT BA]** |
| `Product` | `needTags` | Khóa nhu cầu chỉ được phép từ danh mục đã duyệt | **[CẦN XÁC NHẬN D-02]** |
| `Product` | `compareAttributes` | Tiêu chí thống nhất giữa sản phẩm; ô thiếu là “Chưa có dữ liệu” | **[CẦN XÁC NHẬN D-03]** |
| `Product` | `sourceUrl`, `lastReviewedAt` | Kiểm tra nội dung mẫu; không hiển thị như chứng thực tự động | **[ĐỀ XUẤT BA]** |
| `Need` | `key`, `label` | Bộ nhu cầu riêng, do chủ dự án duyệt | **[CẦN XÁC NHẬN D-02]** |
| `SelectionState` (bộ nhớ phiên) | `query`, `selectedNeeds`, `compareProductIds`, `chosenProductId?` | Tối đa 3 `compareProductIds` không trùng; `chosenProductId` tùy D-07 | **[ĐỀ XUẤT]** |

- **Danh sách tên sản phẩm, chi tiết thực tế, giá, nhãn nhu cầu và tiêu chí so sánh:** **[CẦN XÁC NHẬN]**, không đưa dữ liệu giả mang tính khẳng định về sản phẩm thật.
- **Thiếu dữ liệu:** thể hiện rõ “Chưa có dữ liệu” thay vì suy luận hoặc gán giá trị.
- **Nguồn duy nhất:** các view dùng chung object `Product` đã kiểm tra cấu trúc; không copy dữ liệu sang từng trang.

### Phân biệt dữ liệu lâu dài và trạng thái tạm

| Thông tin | Cách xử lý dự kiến | Điểm cần chốt |
|---|---|---|
| Danh mục gói | **[ĐỀ XUẤT]** Lưu Supabase nếu cần dùng chung/cập nhật độc lập với mã ứng dụng | Có chuyển danh mục không; ai được xem/sửa |
| Lựa chọn gói đã lưu | **[CẦN XÁC NHẬN]** Chỉ lưu nếu cần mở lại hoặc tiếp tục xử lý | Lưu riêng theo nhân viên hay dùng chung; chọn lại là thay thế hay tạo bản mới |
| Yêu cầu mua/tư vấn | **[CẦN XÁC NHẬN]** Chưa bổ sung vào phạm vi mặc định | Có thực sự cần; thông tin tối thiểu; ai tiếp nhận và được xem |
| Từ khóa, bộ lọc, popup/tab, danh sách đang so sánh | Giữ tạm trong trang/tab; không tạo bảng | Chỉ đổi khi có yêu cầu lưu để dùng lại |
| Người dùng nội bộ và quyền truy cập | **[ĐỀ XUẤT]** Supabase Auth và cơ chế cấp quyền cho thành viên | Cách đăng nhập, danh sách thành viên, quyền xem/tạo/sửa/xóa; không lưu mật khẩu trong bảng tự tạo |

Không tự thêm thông tin khách hàng, lịch sử thao tác hoặc bảng quản trị. Nếu có dữ liệu cá nhân, chốt thông tin cần thu thập, mục đích và thời gian lưu trước triển khai.

## 6. Contracts dữ liệu và giao diện

| Contract/hàm dự kiến | Input | Output | Kiểm tra và lỗi |
|---|---|---|---|
| `loadCatalog()` | Nguồn danh mục đã chốt: file hiện tại hoặc Supabase sau chuyển đổi | `Product[]` | Phân biệt đang tải, danh mục trống, lỗi mạng/quyền và dữ liệu không hợp lệ; có hướng phục hồi |
| `searchProducts()` | `Product[]`, `query` | Danh sách kết quả | Từ khóa rỗng → danh sách hiện tại; trường tìm cụ thể **[CẦN XÁC NHẬN D-02/BR-06]** |
| `filterProducts()` | Danh sách, `selectedNeeds` | Danh sách lọc | AND/OR nếu chọn nhiều nhu cầu **[CẦN XÁC NHẬN BR-06]** |
| `getProductById()` | `id` | `Product` hoặc không tìm thấy | ID không hợp lệ → trang “không tìm thấy”, có đường quay lại |
| `toggleCompare()` | `id`, tập ID hiện tại | Tập ID không trùng, tối đa 3 | Khi thêm thứ 4 giữ nguyên tập và trả thông báo rõ |
| `buildComparison()` | 1–3 sản phẩm, trường so sánh duyệt | Hàng tiêu chí × cột sản phẩm | Dữ liệu thiếu → “Chưa có dữ liệu”; không tính điểm tự chế |
| `suggestProducts()` | Nhu cầu, dữ liệu | Danh sách khớp kèm giải thích **sau khi duyệt** | **[ĐIỂM CHẶN D-04]** chưa được suy ra thuật toán, trọng số, thứ hạng hoặc lý do |
| `chooseProduct()` | `id` hợp lệ | Xác nhận trên giao diện; chỉ ghi Supabase nếu DB-02/D-07 chốt cần lưu lựa chọn | Không thông báo “đã lưu” khi chỉ thay đổi trạng thái trong trang; hành vi lưu/chọn lại phải được chốt |

**[ĐỀ XUẤT]** Dùng thư viện Supabase phù hợp stack hiện có cho đăng nhập và đọc/ghi dữ liệu được duyệt; không tự tạo API server riêng nếu chưa cần. Phía trình duyệt dùng publishable key và phiên đăng nhập; quyền truy cập được kiểm soát tại database bằng RLS (quy tắc giới hạn từng bản ghi). Các tên hàm là đề xuất giao ước, không khẳng định module đã tồn tại. Bổ sung hợp đồng ghi/đọc lại sau khi chốt DB-02 và DB-03.

## 7. Component/module architecture

| Khu vực/module | Trách nhiệm | Dựa vào | File |
|---|---|---|---|
| `CatalogPage` | Entry, danh mục, kết quả | FR-01..03 | `<Codex xác nhận sau khi khảo sát repo>` |
| `SearchField` | Nhập/xóa từ khóa | FR-02 | `<Codex xác nhận sau khi khảo sát repo>` |
| `NeedFilter` | Chọn/bỏ nhu cầu | FR-03, D-02 | `<Codex xác nhận sau khi khảo sát repo>` |
| `ProductCard` | Thông tin ngắn, xem chi tiết, thêm so sánh | FR-01,04,05 | `<Codex xác nhận sau khi khảo sát repo>` |
| `ProductDetail` | Thông tin đầy đủ, trạng thái thiếu | FR-04 | `<Codex xác nhận sau khi khảo sát repo>` |
| `CompareTray` | Chọn/bỏ tối đa 3 | FR-05 | `<Codex xác nhận sau khi khảo sát repo>` |
| `CompareTable` | Đối chiếu theo tiêu chí | FR-05, D-03 | `<Codex xác nhận sau khi khảo sát repo>` |
| `SuggestionSection` | Đề xuất theo nhu cầu đã duyệt | FR-06, D-04 | `<Codex xác nhận sau khi khảo sát repo>` |
| `FeedbackMessage` | Trống, lỗi, giới hạn, thành công | Các FR | `<Codex xác nhận sau khi khảo sát repo>` |
| `catalog-data` | Nguồn sản phẩm mẫu duy nhất | D-01..03 | `<Codex xác nhận sau khi khảo sát repo>` |
| `catalog-logic`, `selection-state` | Tìm/lọc/so sánh/gợi ý, giữ trạng thái phiên | BR-01..08 | `<Codex xác nhận sau khi khảo sát repo>` |

**Điều hướng:** vùng gợi ý có thể nằm trong danh mục; có hay không route riêng do Codex **đề xuất để duyệt**, không phát sinh màn hình chức năng ngoài PRD.

## 8. Bản đồ phase

- [ ] **Phase 0 — Khảo sát repo, đối chiếu tài liệu và chốt điểm chặn.**
- [ ] **Phase 1 — Nền tảng UI và mô hình dữ liệu mẫu.**
- [ ] **Phase 2 — Danh mục, tìm kiếm, lọc và chi tiết (FR-01..04).**
- [ ] **Phase 3 — So sánh và chọn sản phẩm (FR-05 + kết thúc luồng).**
- [ ] **Phase 4 — Gợi ý theo nhu cầu (FR-06) và hoàn thiện UI responsive.**
- [ ] **Phase DB — Khởi tạo Supabase và kết nối lưu/đọc dữ liệu nội bộ sau khi chốt phạm vi và quyền.**
- [ ] **Phase 5 — Tích hợp state/UI, kiểm thử chức năng, bảo mật và khả năng tiếp cận.**
- [ ] **Phase 6 — QA, bản dùng thử, phản hồi và quyết định phát hành.**

**Nguyên tắc:** Phase 2–4 không được hoàn tất bằng giả định nghiệp vụ chưa duyệt. Có thể làm khung giao diện/chức năng độc lập trước; **không gọi khung đó là tính năng đã nghiệm thu**.

## 9. Chi tiết từng phase

### Phase 0 — Khảo sát & khóa phạm vi

- **Mục tiêu:** hiểu repo thực tế; chốt giới hạn và phát hiện xung đột trước khi lập trình.
- **Input:** PRD v0.2, Design v0.2, file này và `process.md`.
- **Dependency:** quyền xem repository.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** đọc 4 tài liệu; kiểm tra stack/lệnh/test; báo xung đột; lập ma trận FR/AC/OK; trình chủ dự án các điểm chặn D-01..D-07, BR-06 và quyết định database.
- **Artifact:** báo cáo khám phá repo, backlog theo FR, bảng quyết định đang mở.
- **Done criteria:** [ ] có lệnh chạy thật/baseline; [ ] rõ phần nào làm được, phần nào đang chờ; [ ] không có quyết định nghiệp vụ bị tự đoán.
- **Kiểm chứng:** chủ dự án duyệt báo cáo, diff dự kiến và danh sách phần chờ.
- **Rủi ro:** thiếu repo hoặc không rõ quyết định → dừng thao tác tương ứng.
- **Handoff:** lựa chọn stack chính thức và yêu cầu đã đủ rõ cho Phase 1.

### Phase 1 — Nền tảng giao diện & dữ liệu

- **Mục tiêu:** tạo được ứng dụng chạy nội bộ từ bộ dữ liệu mẫu đã duyệt.
- **Input:** kết quả Phase 0, guideline tokens và dataset D-01..03 đã duyệt.
- **Dependency:** baseline repo; không tạo dữ liệu sản phẩm thật nếu chưa có D-01.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** khởi tạo/căn chỉnh stack (chỉ khi cần), định nghĩa schema/type dữ liệu tĩnh; kiểm tra ID duy nhất; thiết lập design tokens theo đề xuất; tạo shell danh mục; kiểm tra responsive cơ bản.
- **Artifact:** app chạy local, dữ liệu mẫu hợp lệ, style tokens, kiểm thử cấu trúc dữ liệu.
- **Done criteria:** [ ] dự án chạy/lint/build theo repo; [ ] dữ liệu đọc từ một nguồn; [ ] sai cấu trúc hiển thị lỗi có kiểm soát.
- **Kiểm chứng:** chạy lệnh repo + kiểm tra dữ liệu hợp lệ/không hợp lệ.
- **Rủi ro:** thiếu bộ mẫu được duyệt; chỉ dựng shell nếu thiếu, không tự bịa dữ liệu Google.
- **Handoff:** dữ liệu tin cậy và cơ sở UI cho Phase 2.

### Phase 2 — Luồng khám phá FR-01..04

- **Mục tiêu:** khách có thể xem, tìm, lọc, mở chi tiết rồi quay lại.
- **Input:** catalog mẫu, quyết định trường tìm và filter D-02/BR-06.
- **Dependency:** Phase 1; không tự chọn AND/OR khi chưa duyệt.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** danh mục, SearchField, NeedFilter, ProductCard, ProductDetail; nhãn bộ lọc đang áp dụng; hiển thị empty/error/loading; quay lại danh sách không làm mất ngữ cảnh (theo thiết kế được duyệt).
- **Artifact:** flow danh mục → lọc/tìm → chi tiết → quay lại.
- **Done criteria:** [ ] AC-01a..c; [ ] AC-02a..c; [ ] AC-03a..c; [ ] AC-04a..c; [ ] không có trường sản phẩm bị bịa.
- **Kiểm chứng:** test từ khóa khớp/không khớp, xóa từ khóa, bỏ lọc, URL/ID không tồn tại, dữ liệu thiếu.
- **Rủi ro:** quy tắc tìm/lọc chưa chốt; dừng logic phụ thuộc nếu chưa có.
- **Handoff:** danh sách kết quả và item detail đúng để so sánh.

### Phase 3 — So sánh và quyết định FR-05

- **Mục tiêu:** từ danh mục/chi tiết, người dùng thêm tối đa 3 mục và đối chiếu được.
- **Input:** tập tiêu chí D-03; D-07 về kết quả chọn.
- **Dependency:** Phase 2, D-03 cho bảng so sánh; D-07 cho nút/kết quả chọn.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** CompareTray, CompareTable, loại trùng ID, giới hạn 3, bỏ mục, nhãn trường thiếu, điều hướng quay lại; xử lý 0/1/2/3/4 mục.
- **Artifact:** trải nghiệm so sánh chạy đầy đủ; màn hình hoàn tất chọn **chỉ khi D-07 đã duyệt**.
- **Done criteria:** [ ] AC-05a..e; [ ] dữ liệu so sánh cùng nguồn với chi tiết; [ ] không thêm mục thứ 4; [ ] bảng dùng được trên mobile.
- **Kiểm chứng:** unit tests toggleCompare/buildComparison + kiểm thử giao diện với dữ liệu thiếu; thử chọn nếu D-07 đã được duyệt.
- **Rủi ro:** tiêu chí so sánh không nhất quán, hành vi “Chọn” chưa rõ; không tự quyết định.
- **Handoff:** có điểm so sánh dùng chung cho gợi ý và UI cuối.

### Phase 4 — Gợi ý & hoàn thiện giao diện

- **Mục tiêu:** nhu cầu đã chọn dẫn đến danh sách gợi ý minh bạch; UI theo Design Guideline.
- **Input:** D-02, D-04; layout/tokens v0.2 hoặc bản cập nhật đã duyệt.
- **Dependency:** Phase 2–3, **D-04 là điểm chặn logic FR-06**.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** kết nối gợi ý với filter/dataset; giải thích gợi ý theo quy tắc đã duyệt; hoàn thiện responsive (mobile/tablet/desktop), trạng thái selected/focus/disabled/error và thông điệp.
- **Artifact:** SuggestionSection hợp lệ, màn hình giao diện đầy đủ.
- **Done criteria:** [ ] AC-06a..d; [ ] không bịa điểm xếp hạng/“Google khuyên dùng”; [ ] không tràn trang ở bảng so sánh; [ ] nội dung/brand không ngụ ý tư cách chính thức.
- **Kiểm chứng:** test nhu cầu có/không khớp; thử trên viewport nhỏ; đối chiếu bảng màu/chữ/bố cục.
- **Rủi ro:** gợi ý sai khiến khách lựa chọn sai; chưa duyệt D-04 → chỉ UI nháp, không tuyên bố FR-06 đã xong.
- **Handoff:** UI và logic sẵn sàng được kiểm thử đầu-cuối.

### Phase DB — Supabase và lưu dữ liệu nội bộ

- **Mục tiêu:** dữ liệu đã chốt được lưu thật, đọc lại được và chỉ người được cấp quyền mới truy cập.
- **Input/Dependency:** DB-02…DB-05 đã chốt; D-07 nếu lưu lựa chọn. Lần cập nhật tài liệu này chưa bắt đầu phase DB.
- **File/module:** dự kiến lớp truy cập dữ liệu cho `catalog/app.mjs`, cấu hình mẫu và hướng dẫn trong README; vị trí chính xác và thư viện xác định trước khi sửa code. Giữ logic tìm/lọc độc lập với kết nối.
- **Thứ tự công việc:**
  1. Chọn tổ chức, project, môi trường, khu vực và xác nhận chi phí nếu có; nếu dùng project sẵn, kiểm tra bảng và quyền hiện có trước thay đổi.
  2. Chốt cấu trúc tối thiểu cho đúng loại dữ liệu cần lưu: trường, liên kết, kiểm tra dữ liệu, xử lý trùng/lưu lại và quyền xem/tạo/sửa/xóa. Không tạo bảng cho mọi entity trong mục 5.
  3. Thiết lập đăng nhập/cấp quyền nội bộ; bật RLS cho các bảng được cung cấp qua API, cấp quyền tối thiểu và chặn truy cập ngoài phạm vi.
  4. Tạo cấu trúc đã chốt và lưu thay đổi database có thể truy vết trong repo. Chuyển bộ dữ liệu được duyệt nếu cần; không xóa nguồn mẫu trước kiểm chứng.
  5. Cấu hình URL/publishable key, kết nối UI với luồng đọc/ghi đã chốt; xử lý đang lưu, thành công, lỗi và thử lại.
  6. Kiểm chứng đọc/ghi bằng tài khoản ứng dụng và truy vấn database, kiểm tra quyền rồi ghi lại bằng chứng; không chỉ thử bằng tài khoản quản trị.
- **Artifact:** cấu trúc database và quy tắc quyền có lưu vết; cấu hình mẫu không chứa bí mật; hướng dẫn đăng nhập/chạy; báo cáo kiểm chứng.
- **Done criteria:** [ ] lưu xong mở lại vẫn đọc được; [ ] không báo thành công giả; [ ] người ngoài và người không đủ quyền bị chặn; [ ] thao tác lặp theo đúng quy tắc đã chốt; [ ] không lộ secret/service_role key; [ ] lỗi mạng/quyền có cách phục hồi.
- **Handoff:** luồng Supabase đã kiểm chứng để tích hợp và nghiệm thu ở Phase 5–6.

### Phase 5 — Tích hợp, kiểm thử và chất lượng

- **Mục tiêu:** state liên thông qua luồng và mọi trường hợp lỗi có cách phục hồi.
- **Input:** các tính năng hoàn thiện Phase 2–4.
- **Dependency:** các quyết định P0 đã duyệt; Phase DB hoàn tất cho luồng lưu dữ liệu nội bộ.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** tích hợp state dùng chung giữa Catalog/Detail/Compare/Suggestion; kiểm tra consistency; bàn phím, focus, semantic table, độ tương phản, zoom; kiểm tra đăng nhập, quyền và đọc/ghi Supabase; xử lý trạng thái dữ liệu hỏng/trống và lỗi mạng; review biến môi trường để không lộ bí mật.
- **Artifact:** build đã tích hợp + test report, issue list.
- **Done criteria:** [ ] không mất trạng thái trong luồng (theo hành vi đã duyệt); [ ] các trạng thái default/loading/empty/error/success có phản hồi thích hợp; [ ] các lệnh kiểm tra áp dụng cho repo đạt; [ ] chức năng đúng PRD và điều chỉnh Supabase nội bộ đã được duyệt.
- **Kiểm chứng:** E2E “Tìm → So sánh → Chọn” trên mobile/desktop; đánh giá WCAG thực tế; rà diff và dependency.
- **Rủi ro:** lỗi hồi quy ở điều hướng, nội dung nhãn sai; fix trong phạm vi.
- **Handoff:** bản ứng viên để nghiệm thu.

### Phase 6 — QA, dùng thử và phát hành có kiểm soát

- **Mục tiêu:** nghiệm thu theo PRD, đưa bản thử nghiệm cho đối tượng mục tiêu và lấy phản hồi.
- **Input:** build Phase 5; thông tin thương hiệu D-06 và quyền triển khai.
- **Dependency:** nghiệm thu OK-01..OK-10; phê duyệt địa chỉ triển khai và nội dung công khai.
- **File/module:** `<Codex xác nhận sau khi khảo sát repo>`.
- **Công việc:** chạy kịch bản QA; lập bằng chứng; đặt bản thử nghiệm ở nơi được duyệt; mời người dùng mục tiêu thử; ghi phản hồi mà không mặc định đã đo KPI; phát hành công khai **chỉ sau** kiểm tra thương hiệu.
- **Artifact:** checklist nghiệm thu, báo cáo lỗi, bản thử nghiệm, ghi nhận feedback, biên bản duyệt/hoãn.
- **Done criteria:** [ ] các tiêu chí OK đáp ứng hoặc có ngoại lệ được chấp nhận; [ ] lỗi chặn luồng chính đã sửa; [ ] bằng chứng kiểm thử được lưu; [ ] có quyết định **phát hành/hoãn** do chủ dự án xác nhận.
- **Kiểm chứng:** chạy smoke test trên bản triển khai; chủ dự án kiểm tra thương hiệu/phạm vi.
- **Rủi ro:** công bố dưới danh nghĩa Google không được phép → **không phát hành**.
- **Handoff:** backlog phản hồi để quyết định phiên bản tiếp theo, không tự thêm scope.

## 10. Chiến lược kiểm thử và truy vết

| PRD → UI | Loại test | Bước kiểm chứng | Bằng chứng mong đợi |
|---|---|---|---|
| FR-01 / OK-01 → ProductCard | Unit + UI | Dataset có, trống, không hợp lệ | Danh mục đúng, trạng thái trống/lỗi |
| FR-02 / OK-02 → SearchField | Unit + UI | Từ khóa khớp, không khớp, xóa | Trả đúng danh sách, thông báo rõ |
| FR-03 / OK-02 → NeedFilter | Unit + UI | Chọn/bỏ điều kiện, kiểm tra quy tắc đã duyệt | Kết quả đúng và nhãn lọc |
| FR-04 / OK-03 → ProductDetail | UI | Mở ID hợp lệ, ID sai, thiếu trường | Thông tin đúng, không bịa dữ liệu |
| FR-05 / OK-04,05 → CompareTray/Table | Unit + UI | 0→1→2→3→thêm thứ 4, trùng, bỏ, thiếu trường | Chặn >3; bảng đúng |
| FR-06 / OK-06 → SuggestionSection | Unit + UI | Nhu cầu khớp/không khớp; giải thích có nguồn | Không xếp hạng vô căn cứ |
| End-to-end / OK-07 | E2E + manual | Tìm → Chi tiết → So sánh → Chọn | Luồng hoàn tất trên mobile/desktop |
| Scope / OK-08 điều chỉnh | Review | Rà giao diện và module theo phạm vi mới | Chỉ thêm lưu trữ/đăng nhập/quyền nội bộ đã chốt; không tự thêm bán hàng/thanh toán |
| Lưu và đọc lại | Integration + UI | Lưu dữ liệu đã chốt, tải lại/đóng mở trang, đăng nhập lại | Bản ghi tồn tại trong Supabase và hiển thị đúng theo quyền; không chỉ tồn tại trong sessionStorage |
| Quyền dữ liệu nội bộ | API + UI | Chưa đăng nhập; người không phải thành viên; thành viên đủ quyền; thử đọc/ghi bản ghi ngoài quyền | Người không đủ quyền bị chặn ở database, kể cả gọi API trực tiếp |
| Lỗi ghi và thao tác lặp | Integration + UI | Mất mạng, hết phiên, lỗi quyền, bấm lưu nhiều lần | Không báo lưu thành công khi thất bại; giữ nội dung, cho thử lại; không tạo trùng ngoài quy tắc đã chốt |
| Trạng thái/A11y / OK-09 | UI/manual | Dữ liệu rỗng/lỗi, bàn phím, zoom, tương phản | Không mắc kẹt, có phục hồi |
| Brand / OK-10 | Review | Rà tiêu đề, tên miền, logo, mô tả, footer | Không gây hiểu lầm về Google |

**Chưa được coi là test passed khi chưa chạy trên repository thật.** Chỉ ghi tình trạng đã chạy khi có lệnh, ngày, kết quả và người thực hiện.

## 11. Security, privacy và reliability

- **Đầu vào:** từ khóa tìm kiếm, ID sản phẩm và mã nhu cầu phải được xử lý như dữ liệu, không chèn HTML/script trực tiếp vào DOM.
- **Dữ liệu:** JSON mẫu không chứa khóa API, token, mật khẩu, dữ liệu cá nhân hoặc tuyên bố hiệu năng/giá không được duyệt.
- **Auth [ĐỀ XUẤT]:** Supabase Auth cho người dùng nội bộ được cấp quyền; chốt cách đăng nhập trước triển khai. Đăng nhập thành công chưa đồng nghĩa được truy cập dữ liệu nội bộ; kiểm tra tư cách thành viên và quyền tương ứng. Không dùng thông tin do người dùng tự sửa để quyết định quyền.
- **DB/network:** bật RLS trên mọi bảng được cung cấp qua API; cấp quyền theo phạm vi thực tế. Không dùng quy tắc cho phép tất cả chỉ vì người gọi đã đăng nhập. Kiểm tra quyền đọc, tạo, sửa, xóa; khi sửa phải kiểm soát cả bản ghi cũ và dữ liệu mới.
- **Khóa kết nối:** phía trình duyệt chỉ dùng URL và publishable key; không đưa secret/service_role key vào HTML, JavaScript, tài liệu hoặc repo. Không yêu cầu người dùng gửi khóa bí mật qua chat. Không ghi phiên đăng nhập/token vào log.
- **Lỗi:** hiển thị thông báo phục hồi, không làm mất input hiện tại khi xảy ra lỗi khả thi.
- **Độ tin cậy:** một nguồn dataset có kiểm tra cấu trúc; không có hàm “gợi ý thông minh” chưa xác thực.
- **Ghi log:** không log secrets hoặc thông tin cá nhân; lỗi hiển thị không lộ stack trace nội bộ.
- **Thương hiệu:** tuân thủ nguồn tham khảo trong Design Guideline; việc dùng tài sản Google phải được quyền phù hợp.

## 12. Deploy và vòng phản hồi

- **Môi trường:** local → bản thử nghiệm riêng (nếu được duyệt) → website công khai (khi đã thông qua thương hiệu).
- **Nơi triển khai, tên miền, tài khoản quản trị:** **[CẦN XÁC NHẬN]**.
- **Cấu hình:** khai báo URL và publishable key theo môi trường; hướng dẫn cấu hình đăng nhập/địa chỉ quay lại phù hợp nơi triển khai. Không phát hành khi thiếu quy tắc quyền hoặc còn dùng khóa quản trị trong client.
- **Smoke test dữ liệu nội bộ:** đăng nhập bằng thành viên được cấp quyền → đọc/ghi đúng dữ liệu → tải lại và đọc lại → đăng xuất; kiểm tra không truy cập được dữ liệu nội bộ sau đăng xuất. Chỉ dùng dữ liệu thử được phép và xử lý theo kế hoạch dọn dữ liệu thử đã chốt.
- **Smoke test sau deploy:** mở danh mục, tìm/lọc, xem chi tiết, so sánh 3 sản phẩm, thử thứ 4, nhận gợi ý, chọn theo hành vi D-07, thử mobile.
- **Ai dùng thử:** startup/doanh nghiệp nhỏ; cá nhân có thể thử nhưng không phải nhóm ưu tiên. **Người cụ thể [CẦN XÁC NHẬN]**.
- **Phản hồi:** dễ hiểu sản phẩm? so sánh có hữu ích? kết quả có giúp chọn? dữ liệu nào thiếu? **Không tự đặt tỷ lệ thành công/KPI.**
- **Tiếp tục/điều chỉnh/dừng:** dựa trên quan sát kiểm thử và phản hồi thực; ngưỡng quyết định **[CẦN XÁC NHẬN]**.
- **Điều kiện phát hành:** chủ dự án chấp thuận thương hiệu, nội dung, quyền truy cập nền tảng và bản nghiệm thu.

## 13. Open decisions / điểm chặn

| ID | Việc phải quyết định | Ảnh hưởng | Cách xử lý trước khi chốt |
|---|---|---|---|
| D-01 | Bộ sản phẩm mẫu, nguồn và người duyệt | Phase 1,2,4 | Có thể dựng shell; **không bịa dữ liệu** |
| D-02 | Bộ nhu cầu; cơ chế chọn nhiều | Phase 2,4 | Chưa viết logic lọc cuối |
| D-03 | Thuộc tính so sánh | Phase 3 | Chỉ dựng bảng rỗng minh họa kỹ thuật |
| D-04 | Quy tắc gợi ý, giải thích/xếp hạng | Phase 4 | Không tự viết thuật toán khuyến nghị |
| D-05 | Ngôn ngữ giao diện | Phase 2–4 | Chỉ dùng microcopy tiếng Việt **minh họa** |
| D-06 | Tên thương mại/quan hệ với Google/quyền dùng brand | Phase 6 | Chặn phát hành công khai |
| D-07 | Hành vi xác nhận sau khi bấm “Chọn” | Phase 3/6 | Chặn nghiệm thu bước cuối |
| BR-06 | Trường tìm; AND/OR khi nhiều nhu cầu; sắp xếp mặc định | Phase 2 | Chưa khóa test expected |
| DB-01 | Dùng Supabase lưu dữ liệu cho webapp nội bộ | Phase DB/5 | **ĐÃ XÁC NHẬN ngày 2026-10-23**; đã tạo project và hai bảng; còn tích hợp UI |
| DB-02 | Danh mục gói lưu trong `products`; chưa lưu lựa chọn hoặc yêu cầu mua/tư vấn | Phase DB | **ĐÃ THỰC HIỆN theo đề xuất được chấp thuận**: ba gói mẫu, không thêm luồng bán hàng |
| DB-03 | Ai dùng; đăng nhập bằng cách nào; dữ liệu riêng hay dùng chung; quyền xem/tạo/sửa/xóa | Phase DB/5 | **CẦN XÁC NHẬN** trước thiết kế Auth/RLS |
| DB-04 | JK Company; project `cloudfit-internal`; Singapore | Phase DB | **ĐÃ TẠO**: `qibpsehkmzjwusllorbf`; công cụ tạo thành công không yêu cầu xác nhận chi phí; không suy ra cam kết miễn phí lâu dài |
| DB-05 | Ba gói hiện có trong `catalog/products.json` | Phase DB/6 | Đã nạp theo yêu cầu tạo dữ liệu; giữ ghi chú chưa xác minh. Dữ liệu thử kiểm tra quyền đã rollback; thời gian lưu/khôi phục vận hành còn cần chốt |
| TECH-01 | Stack và repository | Phase 0 | Codex khảo sát trước; không đoán file |
| REL-01 | Host, URL, người duyệt, giới hạn trình duyệt | Phase 6 | Chưa công bố khi chưa duyệt |

**Chỉ những phần độc lập với quyết định mở mới được tiến hành; không lặng lẽ biến placeholder hoặc dữ liệu giả thành tính năng thật.**

## 14. Definition of Done — toàn MVP

- [ ] FR-01…FR-06 đạt các AC tương ứng từ PRD và OK-01…OK-10 có bằng chứng.
- [ ] Tìm → So sánh → Chọn chạy đầu-cuối trên mobile và desktop; D-07 đã được xác nhận.
- [ ] Kết quả tìm/lọc, bảng so sánh và gợi ý chỉ dùng dataset/rule đã duyệt.
- [ ] Tối đa 3 mục so sánh, không trùng, thêm thứ 4 không làm mất chọn cũ.
- [ ] Xử lý loading, empty, error, missing, selected và success phù hợp cho từng khu vực.
- [ ] Tương tác bàn phím, semantic, focus, zoom và kiểm tra tương phản có bằng chứng.
- [ ] Test, lint, type-check, build đúng theo repo chạy xanh; lỗi còn mở được ghi rõ.
- [ ] Không có màn hình hoặc backend ngoài scope, không có secret/PII trong code hoặc log.
- [ ] Dữ liệu nội bộ đã chốt lưu vào Supabase và đọc lại sau khi mở lại trang/đăng nhập lại; không báo thành công trước khi ghi xong.
- [ ] Đăng nhập/cấp quyền đúng phạm vi; RLS và quyền API được kiểm chứng với thành viên và người không đủ quyền.
- [ ] DB-02…DB-05 đã chốt; cấu hình và thay đổi database có hướng dẫn, lưu vết và bằng chứng kiểm chứng.
- [ ] Chủ dự án duyệt D-01..D-07, quyết định DB, và tư cách/nhận diện thương hiệu.
- [ ] Bản thử nghiệm khả dụng; phát hành công khai **chỉ sau phê duyệt**.
- [ ] Codex báo cáo file đã sửa, lệnh/test đã chạy, kết quả, giới hạn chưa xử lý và cách hoàn tác nếu có.

**Trạng thái cập nhật ngày 2026-10-23:** project `cloudfit-internal` tại Singapore có `products`, `app_members` và bảng riêng `demo_customers` gồm ba khách hàng hoàn toàn giả lập theo yêu cầu demo mới. Website đã đọc trực tiếp ba gói demo và ba khách hàng từ Supabase bằng publishable key. Quyền xem công khai chỉ dành cho sản phẩm đánh dấu `is_demo` và bảng khách hàng giả; sản phẩm nội bộ vẫn cần thành viên hoạt động, `app_members` không công khai và client không được ghi. Kiểm chứng SQL và trình duyệt đạt; 13 unit tests đạt, Security Advisor không có cảnh báo. Chưa có thành viên thật hoặc giao diện đăng nhập, chưa có chức năng ghi khách hàng/lựa chọn, chưa deploy. Các quyết định về đăng nhập và dữ liệu khách hàng thật vẫn cần chốt; không dùng bảng demo công khai cho dữ liệu thật. Xem `supabase/README.md`.


---

## 15. Phụ lục đã duyệt — Buổi 5: Auth và quyền dữ liệu

**Trạng thái:** AUTH-01 đến AUTH-04 **[ĐÃ DUYỆT 2026-10-26]**. Đây là kế hoạch thực hiện, không có hoạt động kỹ thuật nào được thực hiện qua việc cập nhật tài liệu. Nếu mục 1–14 nêu DB-03 hoặc Auth "chưa chốt", hiểu rằng *đối tượng và nguyên tắc quyền* đã chốt tại đây, còn schema cụ thể vẫn **[CẦN XÁC NHẬN]**.

### 15.1. Contract vai trò, public/private, ngoài phạm vi

| Nhóm | Danh tính | Quyền trong giai đoạn Auth |
|---|---|---|
| Khách | Không đăng nhập | Đọc gói/mô tả/giá đã duyệt công khai, nội dung giới thiệu-liên hệ, Tìm → So sánh → Chọn |
| Admin lớn | Đăng nhập | Xem dữ liệu nội bộ theo quyền quản trị, quản lý tư cách/khóa Admin sau khi duyệt luồng |
| Admin nhỏ | Đăng nhập | Xem bản ghi nội bộ được phân công; không thể tự cấp vai trò, không xem dữ liệu ngoài phân công |

**Private bắt buộc:** hồ sơ khách thật, yêu cầu mua, lịch sử mua, cuộc trò chuyện, lịch hẹn, bảo hành, danh sách Admin, vai trò và phân công. Những module nghiệp vụ này *chưa triển khai trong phạm vi hiện tại*. Không cấp SELECT công khai cho các danh sách yêu cầu riêng tư.

**AUTH-04:** khóa tài khoản không xóa lịch sử, không mặc định xóa Auth user; xóa vĩnh viễn cần phê duyệt riêng. Cách chuyển giao hồ sơ và thu hồi phiên cụ thể **[CẦN XÁC NHẬN]**.

### 15.2. Nhịp 1 — Danh tính

**Mục tiêu:** Supabase Auth dùng Email + Password, **Confirm Email ON**, không cho tự đăng ký để trở thành Admin.

**Công việc đề xuất sau phê duyệt kỹ thuật:**
1. Codex đọc lại repo, cấu hình Auth của đúng project và bảng `app_members`; xác nhận cách tạo Admin đầu tiên [CẦN XÁC NHẬN].
2. Trình bày luồng mời/cấp tài khoản, xác nhận email, đăng nhập, đăng xuất, email chưa xác nhận, quên mật khẩu [CẦN XÁC NHẬN].
3. Triển khai màn hình đăng nhập và trạng thái loading/sai mật khẩu/email chưa xác nhận/khóa/hết phiên; kiểm tra vai trò thành viên hoạt động sau xác thực.
4. Không dùng quyền client hoặc session token làm bằng chứng cho phép đọc toàn bộ database.
5. Không công khai service-role/secret key; không ghi mật khẩu, token vào log.

**Done/verify:** A và B đã xác nhận email đăng nhập được; người ngoài không vào phần Admin; email chưa xác nhận không vào; đăng xuất chặn khu vực riêng; F5 giữ đúng trạng thái sau kiểm tra lại; thử lỗi mạng và phiên hết hạn. Không báo đạt trước khi chạy kiểm chứng thật.

### 15.3. Nhịp 2 — Quyền truy cập dữ liệu / RLS

**Mục tiêu:** kiểm tra quyền ngay tại Supabase, không chỉ ẩn nút ở UI.

1. Trước mọi migration, **đọc lại** `products`, `app_members`, `demo_customers`, chính sách RLS và vai trò đang có; bảo toàn quyền đọc demo công khai đang áp dụng theo hồ sơ nếu không có quyết định đổi.
2. Chốt dữ liệu thuộc sở hữu ai: cột `user_id` chỉ áp dụng cho bản ghi gắn một người (ví dụ `auth.uid() = user_id`); dữ liệu phân công của Admin nhỏ cần quan hệ phân công và RLS kiểm tra tại database. Không dùng `auth.uid() = user_id` để thay cho quyền Admin lớn hay quan hệ phân công.
3. Trình **migration preview**: bảng/cột thêm hoặc sửa, policy SELECT/INSERT/UPDATE/DELETE, tác động tới API công khai/nội bộ, kiểm thử và rollback; xin duyệt riêng trước thao tác.
4. Không mở mặc định SELECT cho mọi `authenticated`; không cho Admin nhỏ thay vai trò, chủ sở hữu hoặc bản ghi phân công để vượt quyền. Kiểm tra cả USING/WITH CHECK khi có UPDATE/INSERT.
5. Thiết kế thu hồi truy cập sau khóa kể cả đối với phiên/token còn hợp lệ: policy kiểm tra thành viên active tại database; quy trình hủy phiên nếu có phải được duyệt và kiểm thử. Không cho rằng ẩn trang hoặc chỉ sign-out từ một thiết bị là đủ.
6. Đấu nối UI: trang public → `products` theo trạng thái công khai; khu vực Admin → `app_members` và dữ liệu được phép; danh sách và form dữ liệu thật về khách/đơn/chăm sóc chỉ bổ sung sau khi đổi phạm vi PRD và duyệt schema.

**Done/verify:** guest đọc được catalog công khai nhưng không đọc thông tin nội bộ; A thấy phạm vi quản trị; B chỉ thấy bản ghi được phân công, truy cập bản ghi không thuộc quyền qua API cũng bị chặn; khóa B làm mất quyền dữ liệu, lịch sử vẫn còn.

### 15.4. Ma trận kiểm thử A/B, F5

| Case | Kiểm tra | Kỳ vọng |
|---|---|---|
| T-01 | Không đăng nhập: xem danh mục/giá đã được duyệt | Đọc được phần công khai |
| T-02 | Guest thử đọc hồ sơ khách/yêu cầu riêng tư | Không có quyền |
| T-03 | A (Admin lớn) đăng nhập, email đã xác nhận | Vào đúng khu vực |
| T-04 | B (Admin nhỏ) đăng nhập, email đã xác nhận | Vào đúng khu vực |
| T-05 | A đọc quyền quản trị | Chỉ theo chính sách quản trị |
| T-06 | B đọc bản ghi được giao | Được |
| T-07 | B đọc bản ghi chưa giao qua UI/API | Bị từ chối |
| T-08 | B tự sửa `role`, `user_id` hoặc phân công | Bị từ chối |
| T-09 | A/B tải lại F5 ở trang riêng | Session và quyền khôi phục đúng; không ló dữ liệu trước khi xác minh |
| T-10 | A/B đăng xuất rồi truy cập URL riêng trực tiếp | Bị chuyển về đăng nhập hoặc từ chối |
| T-11 | Khóa B khi B đang có phiên | Mọi truy vấn dữ liệu riêng không còn quyền |
| T-12 | A kiểm tra bản ghi/lịch sử sau khóa B | Dữ liệu vẫn được giữ |
| T-13 | Email chưa được xác nhận | Không truy cập dữ liệu nội bộ |
| T-14 | Hết phiên/mất mạng | Báo lỗi rõ, không công khai nội dung riêng |

**Bằng chứng khi thực hiện:** danh tính thử A/B (không ghi email cá nhân nhạy cảm/mật khẩu), vai trò, chính sách liên quan, bước thao tác, kết quả thực tế, ảnh/test log không chứa secret. Chưa có kết quả kiểm thử thật trong bản tài liệu này.

### 15.5. Các điểm chặn giữ nguyên

- **AUTH-05 [CẦN XÁC NHẬN]:** cấp tài khoản Admin đầu tiên và tài khoản sau.
- **AUTH-06 [CẦN XÁC NHẬN]:** trường, constraint, chính sách hiện có của `app_members`.
- **AUTH-07 [CẦN XÁC NHẬN]:** bảng/quan hệ phân công tối thiểu; chưa tạo CRM.
- **AUTH-08 [CẦN XÁC NHẬN]:** migration preview và tác động tới policies/giá.
- **AUTH-09 [CẦN XÁC NHẬN]:** cách xử lý phiên còn hiệu lực và chuyển giao khi khóa Admin.
- **AUTH-10 [CẦN XÁC NHẬN]:** bản thiết kế UI chính thức và vị trí/route sau khảo sát repo.
- **D-01…D-07, BR-06 và REL-01:** vẫn giữ trạng thái chưa duyệt theo các tài liệu gốc, trừ khi có quyết định độc lập khác.

### 15.6. Quy trình phê duyệt và triển khai

- [x] AUTH-01…AUTH-04 đã được người dùng duyệt.
- [x] Cập nhật nội dung tài liệu dự thảo.
- [ ] Chủ dự án duyệt 3 bản tài liệu mới.
- [ ] Codex khảo sát repository trước khi đề xuất thay đổi mã.
- [ ] Kiểm tra Supabase thật và trình preview trước khi đổi schema/RLS/Auth settings.
- [ ] Duyệt riêng thay đổi schema và cấu hình đăng nhập.
- [ ] Thực hiện Nhịp 1, kiểm thử.
- [ ] Thực hiện Nhịp 2, kiểm thử A/B và F5.
- [ ] Đối chiếu kiểm thử và nghiệm thu trước khi phát hành.

**Không được khẳng định đã chạy test, bật Confirm Email, sửa Auth hay đổi RLS chỉ từ hồ sơ tài liệu.**
