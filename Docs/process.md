# Process — Quy trình triển khai và nghiệm thu Google Cloud Compare

**Tệp:** `docs/process.md`  
**Phiên bản:** 0.1 — quy trình đề xuất, **chưa duyệt**  
**Ngày:** 2026-10-16  
**Áp dụng cho:** Chủ dự án, người rà soát nghiệp vụ/UI, Codex hoặc người triển khai, người kiểm thử. Một người có thể đảm nhiệm nhiều vai trò.  
**Nguồn:** `docs/project-overview-prd.md` v0.2, `docs/design-guidelines.md` v0.2, `docs/development-plan.md` v0.1.  
**Giải thích:** BA (Business Analyst) là người làm rõ yêu cầu và cách nghiệm thu; UI/UX là giao diện và trải nghiệm sử dụng; *gate* là điểm phải kiểm tra/duyệt trước khi sang công việc tiếp theo.

> **Mục tiêu:** Chuyển yêu cầu thành sản phẩm chạy được một cách có kiểm soát: **Tìm → So sánh → Chọn**. Đây là **quy trình làm việc đề xuất**, không phải khẳng định đã có đội, repo, lịch triển khai hoặc kiểm thử thật.
>
> **Quy tắc nguồn sự thật:** PRD xác định **làm gì**; Design Guideline xác định **hiển thị/tương tác thế nào**; Development Plan xác định **làm theo thứ tự nào**; Process này xác định **ai duyệt, chứng minh thế nào và xử lý thay đổi ra sao**.

## 1. Phạm vi và nguyên tắc

### 1.1. Trong phạm vi — [ĐÃ XÁC NHẬN]

- **Người dùng chính:** startup/doanh nghiệp nhỏ; cá nhân mua lẻ là nhóm phụ, cùng một luồng.
- **Nền tảng:** website responsive, desktop và điện thoại.
- **Dữ liệu:** sản phẩm Google Cloud mẫu; chưa xác nhận danh sách/thuộc tính cụ thể.
- **Hành trình:** **Tìm → So sánh → Chọn**, gồm:
  - FR-01 danh mục;
  - FR-02 tìm kiếm;
  - FR-03 lọc nhu cầu;
  - FR-04 chi tiết;
  - FR-05 so sánh tối đa 3;
  - FR-06 gợi ý theo nhu cầu.
- **Không làm trong MVP:** đăng nhập/tài khoản, giỏ hàng, thanh toán, quản lý đơn và hệ thống bán hàng/tư vấn phức tạp.

### 1.2. Nguyên tắc — [ĐỀ XUẤT QUY TRÌNH]

1. Một thay đổi phải truy được **yêu cầu (FR/BR) → màn hình/component → kiểm thử (AC/OK) → bằng chứng**.
2. **Không tự điền** giá, thông số, lợi ích, quyền Google Partner, thuật toán gợi ý hoặc nhu cầu người dùng khi nguồn chưa xác nhận.
3. **Không coi mockup là sản phẩm chạy**, cũng không coi demo có dữ liệu giả là tính năng đã nghiệm thu.
4. **Dùng đúng tên trạng thái:** `Chưa bắt đầu`, `Đang thực hiện`, `Chờ xác nhận`, `Chờ kiểm thử`, `Đạt`, `Cần sửa`, `Hoãn`.
5. Mỗi thay đổi quan trọng được báo trước và chỉ được triển khai khi đã rõ phạm vi; thay đổi gây mất dữ liệu, đổi schema, nâng quyền hoặc phát hành công khai cần phê duyệt riêng.
6. Mọi số liệu phản hồi phải có nguồn và cách thu thập; **CHƯA ĐỦ DỮ LIỆU** khi chưa có người dùng thử.

## 2. Vai trò, trách nhiệm và quyền duyệt

