# Project Overview & PRD — Google Cloud Compare

**Đường dẫn:** `docs/project-overview-prd.md`  
**Phiên bản:** 0.3 — đồng bộ quyết định AUTH-01…04; các đặc tả BA khác vẫn chưa duyệt  
**Ngày cập nhật:** 2026-10-26  
**Tên dự án đang dùng:** Google Cloud Compare — **tên tạm**, chưa được xác nhận quyền dùng làm thương hiệu công khai.  
**Nguồn yêu cầu:** Nội dung người dùng đã xác nhận trong hội thoại; file PRD v0.1.  
**Phân loại:** **[ĐÃ XÁC NHẬN]** = người dùng đã chốt; **[ĐỀ XUẤT BA]** = đặc tả thêm để đội triển khai thống nhất, chờ duyệt; **[CẦN XÁC NHẬN]** = chưa đủ thông tin.  
**Từ ngữ:** MVP = phiên bản nhỏ nhất đủ để thử; tiêu chí nghiệm thu = điều kiện kiểm tra một chức năng có làm đúng hay không.

## 1. Vấn đề

### 1.1. Bài toán cần giải quyết — [ĐÃ XÁC NHẬN]

Startup và doanh nghiệp nhỏ muốn tìm sản phẩm Google Cloud phục vụ lưu trữ, tích hợp công cụ và làm việc liền mạch, nhưng:
1. Không biết nên chọn sản phẩm nào phù hợp.
2. Phải tự tìm hiểu nhiều sản phẩm và khó so sánh.
3. Việc mua từng công cụ riêng có thể dẫn đến tích hợp, quản lý và lưu trữ rời rạc.

**Cách làm hiện tại:** tự tìm trên Google Cloud Marketplace hoặc thông qua nhân viên tư vấn/đơn vị cung cấp.

**Mức độ phổ biến, bằng chứng phỏng vấn, tần suất và thiệt hại định lượng:** **[CẦN XÁC NHẬN]**. Đây là mô tả vấn đề do người dùng cung cấp, **chưa được xác thực bằng nghiên cứu khách hàng**.

### 1.2. Vấn đề cốt lõi — [ĐÃ XÁC NHẬN]

Khách hàng cần đi từ **Tìm → So sánh → Chọn** sản phẩm phù hợp, thay vì tự dò các mô tả sản phẩm rời rạc.

### 1.3. Phân định website và hệ sinh thái Google — [CẦN XÁC NHẬN]

- Vai trò website trong giai đoạn đầu là **hỗ trợ khám phá và lựa chọn**, **không giao dịch mua hàng**.
- Chủ sở hữu website, quan hệ đối tác/ủy quyền với Google, quyền dùng tên **Google Cloud Compare**, logo/icon Google và tư cách đại lý chính thức: **[CẦN XÁC NHẬN]**.
- **Ràng buộc phát hành [ĐỀ XUẤT BA]:** Trước khi website công khai, phải xác minh quyền sử dụng tên và hình ảnh thương mại; không viết nội dung khiến khách hiểu website thuộc Google nếu chưa có cơ sở.

## 2. Mục tiêu MVP

### 2.1. Mục tiêu sản phẩm — [ĐÃ XÁC NHẬN]

Xây dựng **website responsive** phục vụ startup/doanh nghiệp nhỏ, dùng **dữ liệu sản phẩm mẫu**, giúp người dùng:
1. Tìm sản phẩm Google Cloud.
2. Lọc và xem thông tin sản phẩm.
3. So sánh tối đa **3** sản phẩm.
4. Xem gợi ý phù hợp.
5. Chọn sản phẩm đáp ứng nhu cầu.

**Hành động quan trọng nhất:** **Tìm → So sánh → Chọn**.

### 2.2. Ranh giới kết quả — [ĐỀ XUẤT BA]

- “Chọn” trong MVP là **đưa ra quyết định trên giao diện**, không đồng nghĩa đặt hàng, báo giá, kích hoạt dịch vụ, thanh toán hoặc cung cấp tư vấn được Google chứng thực.
- Việc người dùng bấm nút chọn có cần tạo kết quả xác nhận trên màn hình hay không: **[CẦN XÁC NHẬN]**; bản triển khai đề xuất có thể hiển thị tên sản phẩm đã chọn **tạm thời trong phiên sử dụng**, không lưu máy chủ.
- Hướng dẫn sản phẩm hoặc gợi ý **không thay thế** đánh giá kỹ thuật của khách hàng.

