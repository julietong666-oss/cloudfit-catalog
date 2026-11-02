# Development Plan — Google Cloud Compare

**Tệp:** `docs/development-plan.md`  
**Phiên bản:** 0.10 — tích hợp UI Mekong Cloud Horizon trên production, giữ nguyên purchase/API  
**Ngày cập nhật:** 2026-10-30  
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


---

## 16. Bài thử độc lập — Thông báo Telegram

**Lịch sử quyết định:** giới hạn chỉ làm bài thử độc lập ở mục này đã được yêu cầu mới thay thế bằng phạm vi tích hợp thực tế tại mục 17. Nguyên tắc test function trước nối UI và xử lý lỗi vẫn áp dụng.

**[ĐÃ DUYỆT 2026-10-30]:** thực hiện theo hướng **bài thử độc lập**; **Admin lớn nhận**; kênh liên hệ tối thiểu là **số điện thoại**. Nội dung này ghi nhận quyết định và kế hoạch kiểm thử, chưa phải bằng chứng triển khai hoặc kiểm thử thành công.

**Phạm vi:** kiểm chứng backend `telegram-notify` bằng dữ liệu giả trong môi trường thử. Chưa nối UI, chưa bổ sung luồng đăng ký mua vào MVP. DB-02 và D-07 không được coi là đã đổi bởi bài thử này. API Telegram chưa cần cho hành trình MVP hiện tại vì chưa có sự kiện lưu đăng ký mua; bài thử chỉ kiểm chứng khả năng gửi thông báo. Đưa tích hợp vào sản phẩm cần được duyệt riêng. Không tạo project, bảng hoặc đổi schema/quyền chỉ từ việc cập nhật tài liệu này.

### Trigger

- Tạo một yêu cầu đăng ký mua giả trong môi trường thử; chỉ gửi Telegram sau khi DB xác nhận lưu thành công.
- Không kích hoạt từ thao tác chọn gói, tải lại trang hoặc sửa bản ghi.
- Thông báo mang nghĩa “Có đăng ký mua mới”, không xác nhận thanh toán.
- Đối tượng bài thử là yêu cầu đăng ký mua; nguyên tắc bảo toàn bản ghi không bổ sung nghiệp vụ khoản chi.

### Dữ liệu gửi

Chỉ gửi mã yêu cầu, mã và tên gói phần mềm, thời điểm tạo, tên người liên hệ và số điện thoại. Bài thử dùng toàn bộ dữ liệu giả; không gửi hồ sơ khách hàng, dữ liệu thanh toán hoặc nội dung tự do.

### Backend `telegram-notify`

- Chạy phía backend; kiểm tra bản ghi đã lưu trước khi gửi. Không cho trình duyệt gọi tùy ý để gửi tin.
- Người nhận: Admin lớn, qua cuộc trò chuyện Telegram riêng dùng cho bài thử.
- Trả kết quả gửi thành công, thất bại hoặc chưa xác định gắn với mã yêu cầu; phân biệt trạng thái lưu DB và trạng thái gửi Telegram.
- Gọi lặp sau lần gửi thành công không gửi thêm thông báo cho cùng yêu cầu.
- Tên function là giao ước cho bài thử, chưa khẳng định module đã tồn tại. Vị trí, môi trường chạy và cách lưu trạng thái được đề xuất sau khảo sát, không mặc định tạo thêm hạ tầng.

### Quản lý secret

- Chỉ cấu hình phía backend: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- Tài liệu chỉ ghi tên; không đưa giá trị vào frontend, repository, tài liệu hoặc log; không yêu cầu gửi qua chat.

### Ứng xử khi lỗi

- **DB lỗi:** không gọi Telegram, không báo “đã lưu”; giữ dữ liệu đầu vào để thử lại.
- **Telegram lỗi:** giữ nguyên bản ghi đã lưu; ghi nhận trạng thái thất bại và mã yêu cầu, không ghi secret hoặc số điện thoại vào log. Không rollback hoặc yêu cầu tạo lại bản ghi vì lỗi gửi.
- Gửi lại thủ công bằng mã yêu cầu đã lưu; không tạo bản ghi mới. Chưa triển khai retry tự động.
- Nếu timeout khiến kết quả gửi chưa rõ, ghi nhận “chưa xác định”; kiểm tra trước khi gửi lại để hạn chế trùng, không tự đánh dấu chưa gửi hoặc đã gửi.

### Cách kiểm thử

**Test function riêng trước khi nối UI.** Chưa thực hiện kết nối UI trong bài thử này. Kiểm thử các nhánh lỗi bằng dữ liệu giả và mô phỏng lỗi, không làm hỏng cấu hình đang dùng.