| Vai trò | Làm gì | Quyền quyết định |
|---|---|---|
| **Chủ dự án** | Xác nhận nhu cầu, nội dung, phạm vi, thương hiệu, tiến độ phát hành | Duyệt/từ chối các quyết định D-01…D-07, thay đổi scope, phát hành |
| **Người rà soát BA** *(có thể là chủ dự án)* | Đối chiếu PRD, định nghĩa đầu vào–đầu ra, acceptance criteria, kiểm tra mâu thuẫn | Đề xuất quy tắc, ghi thiếu sót; không tự duyệt thay chủ dự án |
| **Người rà soát UI/UX** *(có thể là chủ dự án)* | Rà màu, chữ, layout, màn hình/states và accessibility theo guideline | Đề xuất cải tiến; nội dung/brand cần chủ dự án duyệt |
| **Codex/người triển khai** | Khảo sát repo, phân giai đoạn, code trong phạm vi đã duyệt, kiểm thử, báo cáo diff | Quyết định kỹ thuật cục bộ không làm đổi hợp đồng sản phẩm; **không** tự quyết scope và brand |
| **Người kiểm thử** *(có thể là chủ dự án)* | Chạy checklist AC/OK, ghi lỗi và bằng chứng | Xác nhận kết quả test; không thay quyết định sản phẩm |

**Chưa xác nhận:** người cụ thể đảm nhiệm mỗi vai trò, lịch kiểm tra, quyền truy cập repository và môi trường triển khai.

## 3. Bảng quyết định cần khóa trước khi triển khai

| Mã | Câu hỏi cần chốt | Đầu ra được chấp thuận | Ảnh hưởng nếu còn mở |
|---|---|---|---|
| **D-01** | Dùng những sản phẩm mẫu nào? nguồn và người duyệt? | Dataset mẫu + ghi nguồn/nội dung | Không nghiệm thu danh mục và chi tiết |
| **D-02** | Khách lọc theo nhu cầu nào? chọn nhiều thế nào? | Tập nhu cầu và nhãn | Không hoàn thiện FR-03, FR-06 |
| **D-03** | So sánh theo những tiêu chí nào? | Danh sách thuộc tính và cách thể hiện thiếu dữ liệu | Không hoàn thiện FR-05 |
| **D-04** | Gợi ý dựa trên quy tắc nào, giải thích vì sao? | Quy tắc kiểm thử được; không bịa xếp hạng | Không nghiệm thu FR-06 |
| **D-05** | Ngôn ngữ giao diện chính? | Quy tắc nội dung đã chốt | Nội dung UI chỉ là minh họa |
| **D-06** | Tên công khai, đơn vị sở hữu, quyền dùng logo/tên Google? | Phê duyệt nhận diện/nội dung pháp lý | **KHÔNG được phát hành công khai** |
| **D-07** | Sau khi bấm “Chọn”, màn hình xác nhận thế nào? | Hành vi và trạng thái kết thúc luồng | Không nghiệm thu đủ “Chọn” |
| **BR-06** | Tìm trong trường nào? khi lọc nhiều điều kiện dùng AND/OR? mặc định sắp xếp thế nào? | Quy tắc tìm/lọc/sắp xếp cụ thể | Không khóa expected result của FR-02, FR-03 |
| **DB-01** | Có cần lưu lại giữa các phiên hoặc thiết bị không? | Duyệt **không DB** hoặc mở lại phân tích database | Không tự thêm Supabase |
| **TECH-01** | Có repo chưa, stack và lệnh chạy thực tế là gì? | Báo cáo khảo sát repo | Không được bịa đường dẫn/lệnh |
| **REL-01** | Host, domain, người có quyền phê duyệt bản công khai? | Quyết định phát hành | Không tự deploy public |

**Cách chốt:** mỗi quyết định lưu `ID`, `mô tả lựa chọn`, `người duyệt`, `ngày`, `tài liệu liên quan`, `ảnh hưởng`, `trạng thái`. Nếu một quyết định làm thay đổi PRD, cập nhật PRD trước rồi đồng bộ guideline/plan/process liên quan. **[CẦN XÁC NHẬN]** vẫn ở trạng thái mở cho đến khi có câu trả lời của chủ dự án.

## 4. Luồng công việc tổng thể và cổng nghiệm thu