### 2.3. Luồng đầu–cuối — [ĐỀ XUẤT BA, bám sát chức năng đã chốt]

`Mở danh mục → nhập từ khóa / lọc theo nhu cầu → mở chi tiết → thêm vào danh sách so sánh (tối đa 3) → đọc bảng so sánh → chọn sản phẩm`.

Nhánh phụ cùng luồng: `chọn nhu cầu → xem danh sách gợi ý → mở chi tiết/so sánh → chọn`.

Không tạo luồng mua hàng hay quản trị kinh doanh trong nhịp này. Ngoại lệ đã duyệt: xác thực tài khoản Admin và bảo vệ quyền dữ liệu hiện có theo AUTH-01…04; không có tài khoản khách.

### 2.4. Những quyết định còn mở

| ID | Nội dung | Trạng thái | Ảnh hưởng |
|---|---|---|---|
| D-01 | Danh sách sản phẩm mẫu, nguồn mô tả và người duyệt nội dung | [CẦN XÁC NHẬN] | Độ tin cậy nội dung |
| D-02 | Bộ nhu cầu để lọc và gợi ý (ví dụ lưu trữ, tích hợp, cộng tác là **ví dụ**, không phải danh mục đã duyệt) | [CẦN XÁC NHẬN] | Tìm/lọc/gợi ý |
| D-03 | Trường dùng để so sánh: tính năng, trường hợp sử dụng, điểm cần lưu ý...? | [CẦN XÁC NHẬN] | Tính hữu ích bảng so sánh |
| D-04 | Quy tắc xếp hạng/gợi ý và giải thích vì sao phù hợp | [CẦN XÁC NHẬN] | Tính đúng đắn gợi ý |
| D-05 | Ngôn ngữ giao diện, cách viết tên sản phẩm | [CẦN XÁC NHẬN] | Nội dung/UI |
| D-06 | Tên website hợp lệ và tư cách liên quan đến Google | [CẦN XÁC NHẬN] | Rủi ro thương hiệu |
| D-07 | Có xác nhận lựa chọn trên giao diện sau khi bấm “Chọn” không | [CẦN XÁC NHẬN] | Kết thúc luồng |

## 3. Người dùng

### 3.1. Nhóm chính — [ĐÃ XÁC NHẬN]

**Startup và doanh nghiệp nhỏ**, vào website khi cần tìm giải pháp hỗ trợ:
- Làm việc liền mạch.
- Tích hợp công cụ.
- Lưu trữ.

Không mặc định người này là kỹ sư, giám đốc CNTT hay người có quyền mua; **vai trò nội bộ của người sử dụng: [CẦN XÁC NHẬN]**.

### 3.2. Nhóm phụ — [ĐÃ XÁC NHẬN]

**Người mua cá nhân**, được dùng **cùng luồng** tìm, so sánh, chọn. Không có màn hình, quyền truy cập hay chức năng riêng.

### 3.3. Nhu cầu người dùng — [ĐÃ XÁC NHẬN]

| Nhu cầu | Hành vi mong đợi trên website |
|---|---|
| Không biết sản phẩm nào phù hợp | Xem danh mục, lọc theo nhu cầu, xem gợi ý |
| Khó hiểu sản phẩm | Xem mô tả chi tiết |
| Khó so sánh nhiều lựa chọn | Chọn tối đa 3 sản phẩm và đối chiếu |
| Muốn ra quyết định | Chọn được một sản phẩm sau khi xem thông tin |

### 3.4. Phát biểu nhu cầu (Job-to-be-done) — [ĐỀ XUẤT BA]

“Khi doanh nghiệp cần công cụ lưu trữ hoặc tích hợp, tôi muốn tìm và so sánh sản phẩm Google Cloud theo nhu cầu, để có thể chọn phương án phù hợp.”

## 4. Chức năng MVP

