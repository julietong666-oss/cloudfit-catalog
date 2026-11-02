# Design Guidelines — Google Cloud Compare

**Tệp đề xuất:** `docs/design-guidelines.md`  
**Phiên bản:** 0.7 — visual Mekong Cloud Horizon đã chốt và tích hợp trên production  
**Ngày:** 2026-10-30  
**Trạng thái:** **DRAFT — [CẦN XÁC NHẬN] bản Design Guideline v0.2 gốc chưa được cung cấp để đối chiếu.**  
**Nguồn:** `project-overview-prd-updated.md`, `development-plan-updated.md`, quyết định AUTH-01…AUTH-04 và quyết định bài thử Telegram độc lập ngày 2026-10-30.  
**Nguyên tắc:** Không xem các đề xuất UI dưới đây là thiết kế đã duyệt; không bổ sung CRM, đơn hàng, chat, lịch hẹn hoặc bảo hành vào MVP.

## 1. Design direction

- **Hành trình chính [ĐÃ XÁC NHẬN]:** Tìm → So sánh → Chọn gói, tối đa ba mục so sánh.
- **Hướng [ĐỀ XUẤT]:** gọn gàng, dễ đọc, đáng tin; ưu tiên bảng đối chiếu rõ và chỉ một nút hành động chính trên mỗi vùng.
- **Màu tham chiếu đã được Development Plan ghi là đề xuất v0.2:** `#1D4ED8` (primary), `#F8FAFC` (background), `#FFFFFF` (surface), `#0F172A` (text), font Roboto dự kiến. **[CẦN XÁC NHẬN]** đối chiếu Design v0.2 gốc trước khi coi là chuẩn.
- Không làm UI gây hiểu nhầm đây là dịch vụ chính thức hoặc đối tác được Google ủy quyền.
- Tránh biểu đồ/dữ liệu kinh doanh hoặc giá chưa được xác minh.

## 2. UX principles

1. Khách luôn có thể tìm, lọc, xem chi tiết và so sánh mà không đăng nhập.
2. Không hiển thị thông tin cá nhân hoặc dữ liệu nội bộ trước khi xác minh danh tính và quyền.
3. Admin nhỏ không thấy chức năng quản lý quyền; mọi chức năng ẩn vẫn phải được bảo vệ bằng RLS.
4. Trạng thái loading, empty, error, success và không có quyền đều có phản hồi rõ ràng.
5. Responsive, bàn phím dùng được, thông tin không chỉ phân biệt bằng màu.

## 3. Information architecture — phạm vi thiết kế

### Public (trong MVP)
- Danh mục và ô tìm kiếm, bộ lọc nhu cầu.
- Chi tiết sản phẩm, gợi ý theo nhu cầu đã duyệt.
- Khay so sánh và bảng so sánh (tối đa ba mục).
- Thông tin giới thiệu, thông tin liên hệ doanh nghiệp và **giá niêm yết chỉ khi đã duyệt nguồn**.
- Bước “Chọn” có hành vi chi tiết [CẦN XÁC NHẬN D-07]; không tạo đơn hàng.

### Private (bổ sung đã được duyệt)
- Màn hình đăng nhập Admin.
- Vùng làm việc Admin tối thiểu: thông tin vai trò, nội dung được phép truy cập, đăng xuất.
- Điểm truy cập tác vụ khóa Admin cho Admin lớn **[CẦN XÁC NHẬN về UI/flow]**, không mặc định tạo dashboard lớn.

**Bài thử ngoài UI MVP [ĐÃ DUYỆT 2026-10-30]:** `telegram-notify` được kiểm thử riêng bằng dữ liệu giả, Admin lớn nhận, kênh liên hệ là số điện thoại. Không bổ sung form đăng ký mua, nút gửi/gửi lại Telegram, màn hình cấu hình bot hoặc dashboard vào UI hiện tại. Xem mục 15.

### Giai đoạn sau (không đưa vào UI MVP)
- Tài khoản khách và hồ sơ tự phục vụ.
- CRM khách thật, mua gói/đặt hàng, chat, lịch hẹn, bảo hành, biểu đồ nhân viên.

## 4. Core user flow

**Khách:** mở danh mục → tìm hoặc lọc → xem chi tiết → thêm tối đa ba sản phẩm để so sánh → so sánh → chọn (tạm thời trên giao diện theo quyết định D-07 còn mở).