| Ca thử | Tiêu chuẩn đạt có thể quan sát |
|---|---|
| DB lưu thành công, Telegram hoạt động | Đọc lại được bản ghi; Admin lớn nhận thông báo khớp mã yêu cầu, gói và dữ liệu giả |
| DB ghi thất bại | Không gọi Telegram; kết quả không báo đã lưu |
| Telegram trả lỗi | Bản ghi vẫn đọc lại được; kết quả thể hiện lưu thành công, gửi thất bại |
| Gửi lại sau lỗi xác định | Dùng đúng bản ghi cũ; không tạo thêm yêu cầu |
| Gọi lặp sau khi gửi thành công | Không phát sinh thêm thông báo cho cùng yêu cầu |
| Telegram timeout | Bản ghi còn nguyên; trạng thái gửi là chưa xác định |
| Rà cấu hình và log | Không có giá trị secret hoặc số điện thoại trong log; cấu hình bí mật chỉ ở backend |

**Bằng chứng nghiệm thu:** mã bản ghi thử, kết quả đọc lại DB, kết quả function và thông báo Admin lớn nhận được. Chỉ ghi “đạt” sau khi chạy kiểm thử thực tế; hồ sơ bằng chứng không chứa secret.

**Thứ tự:** khảo sát môi trường thử và cơ chế lưu → chuẩn bị dữ liệu giả → kiểm thử function riêng và các nhánh lỗi → ghi bằng chứng → chủ dự án đánh giá bài thử. Chỉ đề xuất nối UI/tích hợp sản phẩm khi có quyết định riêng.


---

## 17. Tích hợp Telegram thực tế — Yêu cầu đăng ký mua gói mới

**[ĐÃ DUYỆT 2026-10-30]:** chủ dự án cho phép cập nhật plan, tích hợp Telegram bot trong Supabase và triển khai thông báo thực tế. “Task mới” đã được xác nhận là **yêu cầu đăng ký mua gói mới**, không phải bảng công việc riêng. Người nhận vẫn là **Admin lớn**, kênh liên hệ là **số điện thoại**.

**Quyết định project [ĐÃ XÁC NHẬN]:** giữ `cloudfit-internal` (`qibpsehkmzjwusllorbf`). Không chuyển sang `zrgddjxvypyjkviaqctd`, không đổi cấu hình catalog và không tạo bản sao dữ liệu sang project khác. Chủ dự án sẽ kết nối lại tài khoản có quyền truy cập.

### Phạm vi và quan hệ với MVP cũ

- Cho phép bổ sung backend lưu yêu cầu mua tối thiểu và thông báo Telegram; đây là thay đổi phạm vi so với DB-02 và phụ lục Auth trước đây. Không bổ sung giỏ hàng, thanh toán, kích hoạt dịch vụ hoặc CRM.
- Kiểm thử function riêng trước khi nối luồng tạo yêu cầu. Không biến thao tác “Chọn gói” hiện tại thành xác nhận đã mua hoặc đã thanh toán.
- D-07 về thiết kế/hành vi UI chưa được coi là chốt toàn bộ. Đối chiếu luồng tạo yêu cầu hiện có sau khi lấy lại quyền project; nếu chưa có thì trình hợp đồng lưu và UI tối thiểu trước khi nối. Không tuyên bố website đã có form gửi yêu cầu khi chưa triển khai.

### Trigger

- Một bản ghi yêu cầu đăng ký mua mới đã commit thành công trong DB.
- Trigger/hàng đợi chỉ phát sinh ở INSERT; UPDATE, tải lại trang hoặc chọn gói trong bộ nhớ không gửi thông báo.
- Kiểm tra bản ghi tồn tại từ DB ở backend; không tin payload trình duyệt như bằng chứng đã lưu.
- Cơ chế gọi function và theo dõi trạng thái được chốt theo schema thực tế; không gọi mạng đồng bộ khiến Telegram lỗi làm hủy bản ghi yêu cầu.

### Dữ liệu gửi

Mã yêu cầu, mã/tên gói, thời điểm tạo, tên người liên hệ và số điện thoại. Lấy từ bản ghi đã lưu; không gửi toàn bộ hồ sơ hoặc dữ liệu thanh toán. Ca nghiệm thu dùng dữ liệu giả, gắn nhãn rõ “DỮ LIỆU THỬ”.

### Backend `telegram-notify`

- Triển khai Supabase Edge Function trên đúng project đã chọn; chỉ cho backend/trigger được xác thực gọi, không mở endpoint gửi tin tùy ý ra công khai.
- Người nhận cố định là Admin lớn theo cấu hình backend; client không được chọn chat nhận.
- Lưu trạng thái gửi gắn với mã yêu cầu; kiểm soát gọi lặp/đồng thời trước khi gửi. Không gửi lại bản ghi đã xác nhận gửi thành công.
- Gửi lại thủ công cho lỗi xác định; chưa tự thêm retry định kỳ. Timeout hoặc kết quả không rõ phải chuyển trạng thái chưa xác định để kiểm tra trước khi gửi lại.
- Chỉ tạo hoặc sửa schema sau khi đọc bảng/quyền hiện có. Giữ nguyên dữ liệu, Auth và RLS không liên quan; không mở quyền đọc công khai danh sách yêu cầu hoặc số điện thoại.