**Mức ưu tiên:** P0 = bắt buộc để đi hết luồng; tất cả 6 mục bên dưới đều nằm trong phạm vi đã thảo luận, **không bổ sung module mới**. Các quy tắc chi tiết gắn **[ĐỀ XUẤT BA]** cần được duyệt trước khi coi là hợp đồng triển khai.

### 4.1. Bảng chức năng và điều kiện nghiệm thu

| Mã | Tính năng/P0 | Đầu vào | Xử lý/kết quả mong đợi | Tiêu chí nghiệm thu có thể kiểm tra |
|---|---|---|---|---|
| **FR-01** | **Danh mục sản phẩm** | Bộ dữ liệu mẫu được duyệt | Liệt kê tên và mô tả ngắn từng sản phẩm | AC-01a: có dữ liệu thì hiển thị đúng sản phẩm từ bộ mẫu; AC-01b: không có dữ liệu thì hiển thị thông báo trống; AC-01c: có thể mở chi tiết từ một sản phẩm |
| **FR-02** | **Tìm kiếm** | Từ khóa do khách nhập | Lọc các sản phẩm khớp thông tin được phép tìm | AC-02a: có kết quả thì chỉ hiển thị mục khớp; AC-02b: không khớp có trạng thái “Không tìm thấy”; AC-02c: xóa từ khóa khôi phục danh sách theo bộ lọc đang chọn |
| **FR-03** | **Lọc theo nhu cầu** | Một hoặc nhiều nhu cầu [CẦN XÁC NHẬN] | Lọc danh sách theo nhu cầu | AC-03a: sản phẩm hiện ra phù hợp với bộ lọc; AC-03b: người dùng nhìn thấy bộ lọc đang áp dụng; AC-03c: có thể bỏ lọc |
| **FR-04** | **Chi tiết sản phẩm** | Sản phẩm người dùng chọn | Hiển thị nội dung mô tả từ dữ liệu mẫu | AC-04a: đúng tên và thông tin của sản phẩm; AC-04b: trường thiếu không hiển thị thông tin bịa; AC-04c: từ chi tiết quay lại tìm kiếm/so sánh được |
| **FR-05** | **So sánh tối đa 3 sản phẩm** | Sản phẩm được thêm/bỏ | Hiển thị các sản phẩm cạnh nhau theo tiêu chí thống nhất | AC-05a: không thể có quá 3 mục; AC-05b: thêm trùng không tạo bản sao; AC-05c: bỏ một mục làm bảng cập nhật; AC-05d: các trường thiếu được ghi rõ “Chưa có dữ liệu”; AC-05e: có thể tiếp tục chọn sản phẩm |
| **FR-06** | **Gợi ý sản phẩm phù hợp** | Nhu cầu đã chọn | Trả về sản phẩm khớp theo quy tắc được duyệt | AC-06a: chỉ gợi ý các mục có trong dữ liệu mẫu; AC-06b: không có kết quả thì nói rõ; AC-06c: không gọi là “phù hợp nhất” nếu chưa có quy tắc và bằng chứng; AC-06d: người dùng có thể xem chi tiết/so sánh sản phẩm gợi ý |

> **Cần chốt trước khi phát triển logic FR-02/03/05/06:** trường tìm kiếm, bộ lọc, tiêu chí so sánh, thuật toán gợi ý. Cho tới khi chốt, các hàng trên là **khung kiểm thử dự kiến**, chưa phải đặc tả đầy đủ để lập trình chính xác.

### 4.2. Quy tắc nghiệp vụ — [ĐỀ XUẤT BA]