**Admin — nhịp 1:** vào khu vực Admin → nhập email và mật khẩu → xác nhận danh tính (Confirm Email ON theo kế hoạch) → kiểm tra tư cách thành viên đang hoạt động → vào khu vực được cấp quyền → đăng xuất.

**Admin — nhịp 2:** tải dữ liệu đã được database cho phép → xem đúng phạm vi quản trị hoặc phân công → thao tác theo quyền; nếu bị khóa hoặc không có quyền thì hiển thị trạng thái từ chối an toàn.

## 5. Screens and states

| Màn hình/khu vực | Nội dung, hành động | State bắt buộc |
|---|---|---|
| Public Catalog | Danh mục, tìm kiếm, lọc | default, loading, empty, error |
| Product Detail | Thông tin gói, thuộc tính, nguồn nếu có | default, missing, not-found, error |
| Compare | Khay chọn, bảng tối đa ba cột sản phẩm | 0/1/2/3 mục, vượt giới hạn, missing |
| Suggestions | Danh sách gợi ý theo rule được duyệt | loading, có/không kết quả, error |
| Public Info | Giới thiệu, liên hệ, giá niêm yết đã duyệt | default, missing/unapproved price |
| Admin Sign In | Email, mật khẩu, đăng nhập, quay lại public | default, submitting, invalid, unconfirmed-email, blocked, network-error |
| Admin Access Surface | Vai trò, vùng dữ liệu có quyền, đăng xuất | loading-auth, allowed, forbidden, expired-session, empty |
| Admin Lock Action | Chỉ Admin lớn, cần xác nhận thao tác | [CẦN XÁC NHẬN UI], confirm, success/error |

Không hiển thị dữ liệu riêng trong khi đang kiểm tra quyền hoặc khi request bị từ chối.

## 6. Component inventory

| Component [tên đề xuất] | Trách nhiệm | Lưu ý |
|---|---|---|
| `SearchField`, `NeedFilter` | Tìm và lọc | Label, nút xóa, thông báo không khớp |
| `ProductCard`, `ProductDetail` | Mô tả gói và trường thiếu | Không bịa giá/dữ liệu |
| `CompareTray`, `CompareTable` | Chọn tối đa ba và đối chiếu | Mobile cuộn ngang có nhãn cột |
| `SuggestionSection` | Gợi ý từ dữ liệu đã duyệt | Không khẳng định 'tốt nhất' vô căn cứ |
| `AdminSignInForm` | Email + Password | Label, lỗi, đang gửi, thông báo xác minh email |
| `AuthGuard` | Định tuyến theo trạng thái phiên | Chỉ hỗ trợ UI, không thay thế database RLS |
| `RoleAwareNavigation` | Menu theo vai trò | Không tự nâng quyền từ client |
| `ForbiddenState`, `SessionExpiredState` | Thông báo an toàn | Không để lộ PII hoặc thông tin quyền chi tiết |

Tên file, route, component thực tế: `<Codex xác nhận sau khi khảo sát repo>`.

## 7. Layout và responsive

- **Mobile [ĐỀ XUẤT]:** danh sách thẻ một cột; bộ lọc dễ mở; khay so sánh dễ chạm; bảng so sánh cuộn ngang, không cắt nội dung.
- **Desktop [ĐỀ XUẤT]:** danh sách có vùng lọc; bảng so sánh đầy đủ; Admin Sign In khối form rõ ràng.
- **Tablet [ĐỀ XUẤT]:** điều chỉnh số cột theo khoảng trống.
- **[CẦN XÁC NHẬN]:** breakpoint, spacing grid và layout theo bản design gốc.

## 8. Design tokens — đề xuất chờ đối chiếu design gốc

| Token | Giá trị dự kiến | Mục đích |
|---|---|---|
| `color-primary` | `#1D4ED8` | Nút chính/điểm nhấn |
| `color-background` | `#F8FAFC` | Nền |
| `color-surface` | `#FFFFFF` | Form/thẻ |
| `color-text` | `#0F172A` | Nội dung |
| `color-danger` | `#B91C1C` | Lỗi/từ chối |
| `font-body` | Roboto, fallback sans-serif | Nội dung |