### Quản lý secret

Chỉ ghi tên `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`; cấu hình trong Supabase Edge Function Secrets, không trong frontend, repository, tài liệu hoặc log. Không yêu cầu giá trị qua chat. Xác thực nội bộ tận dụng cơ chế Supabase phù hợp sau khảo sát, không đưa khóa quản trị vào client.

### Ứng xử khi lỗi

- **DB lỗi:** không gửi Telegram, không báo đã lưu; giữ input để thử lại.
- **Telegram lỗi:** bản ghi đã lưu còn nguyên; kết quả lưu và kết quả gửi là hai trạng thái riêng. Log chỉ mã yêu cầu và mã lỗi an toàn, không ghi số điện thoại, token, chat ID hoặc URL chứa token.
- **Timeout/kết quả không rõ:** không tự kết luận chưa gửi, không tự gửi lại gây trùng.
- **Ghi trạng thái sau gửi lỗi:** không tự gửi lần nữa; đối chiếu Telegram và bản ghi trước khi phục hồi. Không cam kết gửi đúng một lần tuyệt đối khi phía Telegram không cung cấp cơ chế chống trùng cho yêu cầu gửi.

### Cách kiểm thử và nghiệm thu

1. Chạy test riêng phần gửi với HTTP giả lập: thành công, thiếu cấu hình, bị Telegram từ chối, timeout, lỗi mạng/kết quả không rõ. Không dùng secret thật trong fixture.
2. Sau khi được quyền project: kiểm tra bảng, policy, trigger, function và cấu hình hiện có; triển khai các phần đã đối chiếu.
3. Gọi function riêng với bản ghi thử đã lưu; xác nhận Admin lớn nhận đúng thông báo, ghi mã bản ghi và kết quả gửi làm bằng chứng.
4. Kiểm thử INSERT sau commit → trigger → function → Telegram; DB rollback/lỗi không phát tin; Telegram lỗi không xóa bản ghi.
5. Kiểm thử gọi lặp/đồng thời, gửi lại lỗi xác định, timeout; người ngoài bị chặn đọc danh sách và gọi endpoint gửi tin.
6. Chỉ nối UI sau khi các kiểm thử backend đạt và hợp đồng tạo yêu cầu được xác định; kiểm tra UI không báo đã lưu khi DB lỗi.

### Trạng thái thực hiện

- [x] Chốt sự kiện, dữ liệu, người nhận và project đích.
- [x] Kiểm tra baseline repository: 15/15 tests hiện có đạt trong phiên này.
- [x] Chuẩn bị transport `supabase/functions/_shared/telegram.mjs` và `tests/telegram.test.mjs`: 8/8 ca HTTP giả lập đạt; toàn bộ 23/23 tests, syntax check và build đạt. Đây chưa phải Edge Function hoàn chỉnh, chưa phải kiểm thử DB/trigger hoặc gửi Telegram thật.
- [x] Lấy lại quyền project đích và đọc schema thành công trong phiên triển khai ngày 2026-10-30.
- [x] Kiểm tra schema/quyền/luồng ghi thực tế; đã áp dụng migration `purchase_requests_telegram_backend`, thêm hai bảng backend-only, giữ nguyên ba bảng cũ.
- [x] Runtime đã đọc cấu hình và gọi được Telegram; Telegram trả `telegram_chat_not_found`, cần kiểm tra cuộc trò chuyện Admin lớn/Start và giá trị cấu hình chat đích. Không đọc hoặc ghi giá trị secret vào tài liệu.
- [x] Deploy `telegram-notify`, kiểm thử riêng thành công, bật trigger sau commit và xác nhận Telegram trả message ID; xem mục 17.2. Chưa xác nhận bằng phản hồi người nhận.
- [ ] Nối UI và kiểm chứng đầu-cuối sau khi backend đạt.

**Chưa hoàn tất triển khai thực tế:** không coi việc cập nhật tài liệu hoặc test HTTP giả lập là đã deploy/gửi Telegram thành công. Quyền truy cập đúng project là điều kiện còn thiếu để thực hiện thao tác từ xa.