| Mã | Quy tắc | Trạng thái |
|---|---|---|
| BR-01 | Một sản phẩm có một `id` duy nhất; chỉ tham chiếu bằng `id`, không theo tên hiển thị. | Đề xuất |
| BR-02 | Dữ liệu trên danh mục, chi tiết, so sánh và gợi ý phải nhất quán từ **cùng bộ dữ liệu mẫu**. | Đề xuất |
| BR-03 | Không hiển thị giá, mức tiết kiệm, đánh giá sao hoặc chứng nhận khi dữ liệu chưa được xác minh. | Đề xuất |
| BR-04 | Giới hạn so sánh là **tối đa 3**; nếu cố thêm sản phẩm thứ 4, giữ nguyên lựa chọn cũ và thông báo rõ cách bỏ bớt. | Giới hạn đã chốt; cách phản hồi đề xuất |
| BR-05 | Không tính “sản phẩm tốt nhất” hoặc “tương thích với hệ thống hiện tại” chỉ từ nhãn nhu cầu nếu chưa có quy tắc và bằng chứng. | Đề xuất |
| BR-06 | Tìm kiếm và lọc kết hợp bằng AND hay OR, tìm trong các trường nào, sắp xếp mặc định ra sao: **[CẦN XÁC NHẬN]**. | Mở |
| BR-07 | Bộ gợi ý theo nhãn nhu cầu, điểm số hay quy tắc chuyên gia: **[CẦN XÁC NHẬN]**. | Mở |
| BR-08 | “Chọn” một sản phẩm chỉ là xác nhận trong giao diện; không lưu đơn hàng hay thông tin cá nhân. Cách hiển thị kết quả: **[CẦN XÁC NHẬN]**. | Đề xuất |

### 4.3. Bộ dữ liệu mẫu tối thiểu — [ĐỀ XUẤT BA]

Đây là **đề xuất cấu trúc dữ liệu**, không phải yêu cầu tạo cơ sở dữ liệu.

| Trường | Loại thông tin | Vai trò | Bắt buộc? |
|---|---|---|---|
| `id` | Mã nội bộ | Nhận diện sản phẩm duy nhất | Có |
| `name` | Tên sản phẩm | Danh mục/chi tiết/so sánh | Có |
| `shortDescription` | Mô tả ngắn | Danh sách, kết quả tìm | Có |
| `detailDescription` | Mô tả đầy đủ | Chi tiết | Có |
| `needTags` | Danh sách nhu cầu | Lọc/gợi ý | [CẦN XÁC NHẬN] |
| `compareAttributes` | Tập thuộc tính so sánh | Bảng so sánh | [CẦN XÁC NHẬN] |
| `sourceUrl` | Đường dẫn nguồn tham khảo chính thức | Kiểm soát nội dung | Đề xuất |
| `lastReviewedAt` | Ngày rà soát nội dung | Tránh mô tả lỗi thời | Đề xuất |

**Danh sách sản phẩm mẫu thực tế, nội dung trường, số lượng và nguồn cho từng mục: [CẦN XÁC NHẬN].** Không đưa số liệu, gói giá hoặc khẳng định hiệu năng vào dữ liệu mẫu khi chưa có căn cứ.

### 4.4. Tình huống ngoại lệ và phản hồi — [ĐỀ XUẤT BA]

| Tình huống | Phản hồi yêu cầu |
|---|---|
| Từ khóa rỗng | Hiển thị danh mục theo bộ lọc đang chọn; không báo lỗi |
| Không có kết quả tìm/lọc | Thông báo dễ hiểu và cách xóa từ khóa/bộ lọc |
| Dữ liệu danh mục rỗng | Trạng thái trống thay vì trang trắng |
| Thiếu trường so sánh | Hiển thị “Chưa có dữ liệu”; không suy đoán |
| Sản phẩm không tồn tại | Thông báo không tìm thấy và đường về danh mục |
| Thêm sản phẩm đã chọn | Giữ một mục duy nhất |
| Thêm sản phẩm thứ 4 | Không thêm; thông báo giới hạn 3 |
| Chưa chọn đủ thông tin cho gợi ý | Không khẳng định gợi ý chính xác; hướng dẫn chọn nhu cầu |
| Lỗi tải dữ liệu mẫu | Hiển thị lỗi và cách thử lại |
| Màn hình nhỏ | Bảng so sánh vẫn đọc được, không cắt mất cột/thông tin |
| Quay lại từ chi tiết/so sánh | **Đề xuất:** giữ tìm kiếm, lọc, danh sách so sánh trong phiên; cơ chế chính xác [CẦN XÁC NHẬN] |

### 4.5. Ràng buộc phi chức năng — [ĐỀ XUẤT BA]