| Bước | Đầu vào | Việc thực hiện | Đầu ra/bằng chứng | Cổng sang bước kế |
|---|---|---|---|---|
| **G0 — Chốt yêu cầu** | PRD + Design v0.2 | Duyệt D-01..D-07, BR-06, database proposal; xác định scope | Decision log, PRD/Design cập nhật | Mọi quyết định chặn từng tính năng đã duyệt |
| **G1 — Khảo sát kỹ thuật** | Tài liệu đã duyệt + repo | Kiểm tra repo, stack, lệnh test/build, baseline, xung đột | Discovery report | Chủ dự án hiểu và chấp thuận kế hoạch sửa đổi |
| **G2 — Nền tảng & dữ liệu** | Repo, dataset duyệt | Tổ chức code, data types, theme tokens, shell UI | Build local, kiểm tra dữ liệu | Có catalog mẫu hợp lệ; không bịa nội dung |
| **G3 — Khám phá sản phẩm** | FR-01..04 | Danh mục, tìm/lọc, chi tiết | Demo + AC-01..04 | Test phù hợp dữ liệu, trạng thái lỗi/trống |
| **G4 — So sánh/chọn** | FR-05, D-03, D-07 | So sánh 0–3 mục và kết thúc luồng | Demo + AC-05, OK-04/05 | Không vượt 3, có kết quả chọn đã duyệt |
| **G5 — Gợi ý/UI** | FR-06, D-04, Design | Gợi ý giải thích được; hoàn thiện mobile/desktop | Demo + AC-06, checklist UI | Không đưa tuyên bố hoặc thuật toán tự chế |
| **G6 — QA tích hợp** | Build hoàn chỉnh | E2E, accessibility, bảo mật, rà scope | Báo cáo kiểm thử, danh sách lỗi | OK-01..OK-09 đạt; lỗi nghiêm trọng đã xử lý |
| **G7 — Nghiệm thu & phát hành** | Bản ứng viên + quyền brand | Chủ dự án xem demo, kiểm tra thương hiệu, duyệt release | Quyết định **phát hành/hoãn** | OK-10 đạt và có quyền xuất bản |
| **G8 — Thu thập phản hồi** | Bản thử nghiệm, người dùng mục tiêu | Quan sát Tìm–So sánh–Chọn, ghi vướng mắc | Feedback log & đề xuất sửa sau MVP | Mọi tính năng mới quay về cổng thay đổi |

**Không bắt buộc chờ duyệt G0 để làm tác vụ độc lập như chuẩn bị tài liệu hoặc khảo sát repo chỉ đọc; nhưng không triển khai logic đang chặn bằng giả định tự đặt.**

## 5. Quy trình thực hiện một đầu việc

### 5.1. Từ yêu cầu tới tác vụ

1. **Chọn một FR/AC cụ thể.** Ví dụ: FR-05, AC-05a...e; không giao “làm toàn bộ website”.
2. **Xác nhận đầu vào** (dataset, bảng thuộc tính, guideline và quyết định còn mở).
3. **Ghi tác động:** component nào, state nào, giao diện nào; file thực tế chỉ xác định sau khi khảo sát repo.
4. **Viết kịch bản test trước khi sửa:** trường hợp thường, rỗng, lỗi, giới hạn.
5. **Triển khai nhỏ và kiểm tra:** chạy đúng lint/test/build đã ghi ở G1.
6. **Kiểm tra diff:** không có tính năng mới, không xóa dữ liệu/đổi quyền ngoài yêu cầu.
7. **Ghi bằng chứng và chuyển trạng thái:** `Chờ kiểm thử` → `Đạt` hoặc `Cần sửa`.

### 5.2. Mẫu phiếu đầu việc

```text
Mã việc: TASK-[CẦN ĐÁNH SỐ]
Nguồn: FR-__ / BR-__ / AC-__ / OK-__
Mục tiêu: [một hành vi có thể kiểm chứng]
Đầu vào/phụ thuộc: [dataset, quyết định đã duyệt]
Khu vực UI/module: [tên thực tế sau khảo sát repo]
Không làm: [ranh giới scope]
Trường hợp thử: [mặc định / trống / lỗi / biên]
Done: [tín hiệu người kiểm thử quan sát được]
Bằng chứng: [kết quả test, ảnh/video nếu có, liên kết thay đổi]
Người duyệt / trạng thái: [...]
```

### 5.3. Định nghĩa mức ưu tiên

- **P0:** 6 FR trong PRD + xử lý lỗi cơ bản, responsive, quy định thương hiệu để hoàn tất luồng.
- **Ngoài phạm vi:** tính năng mới chưa duyệt, không được gắn nhãn P0 chỉ vì tiện triển khai.
- **Khuyết điểm chặn:** khiến không tìm, không so sánh, không chọn hoặc tạo thông tin sai/tuyên bố thương hiệu sai → phải xử lý trước nghiệm thu.
- **Khuyết điểm không chặn:** vẫn ghi issue, chủ dự án quyết định sửa trước hay sau thử nghiệm.