**Bàn giao kỹ thuật trong phiên 2026-10-30:** transport nhận bản ghi theo hợp đồng tối thiểu (`id`, `product_id`, `product_name`, `created_at`, `contact_name`, `phone`, cờ `is_test` cho dữ liệu thử). Đây là đầu vào nội bộ của module, không khẳng định schema project đang có các cột này. Caller phải đọc bản ghi đã commit và chiếm quyền gửi trước khi gọi transport; lớp xác thực, đọc DB, chống trùng, lưu trạng thái và trigger chờ đối chiếu project thật. Transport không retry kết quả mơ hồ, không trả nội dung lỗi có thể chứa token, không lấy nơi nhận từ bản ghi. Phần backend không nằm trong 11 file output website. Kiểm tra lại kết nối cuối phiên vẫn chỉ thấy project khác; chưa thực hiện migration/deploy hoặc kiểm thử tin thật.


### 17.1. Kết quả triển khai ban đầu — 2026-10-30

**Mốc lịch sử:** lỗi chat đích và trạng thái trigger chưa bật ở mục này đã được xử lý tại mục 17.2. Trạng thái hiện hành xem mục 17.2.

**Phần này thay thế các ghi chú “chưa có quyền/chưa deploy” ở mốc bàn giao trước.** Đã kết nối đúng `cloudfit-internal`, trạng thái healthy, đọc được ba bảng cũ và không có Edge Function trước triển khai.

- Migration từ xa `purchase_requests_telegram_backend` đã áp dụng: `public.purchase_requests`, `public.telegram_deliveries`, schema hàm nội bộ `telegram_private`, extension `pg_net`. Source đối chiếu: `supabase/telegram-schema.sql`. Cả hai bảng mới bật RLS và thu hồi quyền anon/authenticated; chỉ backend được ghi yêu cầu và trạng thái gửi.
- Edge Function `telegram-notify` đã ACTIVE, version 2. Tắt gateway JWT vì function tự xác thực bằng token ngẫu nhiên dùng một lần cho từng bản ghi; DB chỉ lưu hash. Token được tạo trong DB, không lấy từ frontend; claim trạng thái pending bằng cập nhật nguyên tử trước khi gửi. Không có thêm secret do người dùng phải nhập ngoài hai tên đã duyệt.
- Đã gọi function riêng bằng bản ghi thử `a1eca41d-5af9-4725-8b79-f97f96792a08`, nhãn DỮ LIỆU THỬ, số điện thoại giả. DB lưu và đọc lại được; Telegram trả lỗi 400 được chuẩn hóa thành `telegram_chat_not_found`. Bản ghi yêu cầu vẫn còn nguyên, trạng thái gửi là failed, chưa có message ID. Đây là kiểm chứng thực tế nhánh Telegram lỗi, **không phải gửi thành công**.
- Endpoint thiếu token trả HTTP 401. Kiểm tra quyền SQL: anon/authenticated không có quyền đọc/ghi yêu cầu, đọc/sửa trạng thái hoặc gọi hàm dispatch nội bộ. Không thêm quyền Admin hoặc tài khoản mới.
- Kiểm thử HTTP giả lập cho transport và handler: 15 ca đạt, bao gồm gọi đồng thời/replay, Telegram lỗi, timeout, lỗi DB và lỗi ghi trạng thái sau gửi. Toàn bộ dự án 30 tests đạt; syntax check và build đạt. Kiểm thử đồng thời/replay hiện là giả lập, chưa phải kiểm chứng API thật có gửi thành công.
- Security Advisor có hai thông tin `RLS Enabled No Policy` cho hai bảng backend-only mới; chủ ý không cấp policy cho client, không mở quyền chỉ để xóa thông tin này. Không có mục mức WARNING/ERROR trong kết quả kiểm tra. Hướng dẫn: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- Source trigger đã chuẩn bị ở `supabase/telegram-trigger.sql` nhưng **chưa áp dụng**: giữ đúng thứ tự test function thành công trước bật trigger. Chưa nối UI hoặc đổi nút chọn gói. Hiện tạo bản ghi mới chưa tự phát Telegram.

**Việc người dùng cần thực hiện:** mở bot bằng tài khoản Admin lớn và bấm Start; kiểm tra `TELEGRAM_CHAT_ID` trỏ tới đúng cuộc trò chuyện riêng của Admin lớn trong Supabase Secrets. Không gửi giá trị qua chat. Sau khi sửa, gửi lại thủ công cùng mã yêu cầu thử (chỉ trạng thái failed mới được dispatch lại); khi Telegram xác nhận thành công mới bật trigger và kiểm chứng INSERT/rollback/gọi lặp thật.

**Vận hành:** gọi `telegram_private.dispatch(request_id)` từ backend/quản trị tin cậy để thử lại lỗi xác định. Hàm không gửi lại pending/processing/sent/unknown; các trạng thái không rõ phải đối chiếu trước khi can thiệp. `pg_net` chỉ xử lý HTTP sau commit. Nếu queue HTTP mất hoặc timeout trước khi function claim, bản ghi có thể còn pending; chưa có retry định kỳ, cần đối chiếu HTTP trước khi phục hồi. Không xóa bản ghi yêu cầu để xử lý lỗi Telegram.