- **Responsive:** Luồng tìm–so sánh–chọn hoàn tất được trên điện thoại và máy tính.
- **Khả năng tiếp cận:** Thiết kế hướng tới WCAG 2.2 AA: thao tác bàn phím, trạng thái focus rõ, nhãn dễ hiểu, thông tin không chỉ thể hiện bằng màu.
- **Tin cậy nội dung:** Phân biệt sản phẩm mẫu và dữ liệu đã được xác thực; không tự dựng giá, mức phù hợp, quan hệ đại lý.
- **Quyền riêng tư:** Khách không cần đăng nhập; chỉ Admin lớn và Admin nhỏ đăng nhập theo AUTH-01. Không đưa thông tin cá nhân vào bộ mẫu; chỉ thu thập dữ liệu theo quyết định riêng được duyệt nếu có.
- **Bảo mật căn bản:** Không hiển thị khóa truy cập trong website; không hiển thị HTML không được kiểm soát từ dữ liệu mẫu.
- **Tốc độ tải, trình duyệt và mức hỗ trợ cụ thể:** **[CẦN XÁC NHẬN]**.

### 4.6. Truy vết yêu cầu → giao diện → nghiệm thu

| Yêu cầu | Khu vực UI trong Design Guideline | Điểm kiểm thử chính |
|---|---|---|
| FR-01 | Danh mục/thẻ sản phẩm | Dữ liệu có / không có |
| FR-02 | Ô tìm kiếm + kết quả | Có kết quả / không kết quả / xóa tìm |
| FR-03 | Bộ lọc nhu cầu | Áp dụng / bỏ lọc |
| FR-04 | Trang chi tiết | Đúng nội dung / thiếu trường |
| FR-05 | Thanh lựa chọn so sánh + bảng so sánh | 1–3 / thêm thứ 4 / trùng / xóa |
| FR-06 | Vùng gợi ý theo nhu cầu | Có gợi ý / không có / dữ liệu thiếu |

## 5. Chưa làm

### 5.1. Ngoài phạm vi MVP — [ĐÃ XÁC NHẬN]

- Thanh toán trực tiếp.
- Giỏ hàng.
- Quản lý đơn hàng.
- Tài khoản/đăng nhập dành cho khách (đăng nhập dành cho Admin thuộc phần bổ sung AUTH).
- Hệ thống tư vấn phức tạp.
- Hệ thống bán hàng đầy đủ.

### 5.2. Những điều không được ngầm hiểu là đã có — [ĐỀ XUẤT BA]

- Không tự thêm: chatbot AI, báo giá, tích hợp thanh toán, đặt lịch tư vấn, CRM, dashboard quản trị đầy đủ, đánh giá người dùng, đăng ký email khách, lưu lịch sử lựa chọn giữa các thiết bị. Ngoại lệ: phân quyền dữ liệu Admin tối thiểu như phụ lục AUTH.
- Không mặc định dữ liệu mẫu là bảng giá, tài liệu pháp lý hoặc hướng dẫn mua hàng chính thức của Google.
- Không mặc định website là đối tác được ủy quyền hay trang chính thức Google Cloud.
- Không tích hợp Google Cloud API/Marketplace API trong MVP khi chưa có yêu cầu và quyền phù hợp.

**Khả năng bán hàng trong giai đoạn tiếp theo:** **[CẦN XÁC NHẬN]**; không đưa vào công việc hiện tại.

## 6. Tiêu chí đạt

### 6.1. Tiêu chí chấp nhận MVP — kiểm thử được, chưa cần đặt KPI

| ID | Điều kiện đạt | Cách kiểm thử |
|---|---|---|
| OK-01 | Danh mục hiển thị nội dung của bộ dữ liệu mẫu đã duyệt | Đối chiếu mẫu với màn hình |
| OK-02 | Tìm kiếm/lọc cho kết quả phù hợp và xử lý trường hợp không có kết quả | Thử từ khóa khớp, không khớp, lọc rồi xóa |
| OK-03 | Trang chi tiết nhất quán với danh mục | Mở cùng một sản phẩm ở hai nơi |
| OK-04 | Không thể chọn hơn 3 sản phẩm để so sánh | Thử thêm sản phẩm thứ 4 và thêm trùng |
| OK-05 | Bảng so sánh hiển thị đúng dữ liệu, không tự điền ô thiếu | Đối chiếu dữ liệu mẫu có trường thiếu |
| OK-06 | Gợi ý không vượt ngoài bộ dữ liệu, không khẳng định “tốt nhất” vô căn cứ | Thử nhu cầu có/không có mục khớp |
| OK-07 | Người dùng thực hiện được luồng Tìm → So sánh → Chọn trên mobile và desktop | Thử thủ công trên hai kích thước màn hình |
| OK-08 | Không có tính năng ngoài phạm vi (thanh toán, giỏ hàng, tài khoản khách, CRM...); cho phép đăng nhập Admin theo AUTH | Rà soát UI và hành vi |
| OK-09 | Có xử lý trạng thái tải/trống/lỗi và hỗ trợ bàn phím trên các thao tác chính | Thử ngắt dữ liệu, không có dữ liệu, dùng Tab/Enter |
| OK-10 | Nội dung công khai không tự nhận là Google/đối tác được chứng thực | Rà soát tên, logo, câu chữ và giấy phép trước phát hành |