## 6. Ma trận truy vết BA → UI/UX → QA

| Yêu cầu | Màn hình/thành phần | Kịch bản bắt buộc | Trạng thái kỳ vọng |
|---|---|---|---|
| **FR-01 / AC-01 / OK-01** | CatalogPage / ProductCard | Dataset có/không có sản phẩm | Có nội dung đúng; trống có thông báo |
| **FR-02 / AC-02 / OK-02** | SearchField | Tìm khớp, không khớp, xóa | Danh sách đúng; có đường khôi phục |
| **FR-03 / AC-03 / OK-02** | NeedFilter | Chọn/bỏ nhu cầu | Bộ lọc nhìn thấy, kết quả theo rule duyệt |
| **FR-04 / AC-04 / OK-03** | ProductDetail | Mở ID có/không có; trường thiếu | Nhất quán; “Chưa có dữ liệu”; quay lại |
| **FR-05 / AC-05 / OK-04,05** | CompareTray / CompareTable | Thêm 1/2/3/4, trùng, bỏ, dữ liệu thiếu | Tối đa 3; không mất mục đã chọn; bảng đúng |
| **FR-06 / AC-06 / OK-06** | SuggestionSection | Nhu cầu có/không khớp | Giải thích theo rule duyệt; không bịa xếp hạng |
| **Core flow / OK-07** | Catalog → Detail → Compare → Choose | Thực hiện trên desktop/mobile | Kết thúc theo D-07; không bế tắc |
| **OUT / OK-08** | Toàn website | Rà menu, UI, network/module | Không có auth/cart/checkout/order |
| **Quality / OK-09** | Toàn website | Tab/Enter/Space, focus, zoom, lỗi/empty/loading | Dùng được và có hướng phục hồi |
| **Brand / OK-10** | Header/footer/copy/hình ảnh | Rà tên/logo/icon/khẳng định nguồn | Không tự xưng Google hoặc Partner |

**Chuẩn chứng cứ tối thiểu [ĐỀ XUẤT]:** số bản build/commit, môi trường, kịch bản, kết quả **Đạt/Không đạt/Chưa chạy**, ảnh hoặc ghi chú khi có lỗi, người kiểm tra. Không đánh dấu “Đạt” nếu mới đọc code mà chưa kiểm thử.

## 7. Quy trình xử lý lỗi, thay đổi và mâu thuẫn

### 7.1. Ghi lỗi

| Trường | Cách ghi |
|---|---|
| ID | `BUG-...` |
| Liên kết | FR/AC/OK liên quan |
| Môi trường | Thiết bị/trình duyệt/phiên bản [thực tế] |
| Bước tái hiện | Các thao tác cụ thể |
| Kết quả thực tế | Điều đã nhìn thấy |
| Kết quả đúng | Theo PRD/Design đã duyệt |
| Mức ảnh hưởng | Chặn luồng / Không chặn |
| Bằng chứng | Ảnh/recording/log không chứa dữ liệu nhạy cảm |
| Trạng thái | Mở → Đang sửa → Kiểm thử lại → Đạt/Hoãn |

### 7.2. Khi yêu cầu thay đổi

1. Người yêu cầu nói rõ **đang đổi điều gì, vì sao**; không cần biết code.
2. Người rà soát BA chỉ ra tác động đến P0/OUT, FR/AC, UI, data, test và tiến độ.
3. Chủ dự án **phê duyệt hoặc từ chối** thay đổi.
4. Nếu duyệt, sửa nguồn gốc trước: **PRD → Design Guideline → Development Plan → Process (nếu thay đổi workflow)**.
5. Codex khảo sát repo, đưa diff dự kiến rồi mới sửa code.
6. Chạy test mới + test hồi quy cũ; cập nhật log quyết định và bằng chứng.

**Ví dụ thay đổi phạm vi:** yêu cầu thêm mua hàng/thanh toán hoặc lưu lịch sử — hiện **ngoài MVP**; phải làm thay đổi yêu cầu, bảo mật, dữ liệu và kế hoạch. Không tự đưa vào trong một task so sánh.

### 7.3. Khi có mâu thuẫn