Spacing, radius, elevation, kích thước heading, iconography: **[CẦN XÁC NHẬN]** theo design gốc, không ngầm chuẩn hóa.

## 9. Interaction và feedback

- Login không báo thành công cho tới khi xác thực và xác nhận tư cách thành viên hợp lệ.
- Nếu email chưa xác nhận: giải thích cần xác nhận email; **không tự bật chức năng gửi lại email nếu chưa chốt**.
- Nếu bị khóa: không hiển thị dữ liệu trong phiên cũ hoặc ngay sau F5.
- Khi F5: xuất hiện trạng thái kiểm tra, sau đó đúng màn hình/role; không ló dữ liệu.
- Đăng xuất: chặn vùng riêng; nếu truy cập URL trực tiếp thì về đăng nhập hoặc hiện “Không có quyền”.
- Nếu lỗi API/mất mạng: thông báo và cách thử lại; không coi thao tác ghi là thành công khi chưa có xác nhận.

## 10. Microcopy — đề xuất

- “Đăng nhập dành cho nhân viên”
- “Email”
- “Mật khẩu”
- “Đăng nhập”
- “Vui lòng xác nhận email trước khi tiếp tục.”
- “Tài khoản hiện không có quyền truy cập.”
- “Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.”
- “Bạn không có quyền xem nội dung này.”
- “Chưa có dữ liệu”
- “Chỉ được so sánh tối đa 3 sản phẩm.”

Ngôn ngữ UI chính thức vẫn **[CẦN XÁC NHẬN D-05]**; các câu tiếng Việt là minh họa.

## 11. Accessibility

- Nhãn hiển thị cho mọi trường form; trạng thái lỗi có văn bản, không chỉ màu.
- Bàn phím, Tab/focus, Enter/Space và thông báo lỗi dễ nhận biết.
- Chạm trên mobile đủ thoải mái, không đặt hành động nguy hiểm cạnh nút chính.
- Hạn chế animation khi người dùng chọn reduced motion.
- Thử zoom và tương phản trước nghiệm thu.

## 12. UI acceptance checklist

- [ ] Khách thực hiện FR-01…FR-06 không đăng nhập.
- [ ] Public không chứa hồ sơ khách thật, danh sách yêu cầu riêng tư, thông tin Admin.
- [ ] Form Admin có email/mật khẩu, trạng thái gửi và lỗi.
- [ ] Admin nhỏ không thấy hành động quản trị quyền; API vẫn bị RLS bảo vệ.
- [ ] F5 không nháy/lộ thông tin trước khi kiểm tra quyền.
- [ ] Khóa Admin làm UI chuyển sang trạng thái không có quyền, giữ dữ liệu lịch sử.
- [ ] Các trạng thái loading, empty, error và forbidden nhất quán.
- [ ] Mobile và desktop hoàn thành luồng khách và đăng nhập Admin.
- [ ] Không bổ sung CRM, đặt hàng, chat hoặc bảo hành.
- [ ] Các thay đổi màu/typography được đối chiếu bản design v0.2 gốc trước khi duyệt.

## 13. UI Spec Prompt — độc lập, để dùng sau khi duyệt

Bạn là product designer. Hãy thiết kế mockup responsive cho website **Google Cloud Compare** (tên tạm, không được mô phỏng thương hiệu chính thức của Google).

**Ngữ cảnh:** Website giới thiệu và cho tìm/so sánh/chọn các gói phần mềm Google Cloud từ dữ liệu mẫu đã duyệt, phục vụ startup/doanh nghiệp nhỏ. Giới hạn so sánh tối đa 3 mục. Khách xem public không cần đăng nhập. Admin lớn và Admin nhỏ đăng nhập riêng bằng Email + Password (Confirm Email ON); Admin nhỏ chỉ xem dữ liệu được giao. Không thiết kế CRM, thanh toán, đặt hàng, chat, lịch hẹn, bảo hành hoặc tài khoản khách.

**Ràng buộc bài thử Telegram:** bài thử backend độc lập, chưa nối UI. Không thiết kế thêm form mua gói, nút Telegram, cấu hình bot hoặc bảng thông báo từ quyết định bài thử này.