### 6.2. Thành công thực tế — [CẦN XÁC NHẬN]

- Người dùng có **thực sự tìm và chọn được sản phẩm đúng nhu cầu hay không**: cần người dùng mục tiêu thử và phản hồi.
- Phương pháp ghi nhận tỷ lệ hoàn thành, mức tự tin sau khi so sánh, tiêu chí đánh giá “phù hợp”: **[CẦN XÁC NHẬN]**.
- Không tự đặt tỷ lệ chuyển đổi, số lượt truy cập, doanh thu, thời gian hoàn thành hay các KPI số học chưa có dữ liệu.

### 6.3. Cửa duyệt trước khi bàn giao phát triển

- [ ] Duyệt D-01: danh sách và nội dung sản phẩm mẫu.
- [ ] Duyệt D-02: nhu cầu/bộ lọc.
- [ ] Duyệt D-03: thuộc tính so sánh.
- [ ] Duyệt D-04: quy tắc gợi ý.
- [ ] Duyệt D-05: ngôn ngữ giao diện.
- [ ] Duyệt D-06: tên thương mại, quan hệ với Google và phạm vi dùng tài sản thương hiệu.
- [ ] Duyệt D-07: cách hoàn thành hành động “Chọn”.
- [ ] Chấp nhận hoặc sửa các quy tắc có nhãn **[ĐỀ XUẤT BA]**.

**Tình trạng:** Có thể dùng để duyệt yêu cầu/thiết kế. **Chưa đủ cơ sở tuyên bố sẵn sàng triển khai chính xác phần gợi ý và so sánh** trước khi các quyết định mở được chốt.


---

## 7. Phụ lục Buổi 5 — Quyền công khai và đăng nhập Admin (đã phê duyệt 2026-10-26)

**Nguồn quyết định người dùng:** AUTH-01, AUTH-02, AUTH-03, AUTH-04. Phụ lục này bổ sung và có ưu tiên áp dụng tại chỗ các phát biểu cũ về "không đăng nhập/phân quyền". Các mục P0 FR-01…FR-06 vẫn giữ nguyên. Nội dung kinh doanh Admin nâng cao là tầm nhìn về sau, không là phạm vi triển khai hiện tại.

### 7.1. Ba vai trò

| Vai trò | Đăng nhập | Mục tiêu và giới hạn được duyệt |
|---|---|---|
| Khách | Không | Xem thông tin công khai; tìm, lọc, so sánh tối đa 3 và chọn trên giao diện |
| Admin lớn | Có | Quản trị dữ liệu nội bộ theo vai trò và quản lý quyền tài khoản Admin |
| Admin nhỏ | Có | Chỉ được truy cập bản ghi được phân công; không tự nâng quyền hoặc xem bản ghi ngoài phân công |

**AUTH-01 [ĐÃ DUYỆT]:** chỉ hai vai trò Admin cần đăng nhập. **AUTH-02 [ĐÃ DUYỆT]:** làm danh tính/phân quyền trước, chưa triển khai CRM, quản lý đơn, chat, lịch hẹn, bảo hành. **AUTH-03 [ĐÃ DUYỆT]:** Admin nhỏ chỉ truy cập dữ liệu được giao. **AUTH-04 [ĐÃ DUYỆT]:** ưu tiên khóa Admin, giữ lịch sử; xóa vĩnh viễn phải duyệt riêng.

### 7.2. Public / Private