**Hoàn tác an toàn:** giữ trigger chưa bật; nếu đã bật ở bước sau, gỡ riêng trigger để dừng phát tin mới, giữ toàn bộ bản ghi và lịch sử gửi. Không chạy lại schema hoặc drop bảng để hoàn tác.


### 17.2. Kiểm thử lại thành công và bật trigger — 2026-10-30

**Trạng thái hiện hành:** kết nối project đúng; function `telegram-notify` ACTIVE version 2; trigger `purchase_requests_telegram_insert` đã bật. Phần này thay thế mốc chờ sửa chat đích/chưa bật trigger ở mục 17.1 và các ghi chú trước đó. Không yêu cầu nhập lại secret; giá trị không xuất hiện trong báo cáo.

| Kiểm chứng thực tế | Bằng chứng |
|---|---|
| Gửi lại riêng function trên yêu cầu đã lưu | Yêu cầu `a1eca41d-5af9-4725-8b79-f97f96792a08`: `sent`, Telegram message ID `4`, HTTP 200; bản ghi yêu cầu còn nguyên |
| Bật trigger | Migration `enable_purchase_requests_telegram_trigger` thành công; trigger INSERT có trạng thái enabled |
| Tạo yêu cầu mới, không gọi dispatch thủ công | Yêu cầu `be7d8ec2-992b-47b0-a816-bab5aadf8b63`: tự chuyển `sent`, Telegram message ID `5`, HTTP 200 |
| Rollback sau INSERT | Bản ghi thử `916c67e1-b9a1-4fb1-b0aa-8b220184e94a` và trạng thái gửi đều không tồn tại; hàng đợi HTTP tương ứng không còn (đều 0) |
| Gọi dispatch lại cho bản ghi đã gửi | `message_id` và `http_request_id` giữ nguyên `5`; không tạo lệnh gửi mới |
| UPDATE bản ghi đã gửi | Không kích hoạt thông báo; trạng thái và message ID giữ nguyên |

Dữ liệu giữ lại: hai yêu cầu hoàn toàn giả lập, có `is_test = true`; tin gửi có nhãn DỮ LIỆU THỬ. Không xóa lịch sử để che kết quả kiểm thử.

**Giới hạn:** Telegram API đã xác nhận gửi; chưa có phản hồi của Admin lớn xác nhận đã đọc tin trong cuộc trò chuyện. Kiểm thử đồng thời của handler vẫn là HTTP giả lập. Chưa nối UI hoặc tạo form đăng ký mua, chưa phát hành lại website. Bản ghi được tạo bởi backend/quản trị đủ quyền mới kích hoạt được luồng này; frontend anon/authenticated vẫn không được ghi trực tiếp hoặc đọc danh sách yêu cầu.

**Vận hành sau bật:** INSERT yêu cầu thành công → `pg_net` xử lý sau commit → function xác thực token và claim bản ghi → Telegram → lưu trạng thái gửi. Lỗi Telegram không làm mất yêu cầu đã lưu; lỗi xác định được thử lại thủ công, pending/processing/unknown cần đối chiếu và không tự retry. Nếu cần dừng phát tin, gỡ riêng trigger, giữ bảng và lịch sử. Chỉ nối UI sau khi chốt hợp đồng thu thập/lưu và quyền truy cập.


## 18. Gemini tóm tắt thông báo — Phương án C đã duyệt 2026-10-30

**Phạm vi đã duyệt:** Gemini tạo một câu tóm tắt trước khi Telegram gửi thông báo đăng ký mua mới. Không thêm chatbot, báo giá, tư vấn hoặc giao diện mới. Project giữ `cloudfit-internal`; trigger INSERT và cơ chế xác thực/chống trùng giữ nguyên. Chưa nối UI đăng ký mua.

### Trigger và backend

DB commit yêu cầu → trigger → `telegram-notify` xác thực token/claim → đọc bản ghi đã lưu → Gemini tóm tắt → Telegram gửi đúng một thông báo → ghi trạng thái gửi. Không gọi Gemini trước xác thực hoặc khi không claim được. Function đang ACTIVE version 8; nguồn mới: `supabase/functions/_shared/gemini.mjs`.

### Dữ liệu gửi và nội dung

- Gemini chỉ nhận **tên gói** trong object JSON. Chưa thu thập nội dung nhu cầu nên không bổ sung trường này hoặc gửi dữ liệu tự do. Không gửi tên người liên hệ, số điện thoại, mã yêu cầu, thời điểm tạo, Telegram token/chat ID hoặc token xác thực nội bộ sang Gemini.
- Model hiện dùng `gemini-3.5-flash-lite`; REST generateContent, không cài SDK/dependency. Trả JSON một câu ngắn; đầu ra tối đa 360 ký tự, phải có đúng tên gói và không chứa URL, số điện thoại hoặc các khẳng định thanh toán/kích hoạt/giá/cam kết bị cấm. Nội dung không hợp lệ được bỏ qua.
- Telegram vẫn chứa các trường gốc đã duyệt. Nếu Gemini thành công, thêm dòng **“Tóm tắt AI (tham khảo): …”**; trường gốc là căn cứ xử lý. Không xem nội dung AI là xác nhận mua/thanh toán hoặc kích hoạt dịch vụ.