**Màn hình phải tạo:** Public Catalog, Product Detail, Compare Table, Suggestions, giới thiệu/liên hệ, Admin Sign In, Admin Access Surface, Forbidden/Session Expired. Chỉ phác họa màn hình khóa Admin nhỏ ở mức hành động cần xác nhận, vì chi tiết nghiệp vụ còn mở. Thể hiện các trạng thái default/loading/empty/error và thành công phù hợp từng màn hình.

**Luồng:** Khách tìm → lọc → chi tiết → so sánh tối đa 3 → chọn trong UI. Admin đăng nhập → kiểm tra role → vào vùng được cấp quyền → đăng xuất. Khi bị khóa/hết phiên hoặc khi tải lại F5, không xuất hiện dữ liệu riêng trước lúc kiểm tra lại quyền.

**Thành phần:** SearchField, NeedFilter, ProductCard, CompareTray, CompareTable, SuggestionSection, Email/Password form, RoleAwareNavigation, ForbiddenState.

**Thị giác tham chiếu (chưa duyệt):** thiết kế rõ ràng, nền `#F8FAFC`, surface `#FFFFFF`, chữ `#0F172A`, primary `#1D4ED8`, danger `#B91C1C`, font Roboto hoặc sans-serif tương đương. Không dùng logo Google hoặc tuyên bố Google Partner.

**Responsive:** mobile một cột và bảng so sánh cuộn ngang; desktop tận dụng khoảng rộng; label/focus rõ, tương phản tốt, không chỉ báo lỗi bằng màu.

**Copy mẫu tiếng Việt:** “Tìm gói phần mềm”, “So sánh tối đa 3”, “Chưa có dữ liệu”, “Đăng nhập dành cho nhân viên”, “Tài khoản hiện không có quyền truy cập.”

**Acceptance:** Không thêm tính năng ngoài phạm vi; không bịa giá, dữ liệu doanh thu, khách hàng thật hoặc quyền thương hiệu; thể hiện trạng thái không có quyền; mô tả chính xác thao tác trên mobile/desktop. Nếu chưa đủ thông tin, ghi rõ giả định thay vì tự khẳng định.

## 14. Các điểm còn mở

- **[CẦN XÁC NHẬN]** Đối chiếu nội dung này với `docs/design-guidelines.md` v0.2 gốc (chưa được tải lên); ưu tiên giữ nguyên các quyết định thiết kế đã duyệt.
- **[CẦN XÁC NHẬN]** Tên route, màn hình và cách cấp/khóa Admin trên giao diện.
- **[CẦN XÁC NHẬN]** Giá đã duyệt, nội dung giới thiệu, ngôn ngữ chính thức, thương hiệu, breakpoint/spacing gốc.
- Không chỉnh schema hoặc bật Auth chỉ vì UI Spec Prompt mô tả các trạng thái.


---

## 15. Quy ước nội dung và phản hồi — Bài thử Telegram độc lập

**[ĐÃ DUYỆT 2026-10-30]:** bài thử độc lập; Admin lớn nhận qua cuộc trò chuyện Telegram riêng dùng cho bài thử; thông tin liên hệ tối thiểu là số điện thoại. Phần này đồng bộ với mục 16 của `development-plan-updated.md`. Không thay đổi D-07, phạm vi màn hình hoặc component MVP. Các đề xuất thị giác khác trong tài liệu vẫn giữ trạng thái chờ xác nhận.

### Luồng thử và nội dung thông báo

- Tạo yêu cầu giả → DB xác nhận lưu thành công → backend `telegram-notify` gửi Telegram → Admin lớn kiểm tra thông báo.
- Test function riêng trước khi nối UI; chưa nối UI trong phạm vi bài thử.
- Không phát thông báo từ nút “Chọn gói”, thao tác tải lại hoặc sửa bản ghi.
- Tiêu đề: “Có đăng ký mua mới — DỮ LIỆU THỬ”.
- Nội dung: mã yêu cầu, mã/tên gói, thời điểm tạo, tên người liên hệ và số điện thoại giả. Dùng nhãn rõ ràng, trình bày theo dòng để Admin lớn dễ đối chiếu.
- Không dùng câu “Đã thanh toán”, “Đã kích hoạt dịch vụ” hoặc “Mua thành công” cho sự kiện đăng ký.

### Phân biệt trạng thái lưu và gửi