- **Public [ĐÃ DUYỆT VỀ LOẠI THÔNG TIN]:** danh mục/mô tả gói được duyệt công khai; tìm-lọc-so sánh-chọn; giới thiệu và liên hệ doanh nghiệp; giá niêm yết *khi giá đã có nguồn và được phê duyệt công khai*.
- **Private:** hồ sơ khách thật, dữ liệu yêu cầu mua, lịch sử, hội thoại, lịch hẹn, chăm sóc bảo hành, danh sách/thông tin Admin, quyền và phân công. Những luồng này **chưa nằm trong công việc MVP hiện tại**, nhưng tuyệt đối không được cấp quyền đọc công khai.
- `demo_customers` theo Development Plan đang chứa dữ liệu *giả lập* có quyền xem công khai. Không tái sử dụng bảng/quyền công khai đó cho dữ liệu khách thật.
- **[CẦN XÁC NHẬN]** Giá trị giá niêm yết, nguồn giá và cách duyệt; bảng phân công thực tế; tài khoản Admin đầu tiên.

### 7.3. Functional requirements bổ sung — chỉ cho Admin

| Mã | Yêu cầu | Nghiệm thu dự kiến |
|---|---|---|
| FR-AUTH-01 | Admin đăng nhập Email + Password, Confirm Email ON; không tự đăng ký để trở thành Admin | Email chưa xác nhận không được cấp phiên sử dụng nội bộ; tài khoản hợp lệ đăng nhập được |
| FR-AUTH-02 | Chỉ thành viên Admin còn hoạt động vào được khu vực riêng | Người chưa đăng nhập/không phải Admin bị từ chối |
| FR-AUTH-03 | Admin nhỏ chỉ truy cập dữ liệu được phân công, kiểm tra tại database | Bản ghi không được giao bị từ chối cả ở UI và truy vấn trực tiếp |
| FR-AUTH-04 | Khóa quyền Admin nhưng giữ lịch sử công việc | Sau khóa, mọi truy cập riêng bị chặn; lịch sử không bị xóa |
| FR-AUTH-05 | Tải lại F5/đăng xuất/hết phiên không làm sai quyền | F5 giữ đúng quyền; đăng xuất hoặc khóa không còn quyền dữ liệu |

**[ĐỀ XUẤT kỹ thuật, chờ kiểm tra schema]:** RLS cho bảng có dữ liệu riêng; `user_id` và `auth.uid() = user_id` khi bản ghi thuộc một người; bản ghi được giao cần chính sách theo bảng/quan hệ phân công; quyền Admin lớn cần kiểm tra vai trò ở database, không dựa vào dữ liệu do trình duyệt tự cung cấp.

### 7.4. Success criteria bổ sung

- Khách không đăng nhập vẫn hoàn thành FR-01…FR-06 và không xem dữ liệu riêng.
- Hai tài khoản A (Admin lớn), B (Admin nhỏ) đăng nhập đúng vai trò, chỉ thấy dữ liệu cho phép.
- B không thể truy cập dữ liệu không được phân công hoặc tự nâng quyền.
- Khóa B: truy cập bị chặn, kể cả phiên đang mở và yêu cầu dữ liệu trực tiếp; bản ghi lịch sử giữ nguyên.
- F5, đăng xuất, mất kết nối, email chưa xác nhận đều có hành vi và thông báo phù hợp.
- **[CẦN XÁC NHẬN]** Kiểm thử cụ thể đối với các bảng hiện có sau khi kiểm tra schema/RLS thực tế.

### 7.5. Ngoài phạm vi và điểm còn mở

- **Không làm trong nhịp hiện tại:** đăng nhập khách, hồ sơ tự phục vụ, giỏ hàng/thanh toán, xác nhận đặt gói, chat, lịch hẹn, lịch sử mua/bảo hành và dashboard CRM.
- **[CẦN XÁC NHẬN]** AUTH-05 quy trình mời/cấp Admin đầu tiên; AUTH-06 tính phù hợp `app_members`; AUTH-07 cấu trúc phân công; AUTH-08 preview migration/RLS; AUTH-09 thu hồi quyền khi khóa; AUTH-10 duyệt chi tiết màn hình/luồng.
- Không coi giá thật hoặc luồng quản lý khách là dữ liệu và chức năng đã có.