- **PRD và design khác nhau:** quay lại chủ dự án xác nhận sản phẩm cần làm gì; sau đó cập nhật design.
- **Design và code khác nhau:** nếu design đã duyệt, sửa code; nếu design chưa duyệt, hỏi trước.
- **Repo và plan khác nhau:** ghi lại phát hiện, đề xuất thay đổi plan; không giả lập cấu trúc repo.
- **Mô tả Google hoặc nhãn hiệu chưa có quyền:** dùng nội dung trung tính ở môi trường thử nghiệm và **dừng phát hành công khai**.
- **Quy tắc gợi ý chưa rõ:** không tạo thuật toán xếp hạng/điểm số rồi coi như đã duyệt.

## 8. Quyết định database và điều kiện mở rộng

**Đề xuất hiện tại: không cần database — [CẦN CHỦ DỰ ÁN DUYỆT DB-01].**

| Dữ liệu/trạng thái | Nơi tồn tại trong phương án đề xuất | Lý do |
|---|---|---|
| Danh sách sản phẩm mẫu | File JSON/TS nội bộ | Nội dung chỉ đọc, chưa có quản trị |
| Từ khóa/bộ lọc | Bộ nhớ ứng dụng trong phiên | Không có yêu cầu lưu lịch sử |
| Danh sách tối đa 3 sản phẩm so sánh | Bộ nhớ ứng dụng trong phiên | Không đồng bộ giữa thiết bị |
| Sản phẩm đã chọn | Bộ nhớ phiên **nếu D-07 được duyệt** | Không phải đơn hàng |

**Không có phase Supabase/UI–database** trong nhánh đang đề xuất, vì không có dữ liệu server cần lưu. **Không tạo schema hoặc tự kết nối Supabase.**

Nếu chủ dự án bổ sung yêu cầu thật về lưu dữ liệu qua phiên/tài khoản/đơn hàng/đa thiết bị, quy trình mới là:
1. Ghi thay đổi và xác nhận phạm vi.
2. Đánh giá lại nhu cầu database; đưa schema tối giản, quyền truy cập và tác động để duyệt.
3. Nếu dùng Supabase, xác minh đúng project và schema hiện hữu bằng connector thật; duyệt chính xác bản thay đổi trước bất kỳ thao tác ghi nào.
4. Chỉ sau khi database đã được tạo **và đọc lại để xác minh**, cập nhật `development-plan.md` thêm phase **đấu nối UI với database** (mapping form/list/state → table/field thực, auth/RLS khi liên quan, integration tests).
5. Không áp migration phá hủy hoặc đổi quyền mà thiếu duyệt riêng.

## 9. Kiểm soát chất lượng UI/UX và nội dung

- **Nguồn tham chiếu:** Material Design 3 để áp dụng nguyên tắc component, typography, màu theo vai trò; **không phải giấy phép dùng nhận diện Google**.
- **Màu đề xuất:** `#1D4ED8` primary, `#F8FAFC` background, `#FFFFFF` surface, `#0F172A` text; font Roboto. Đây là **thiết kế dự kiến v0.2, chờ duyệt**.
- **Bố cục:** desktop có vùng tìm/lọc và danh sách; mobile tìm/đóng mở lọc, thẻ một cột; bảng so sánh có cách cuộn đọc được.
- **Trạng thái:** mặc định, chọn, đang tải (nếu có tải), trống, thiếu dữ liệu, lỗi và phục hồi.
- **Tương tác:** focus bàn phím rõ, nút có nhãn, thông báo bằng chữ, bảng có tiêu đề hàng/cột đúng; không chỉ thể hiện bằng màu.
- **Trình bày dữ liệu:** cùng nguồn mẫu; thiếu ghi “Chưa có dữ liệu”; không tự thêm giá, tiết kiệm %, đánh giá sao, chứng nhận hoặc kết luận “tốt nhất”.
- **Kiểm thử:** mobile/desktop, zoom, tên sản phẩm dài, 0/1/2/3 sản phẩm, nhập từ khóa không khớp, bỏ lọc, sản phẩm thiếu trường.
- **Brand:** không đưa logo/icon Google/Partner, Google Sans, tên miền chứa nhãn hiệu hoặc công bố tư cách chính thức khi chưa có quyền; chủ dự án phải duyệt tên/nhận diện công khai.

## 10. Mẫu báo cáo mỗi lần Codex hoàn thành một phase