### Quản lý secret

`GEMINI_API_KEY` chỉ được đọc ở Supabase Edge Function runtime và gửi Google bằng header `x-goog-api-key`, không đặt trên URL. Người dùng xác nhận đã cấu hình. Tài liệu/log/frontend/repository không chứa giá trị key. Giữ hai cấu hình Telegram bằng tên `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID`.

### Ứng xử khi lỗi

- Gemini được chờ tối đa **6 giây**, một lần gọi, không retry tự động. Thiếu key, lỗi HTTP/quota, output lỗi/bị chặn hoặc timeout → gửi ngay mẫu Telegram hiện tại, không làm hỏng yêu cầu đã lưu và không bỏ thông báo.
- Kết quả function bổ sung `summary_status` (`generated`/`fallback`) và `summary_code` an toàn; không trả raw provider error, prompt hoặc nội dung khách hàng. Hai trường này nằm ở kết quả HTTP, chưa lưu thành cột lịch sử dài hạn; hàng đợi/phản hồi pg_net có thời hạn lưu của nền tảng.
- Trạng thái gửi Telegram vẫn độc lập với chất lượng tóm tắt: `sent` có thể đi kèm `fallback`. Nếu Telegram lỗi, áp dụng nguyên tắc giữ bản ghi và gửi lại thủ công đã chốt. Không gửi thêm một tin riêng khi Gemini trả chậm.

### Cách kiểm thử và bằng chứng

- Test function riêng bằng HTTP giả lập trước deploy: whitelist dữ liệu ra Gemini; không key không gọi; HTTP lỗi/quota, JSON sai, safety block, thông tin ngoài phạm vi và timeout đều fallback; handler gửi đúng một Telegram với AI hoặc mẫu cũ.
- Toàn bộ **35/35 tests đạt**, syntax check và build đạt. Test mock không thay thế kết quả thực tế.
- Ca thực tế 1: yêu cầu `a701d977-e14f-40b1-bf3d-0bbc09365c22` gửi Telegram thành công message ID `6`, summary fallback.
- Ca thực tế 2: yêu cầu `255a34a5-d583-4197-974d-18f0026fff6b` có Gemini timeout nhưng Telegram vẫn `sent`, message ID `7`.
- Ca thực tế cuối với model hiện hành: yêu cầu `eb8ea806-75bf-4731-877d-a095dd1cc3d1` → `summary_status = generated`, `summary_code = null`, Telegram `sent`, message ID `8`.
- Các ca dùng dữ liệu giả và có nhãn DỮ LIỆU THỬ. Telegram API đã xác nhận gửi; chưa có xác nhận người nhận đã đọc nội dung. Không thay đổi schema/RLS/Auth trong lần tích hợp Gemini.

**Tiêu chuẩn đạt quan sát được:** bản ghi yêu cầu tồn tại; function báo generated và Telegram có dòng tóm tắt AI với ca thành công; Gemini lỗi/timeout vẫn có thông báo mẫu và trạng thái sent; gọi lặp không vượt cơ chế claim hiện tại. Nội dung AI cần được người nhận đối chiếu, không cam kết mô hình không bao giờ suy diễn.

**Vận hành/hoàn tác:** nếu cần dừng Gemini, bỏ secret Gemini để hệ thống dùng mẫu cũ hoặc deploy lại handler trước tích hợp; giữ trigger, DB và toàn bộ lịch sử Telegram. Theo dõi quota/chi phí trong tài khoản Google; chưa cấu hình ngân sách hoặc tự mua thêm quota.

Nguồn kỹ thuật: https://ai.google.dev/api/generate-content và https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite


## 19. Nối website và phát hành — 2026-10-30

**[ĐÃ DUYỆT]:** chủ dự án yêu cầu cập nhật toàn bộ luồng tích hợp lên website và chọn chính xác `cloudfitk.vercel.app`. Mục này thay trạng thái “chưa nối UI” ở các mốc trước. Không triển khai thanh toán, tài khoản khách, CRM hoặc mở danh sách yêu cầu công khai.

### Hành trình hiện hành

Danh mục → Chi tiết gói → **Đăng ký gói này** → nhập họ tên/số điện thoại → đồng ý dùng thông tin để xử lý đăng ký và thông báo người phụ trách qua Telegram → **Gửi đăng ký**. Website chỉ hiện **“Đã tiếp nhận đăng ký”** và mã yêu cầu sau khi backend trả xác nhận DB đã lưu. Gửi đăng ký không xác nhận thanh toán/kích hoạt hoặc giá cuối cùng.