Các câu dưới đây dùng cho kết quả bài thử/báo cáo kiểm thử, chưa phải microcopy của màn hình sản phẩm mới. Trạng thái phải có văn bản rõ, không chỉ phân biệt bằng màu.

| Kết quả | Nội dung phản hồi |
|---|---|
| DB và Telegram thành công | “Đã lưu yêu cầu thử. Đã gửi thông báo Telegram.” |
| DB ghi thất bại | “Chưa lưu được yêu cầu thử. Không gửi thông báo Telegram.” |
| DB thành công, Telegram thất bại | “Đã lưu yêu cầu thử. Gửi thông báo Telegram thất bại.” |
| DB thành công, Telegram timeout | “Đã lưu yêu cầu thử. Chưa xác định kết quả gửi Telegram; cần kiểm tra trước khi gửi lại.” |
| Đã gửi thành công trước đó | “Yêu cầu thử đã được gửi thông báo. Không gửi thêm.” |

- DB lỗi: giữ dữ liệu đầu vào để thử lại; không báo đã lưu.
- Telegram lỗi: bản ghi vẫn còn; gửi lại thủ công theo mã cũ, không tạo lại yêu cầu và không thêm retry tự động.
- Timeout: không khẳng định đã gửi hoặc chưa gửi khi chưa đủ bằng chứng.
- Không hiển thị giá trị secret, số điện thoại trong log, hoặc stack trace trong phản hồi lỗi. Tên cấu hình backend duy nhất được ghi là `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

### Kiểm chứng nội dung và ranh giới UI

- [ ] Admin lớn nhận thông báo đúng mã yêu cầu/gói và số điện thoại giả.
- [ ] Thông báo được nhận biết rõ là dữ liệu thử và không khẳng định đã thanh toán.
- [ ] Phản hồi phân biệt lưu thất bại, gửi thất bại và kết quả gửi chưa xác định.
- [ ] DB lỗi không gửi; Telegram lỗi không làm mất bản ghi đã lưu.
- [ ] Gọi lặp sau khi gửi thành công không thêm thông báo cho cùng yêu cầu.
- [ ] Không thêm form, nút, route hay màn hình Telegram vào MVP từ bài thử này.
- [ ] Bằng chứng không chứa secret; chưa đánh dấu đạt trước khi kiểm thử thực tế.

Nếu sau này duyệt tích hợp sản phẩm, thiết kế UI và hành vi đăng ký mua được chốt riêng dựa trên kết quả bài thử; không tự đưa các phản hồi thử nghiệm vào luồng public.


## 16. Nội dung thông báo có Gemini — cập nhật đã duyệt 2026-10-30

Phần này cập nhật trạng thái bài thử độc lập ở mục 15: backend Telegram đã chạy thực tế và phương án C đã được duyệt, bổ sung một câu tóm tắt bằng Gemini trước khi gửi. Chưa thêm form, route, nút hay màn hình mua gói vào UI. Xem Development Plan mục 17.2 và 18 để phân biệt trạng thái hiện hành với các mốc thử nghiệm cũ.

- Giữ nguyên nhãn “Có đăng ký mua mới”, mã yêu cầu, gói, thời điểm, người liên hệ, số điện thoại và ghi chú chưa xác nhận thanh toán.
- Nếu Gemini tạo được nội dung hợp lệ, thêm **“Tóm tắt AI (tham khảo): …”** vào cùng một tin. Không thay thế dữ liệu gốc, không gửi thêm một tin AI riêng.
- Gemini chỉ nhận tên gói; tên người và số điện thoại vẫn chỉ dùng trong thông báo Telegram đã duyệt. Không có dữ liệu nhu cầu để tự suy diễn lợi ích, giá hay tư vấn.
- Khi Gemini lỗi, timeout 6 giây hoặc nội dung không hợp lệ: dùng nguyên mẫu thông báo hiện tại, không hiển thị stack trace hoặc giá trị secret. Không để người nhận hiểu là đăng ký chưa được lưu chỉ vì tóm tắt thất bại.
- Tin thử vẫn ghi rõ DỮ LIỆU THỬ. Ca thực tế đã xác nhận generated và Telegram message ID 8; chưa có xác nhận người nhận đã đọc.
- Nội dung AI bị giới hạn một câu/360 ký tự, không link, không số điện thoại và không khẳng định thanh toán, kích hoạt hoặc cam kết. Các quy tắc lọc là biện pháp hạn chế, không bảo đảm tuyệt đối nội dung AI luôn đúng; dữ liệu gốc là căn cứ.
- Không có màn hình nhập API key trong sản phẩm. `GEMINI_API_KEY` chỉ là tên cấu hình backend, không hiện giá trị trong UI/tài liệu/log.


## 17. Form đăng ký gói đã phát hành — 2026-10-30

Quyết định mới cho phép nối UI trên `cloudfitk.vercel.app`; các giới hạn “chưa thêm form/chưa nối UI” tại mốc cũ được cập nhật bởi mục này. Luồng tìm/so sánh không bắt buộc đăng nhập Admin.

- Trong chi tiết gói, nút **Đăng ký gói này** mở form ngay trong trang và focus họ tên. Không tạo trang thanh toán hoặc giả lập mua thành công.
- Trường hiển thị: **Họ và tên**, **Số điện thoại**; checkbox đồng ý liên hệ xử lý đăng ký và thông báo người phụ trách qua Telegram. Nhãn bọc input, autocomplete name/tel, inputMode tel, nội dung dễ đọc, focus rõ, nút tối thiểu 44px.
- Đang gửi: khóa fieldset và nút, văn bản **Đang tiếp nhận đăng ký…**, aria-busy. Chỉ một hành động chính.
- Lỗi mạng/DB: giữ input, thông báo chưa xác nhận lưu, nút **Gửi lại** dùng cùng mã yêu cầu. Không tự khẳng định đã lưu hoặc chưa lưu trong trường hợp mất phản hồi.
- Thành công: **Đã tiếp nhận đăng ký** + mã yêu cầu + ghi chú sẽ liên hệ xác nhận, chưa phát sinh thanh toán; không thể bấm gửi tiếp trên form đã thành công.
- Không hiện secret hoặc trạng thái model/stack trace với khách. Gemini lỗi dùng mẫu Telegram cũ phía backend, không đổi kết quả tiếp nhận đã lưu.
- Browser QA mobile/desktop chưa chạy được do Chrome spawn EPERM; không coi CSS responsive là bằng chứng đã nghiệm thu giao diện trên thiết bị. Test API, dữ liệu và production assets đã đạt; kịch bản browser đã chuẩn bị riêng.


## 18. Visual source đã xác nhận — Mekong Cloud Horizon

**[ĐÃ DUYỆT 2026-10-30]:** chủ dự án xác nhận dùng `Docs/DESIGN.md` cho phần UI tích hợp. Phần này thay các giả định Roboto/palette chưa đối chiếu cho khu vực được sửa; không tự duyệt các nghiệp vụ còn mở trong tài liệu hoặc các số liệu/quyền thương hiệu minh họa.

- Font Be Vietnam Pro, mã/đánh số dùng Space Mono; primary và tonal surface theo bộ token nguồn. Thẻ gói và panel góc bo 24px, khoảng cách 16/24/32px, CTA pill và input bo 8px, vùng chạm tối thiểu 48px.
- Thẻ phân cấp nhóm/gói, tên, mô tả, giá mẫu và nhãn; giữ cảnh báo giá chưa xác minh. CTA “Khám phá gói” giữ aria-label xem chi tiết có tên gói.
- Chi tiết gói: nội dung bên trái, khung đăng ký bên phải trên desktop; xuống một cột trên tablet/mobile. Đăng ký mở form hiện có và focus họ tên; không sửa module hoặc hành vi gửi.
- Chỉ CSS đồng bộ form, gồm checkbox 20px không giãn hết chiều rộng, nhãn gắn input, consent, focus và trạng thái sẵn có. Không thêm xác nhận gửi Telegram vào UI chỉ từ kết quả đã lưu.
- Kiểm chứng nguồn/build/HTTP production và hash bảo vệ đạt; browser visual QA chưa có do giới hạn Chrome. Không gắn nhãn thiết kế pixel-perfect hay responsive đã nghiệm thu trên thiết bị.

Production hiện hành: `dpl_XWtBRZ3V5RiWD4QHYPQh2h6uY8XM` tại https://cloudfitk.vercel.app. Mốc đối chiếu và hash giữ nguyên `purchase.mjs`/API ở `ui-production-baseline.json`.