```text
PHASE: [0..6] / Ngày: [thực tế]
Phạm vi FR/AC: [...]
Đã làm: [các hành vi hoàn tất, không chỉ danh sách file]
File đã tạo/sửa: [đường dẫn repo đã xác minh]
Quyết định đã dùng: [ID + trạng thái]
Lệnh đã chạy: [test / lint / typecheck / build và kết quả thật]
Đã kiểm chứng: [test case, ảnh/bằng chứng]
Chưa làm/chờ duyệt: [D-xx, lỗi, rủi ro]
Thay đổi ngoài dự kiến: [không / liệt kê + ai đã duyệt]
Đề nghị nghiệm thu: [Đạt / Cần sửa / Hoãn]
Công việc tiếp theo: [không tự triển khai nếu cần chủ dự án duyệt]
```

**Quy tắc báo cáo:** không ghi “đã chạy test”, “đã deploy” hoặc “đã kiểm tra repo” nếu không có thao tác thực tế và bằng chứng tương ứng.

## 11. Quy trình nghiệm thu và phát hành

### 11.1. Nghiệm thu nội bộ

- [ ] Chạy toàn bộ ma trận FR-01..06, AC-01..06, OK-01..10.
- [ ] Chạy xuyên suốt **Tìm → So sánh → Chọn** trên mobile và desktop.
- [ ] Kiểm thử nội dung đúng nguồn, không tự bịa về Google Cloud.
- [ ] Test tải/trống/lỗi/thiếu dữ liệu/giới hạn 3/điều hướng quay lại.
- [ ] Kiểm tra bàn phím, phóng to, tương phản và màn hình nhỏ.
- [ ] Không xuất hiện chức năng ngoài scope.
- [ ] Test/lint/build theo repository thật đều có kết quả.
- [ ] Người duyệt kiểm tra các quyết định D-01..D-07 và DB-01.

### 11.2. Cổng phát hành công khai

**Không phát hành nếu còn một trong các việc sau:**
- D-06 (tư cách thương hiệu, quyền sử dụng tên/logo/icon, tên miền) chưa được giải quyết;
- còn lỗi chặn luồng chính hoặc thông tin sai về sản phẩm;
- website chứa dữ liệu cá nhân/secrets hoặc nội dung chưa được duyệt;
- chủ dự án chưa đồng ý môi trường, domain và phạm vi chia sẻ.

**Bản thử nghiệm giới hạn:** chỉ theo quyền và môi trường được duyệt; không suy diễn việc chia sẻ nội bộ là đã có phép công khai thương hiệu.

### 11.3. Phản hồi sau bản thử

Ghi theo mẫu: `đối tượng đã thử`, `tình huống sử dụng`, `đến bước nào`, `vướng ở đâu`, `chọn được hay không`, `đề xuất`, `bằng chứng`. **Không tự tạo dữ liệu phỏng vấn hoặc KPI.** Chủ dự án chọn sửa trong phạm vi hay mở quy trình thay đổi phiên bản sau.

## 12. Cách bàn giao cho Codex

### Hồ sơ cốt lõi

1. `docs/project-overview-prd.md` — phạm vi và tiêu chí chấp nhận.
2. `docs/design-guidelines.md` — UI/UX và nguyên tắc thị giác.
3. `docs/development-plan.md` — giai đoạn, module, kiểm thử.
4. `docs/process.md` — quy trình duyệt, bằng chứng, quản lý thay đổi (*tài liệu bổ sung theo yêu cầu chủ dự án*).

**Nếu Codex yêu cầu bộ 3 file đặt ở root**, có thể chép ba tài liệu cốt lõi lên thư mục gốc, giữ nội dung nhất quán; `process.md` là tài liệu phụ để tham khảo. Không tuyên bố các file đã được sao chép vào repo của người dùng.

### Câu lệnh khởi động đề xuất

> Đọc `project-overview-prd.md`, `design-guidelines.md`, `development-plan.md` và `docs/process.md` (nếu có). Trước khi code, hãy khảo sát repository, báo lại stack, lệnh chạy, phạm vi file sẽ thay đổi và danh sách quyết định `[CẦN XÁC NHẬN]` đang chặn triển khai. Không tự bịa nội dung sản phẩm, quy tắc gợi ý hay quyền thương hiệu. Sau khi có phê duyệt, thực hiện từng phase trong `development-plan.md`, chạy kiểm thử và báo bằng chứng theo `process.md`.

**Trạng thái hiện tại:** Đã soạn quy trình để duyệt; **chưa có repo được khảo sát, chưa viết/sửa code, chưa tạo database, chưa chạy test, chưa deploy**.