- `catalog/purchase.mjs`: form có nhãn, autocomplete, bàn phím/focus, trạng thái đang gửi/lỗi/thành công; giữ input khi lỗi và khóa thao tác lặp khi đang gửi/đã thành công. Không hiển thị chi tiết Gemini/backend cho khách.
- Trình duyệt tạo UUID và giữ **mã yêu cầu** trong sessionStorage để thử lại; không lưu tên/số điện thoại vào storage. Nếu storage bị chặn vẫn dùng mã trong bộ nhớ. Nếu mã cũ đã lưu với nội dung khác, thông báo rõ trước khi người dùng gửi thành yêu cầu mới.
- `purchase-request` là Edge Function public tiếp nhận form, không phải endpoint gửi Telegram. Không cần khách đăng nhập Admin. Chấp nhận origin production đã chọn và localhost phục vụ kiểm thử; có validation, honeypot và giới hạn ba yêu cầu mới/số điện thoại/giờ. Origin/CORS không phải cơ chế xác thực người dùng hay chống spam toàn diện.
- RPC `submit_purchase_request` chỉ service_role gọi được: kiểm tra gói công khai tồn tại, lấy tên gói từ catalog thay vì tin giá trị client, chuẩn hóa điện thoại, dùng cùng ID để không tạo trùng và kiểm tra giới hạn trong transaction có khóa. Nguồn: `supabase/purchase-intake.sql`, migration đã áp dụng `purchase_request_public_intake`.
- Không cấp INSERT/SELECT bảng cho anon/authenticated; endpoint chỉ trả saved và mã yêu cầu, không trả dữ liệu khách. Backend/Gemini/Telegram secrets vẫn chỉ ở Supabase. Trường API `test_mode` chỉ gắn nhãn tin thử, không đổi quyền truy cập hoặc bỏ qua validation/giới hạn; form thường không gửi trường này.
- DB thành công mới kích hoạt trigger sau commit; Gemini/Telegram lỗi không làm mất yêu cầu. Khách không phải chờ Telegram gửi xong để nhận kết quả đã lưu; không khẳng định đã thông báo Admin khi chỉ có xác nhận lưu.

### Kiểm chứng và phát hành

- **40/40 unit/integration HTTP giả lập đạt**, syntax check và static build đạt. Output website có đúng 12 runtime files; SQL, tests, tài liệu và code backend/secret không nằm trong output.
- API thật: gửi hai lần cùng mã `54fab58b-6f8a-4e68-ad08-4226c2fade75` đều trả 201 với cùng ID; DB chỉ có một yêu cầu và một delivery, Telegram message ID 9. Gemini fallback vẫn gửi được mẫu Telegram.
- Transaction SQL thật: gọi cùng ID không tăng số bản ghi; tạo ba yêu cầu cùng điện thoại, yêu cầu thứ tư trả rate_limited; rollback toàn bộ giữ lại 0 dòng thử, không phát tin từ transaction này.
- Security Advisor chỉ có hai mục INFO backend-only RLS không policy đã giải thích ở mục 17.1; không WARNING/ERROR trong lần kiểm tra.
- Đã thử Playwright kiểm giao diện mobile, nhưng Chrome không mở được do `spawn EPERM`. Kịch bản ở `tests/purchase-browser.mjs`; **không ghi nhận browser/mobile E2E là đạt**. Kiểm chứng thật hoàn tất ở mức HTTP/API/DB/Telegram, chưa xác minh ảnh hoặc tương tác DOM bằng trình duyệt tự động.
- Vercel production deployment **`dpl_GHn83S3EayLGaTcevc6h2frk55YF`**, project `cloudfitk` (`prj_4VsUFRKEeUhqSKaxidhXsoT7I3sr`), team `team_GkCE0V1NDSD2YMKIrhDwai95`, trạng thái READY; alias chính **https://cloudfitk.vercel.app**. Deploy bằng 12 file output đã build, không Git commit mới; không tự đổi repository hoặc domain khác.
- Kiểm tra production: `/`, `/catalog/app.mjs`, `/catalog/purchase.mjs`, `/catalog/catalog.css` đều HTTP 200 và byte-for-byte khớp build. CORS preflight từ origin production trả 204 đúng origin; POST ca giả lập `d4c236d8-2851-410b-9b79-e7052267ac20` trả 201 saved; DB xác nhận bản ghi còn nguyên, delivery sent, Gemini generated và Telegram message ID **10**.

**Giới hạn vận hành:** giới hạn theo số điện thoại không thay CAPTCHA hoặc xác thực số điện thoại; chưa bổ sung quản trị danh sách yêu cầu, chính sách tự xóa dữ liệu, email gửi khách hoặc thanh toán. Không log dữ liệu liên hệ/secret. Cần đối chiếu nội dung/giá gói mẫu trước dùng để báo giá thực tế. Hoàn tác UI bằng deployment production trước `dpl_FVMoT1oc6AtUKJ8D6BAhe1VRx3fh`; giữ DB và lịch sử gửi, không drop bảng. Có thể dừng tiếp nhận bằng dừng endpoint riêng mà không ảnh hưởng danh mục hoặc thông báo đã lưu.


## 20. Tích hợp giao diện đã chốt, bảo toàn luồng mua — 2026-10-30

**[ĐÃ DUYỆT]:** dùng production hiện tại làm mốc, giữ nguyên `catalog/purchase.mjs` và API `purchase-request`. Chủ dự án xác nhận nguồn giao diện **Mekong Cloud Horizon tại `Docs/DESIGN.md`**, font Be Vietnam Pro, màu xanh dương, thẻ bo 24px. Các nội dung minh họa trong design như tính giá, wizard, credits/ROI không tự trở thành chức năng hoặc tuyên bố sản phẩm đã duyệt.

**Mốc thực tế:** production `dpl_GHn83S3EayLGaTcevc6h2frk55YF` được đối chiếu trực tiếp với workspace trước sửa; HTML/app/CSS/purchase khớp byte. Manifest hash bảo vệ lưu ở `Docs/ui-production-baseline.json`.

**Phần thay đổi:** chỉ `catalog/app.mjs` và `catalog/catalog.css` trong runtime: thẻ gói có phân cấp tên/mô tả/giá mẫu/nhãn/CTA; trang chi tiết có bố cục thông tin và khung đăng ký; desktop hai vùng, tablet/mobile xếp dọc; form giữ module cũ nhưng được đồng bộ qua CSS có scope. Sửa độ ưu tiên CSS checkbox để không bị quy tắc width:100% chung ghi đè. Input/nút 48px, focus rõ và giảm chuyển động khi được yêu cầu. Nội dung và trạng thái tiếp nhận từ `purchase.mjs` giữ nguyên.

**Bảo toàn:** hash `purchase.mjs` giữ nguyên `a68afc0eed8f83f8b19816257fada51583b2a14c61b70c40e9036c0af44516d2`; nguồn API index/handler/config/RPC cũng khớp baseline. Không gọi migration, không deploy lại Edge Function, không đổi secret/Auth/RLS/trigger và không gửi thêm yêu cầu thử trong đợt UI này.

**Kiểm chứng:** 40 tests đạt, syntax check và build đạt. Sau phát hành, HTTP 200 và byte nội dung app/CSS/purchase trên domain chính khớp build; purchase hash vẫn nguyên. Không khẳng định pixel-perfect hoặc mobile browser E2E đã đạt: Chrome vẫn là giới hạn môi trường `spawn EPERM` được ghi trước đó, chưa có ảnh QA mới. Các kiểm thử HTTP giả lập không thay thế kiểm thử tương tác thực tế.

**Phát hành:** production deployment `dpl_XWtBRZ3V5RiWD4QHYPQh2h6uY8XM` READY, alias https://cloudfitk.vercel.app. Chỉ hai runtime file thay đổi, vẫn 12 file website; không có API secret/backend source trong output. Có thể quay lại mốc `dpl_GHn83S3EayLGaTcevc6h2frk55YF` nếu cần hoàn tác giao diện mà không ảnh hưởng DB/Telegram/Gemini.


## 21. Phát hành trang chính hợp nhất — 2026-10-31

Chủ dự án duyệt preview local và yêu cầu cập nhật Vercel. Đã phát hành production `dpl_2YqtPCBaNPvEHbK9g8PjnMufKK3e` READY tại https://cloudfitk.vercel.app. Nội dung thiết kế gốc hiển thị sẵn, bỏ khung đóng/mở; một danh sách gói duy nhất lấy từ nguồn Supabase hiện có, tìm/lọc chung state; các chức năng chưa triển khai được ghi rõ Sắp có. Giữ cảnh báo nội dung/giá/số liệu mẫu chưa xác minh.

Purchase module, API, cấu hình/data khớp hash baseline; không đổi DB/secret/quyền hoặc deploy backend. 42 tests/check/build đạt; 13 runtime files. Kiểm tra live HTML/app/CSS/design-ui/purchase HTTP 200 khớp build; không còn details/tiêu đề bản mẫu. Browser tự động vẫn bị giới hạn như các mốc trước; chủ dự án đã xem và duyệt preview. Source, phạm vi, kiểm tra và rollback ghi tại `unified-layout-preview.md`; baseline để hoàn tác `dpl_XWtBRZ3V5RiWD4QHYPQh2h6uY8XM`.
