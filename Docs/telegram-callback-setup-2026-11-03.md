# Thông báo yêu cầu gọi lại — 03/11/2026

## Trạng thái phát hành

Người dùng đã đổi sang nhóm **Recall** và cập nhật Chat ID trên Supabase. Backend `consultation-callback` v4 đã xác minh trực tiếp cấu hình bằng `getMe`, `getChat`, `getChatMember`: HTTP 200 `status: ready`, bot hợp lệ, nhóm đúng tên, bot có trong nhóm và được phép gửi. Không suy đoán ID từ URL, không lấy token ra khỏi backend. Lỗi định dạng Chat ID trước đây đã hết. Một lần kiểm tra mạng ban đầu không hoàn tất; lần tiếp theo xác minh đầy đủ thành công.

`purchase-request` v12 đã ACTIVE, bổ sung biên nhận gọi lại sau khi lưu. Frontend đang được phát hành qua GitHub/Vercel; kết quả cuối cùng đối chiếu ở lịch sử commit và trạng thái deployment. Không gửi tin Telegram thật, không ghi yêu cầu thử vào Supabase, không đổi database/RLS/Secrets/SePay hay bot thanh toán. Chưa kiểm nhận tin thật trong nhóm.

## Cấu hình đã xác minh

Đích duy nhất: nhóm **Recall**. Không dùng ID nhóm cũ hoặc suy đoán ID từ URL Telegram. Tiêu đề tin nhắn `CLOUDFIT – YÊU CẦU GỌI LẠI` là tiêu đề nội dung, không phải tên nhóm nhận.

Supabase → Edge Functions → Secrets:

- `TELEGRAM_CALLBACK_BOT_TOKEN`: token của bot gọi lại mới, dạng số, dấu hai chấm, chuỗi token. Không dán đường dẫn Bot API hoặc mã chương trình. Không dùng bot thanh toán.
- `TELEGRAM_CALLBACK_CHAT_ID`: chỉ ID nhóm số âm được Telegram xác nhận, không có khoảng trắng, dấu nháy hay đường dẫn. Không phải ID bot. Không dùng nơi nhận thanh toán.

Không gửi giá trị token qua chat, không lưu source/Git/log. Không cần Secret ký biên nhận mới: backend dẫn xuất khóa HMAC riêng bằng HKDF từ credential backend có sẵn và ràng buộc dự án/mục đích.

### Lấy ID an toàn

1. Trong nhóm Recall đã có bot gọi lại, gửi `/callback_setup`.
2. Tại thư mục repository, chạy `python3 scripts/get-telegram-callback-chat.py`. Nhập token riêng tư vào lời nhắc ẩn trong Terminal; không dán token vào câu lệnh.
3. Script chỉ đọc `getMe`, `getWebhookInfo`, `getUpdates` và `getChat`; không gửi tin, không in token hay nội dung cập nhật, không xóa webhook. Nó chỉ in ID khi tìm đúng một nhóm trùng tên và xác minh lại bằng `getChat`.
4. Nếu bot có webhook/poller khác, dừng theo hướng dẫn; không xóa webhook. Nhờ bên quản lý webhook lấy `chat.id` của cập nhật từ đúng nhóm.
5. Lưu ID script xác minh vào `TELEGRAM_CALLBACK_CHAT_ID` trên Supabase. Không dùng lại ID nhóm cũ từ lịch sử hội thoại.

Sau khi sửa Secret, kiểm tra GET endpoint `https://qibpsehkmzjwusllorbf.supabase.co/functions/v1/consultation-callback`. Chỉ coi cấu hình sẵn sàng khi HTTP 200 với `status: ready`, hai cờ xác minh true. Kết quả lỗi được cache tối đa 30 giây. Kiểm tra này không gửi tin và không trả token/ID nhóm.

## Luồng và bảo vệ

API đăng ký giữ nguyên validation, consent, honeypot, UUID chống trùng và giới hạn 3 yêu cầu/số điện thoại/giờ. Sau khi backend xác nhận lưu đúng UUID, trả thêm biên nhận HMAC có hạn 7 ngày, ràng buộc mã yêu cầu, gói và dự án. Frontend lưu metadata và biên nhận trong sessionStorage, không lưu tên/điện thoại hoặc đưa chúng vào URL.

Chỉ nút Để nhân viên liên hệ sau gọi API callback; nút chat vẫn mở giao diện chat có sẵn (hiện còn mô phỏng). Endpoint đọc tên, số điện thoại, gói và thời gian đã lưu từ `purchase_requests`; bỏ qua dữ liệu cá nhân/đích nhận do client gửi thêm.

Tái sử dụng `telegram_deliveries` với khóa duy nhất `request_id`. Claim INSERT ON CONFLICT và PATCH có điều kiện đảm bảo hai lượt gửi đồng thời chỉ một lượt gửi Telegram. Không tạo bảng/cột/policy/trigger mới. Bot/nhóm đích phải khác bot/nhóm thanh toán và nhóm phải đúng tên.

Đã sent: trả kết quả cũ. Telegram từ chối rõ ràng (4xx): khách có thể chủ động thử lại sau 60 giây, CAS chống tranh chấp. Timeout, kết quả mơ hồ hoặc lỗi lưu sau gửi: không tự gửi lại, tránh tin trùng; có nút kiểm tra trạng thái chỉ đọc. Có thể cần đối soát thủ công cho trạng thái processing/unknown. Đây không phải bảo đảm gửi đúng một lần qua hai hệ thống khi mất mạng.

Yêu cầu tư vấn luôn được giữ lại dù Telegram lỗi. Biên nhận phiên cũ trước bản này không có chứng cứ callback: không tự tạo yêu cầu mới; giao diện hướng dẫn liên hệ hotline. Khóa backend đổi hoặc biên nhận hết hạn có thể làm callback cũ không dùng được; không ảnh hưởng yêu cầu đã lưu.

## Kiểm thử đã thực hiện

- 97 Node tests đạt: API/validation, HMAC sai/hết hạn, thiếu yêu cầu, cấu hình lỗi, nhóm sai/quyền thiếu, gửi thành công, gửi trùng đồng thời, lỗi Telegram, retry có giới hạn và kiểm tra trạng thái không gửi lại. Bao gồm hồi quy SePay.
- PostgreSQL WASM cục bộ: bảng hiện có, claim cạnh tranh chỉ một lượt gửi, phát lại không gửi thêm, yêu cầu không mất, anon không đọc được dữ liệu riêng.
- 2 Python tests offline cho tìm nhóm đúng tên, không suy đoán từ link.
- Kiểm tra cú pháp, Deno check hai function, static build 20 runtime files và git diff --check đạt.
- Browser fixture 390/1440px: đăng ký → xác nhận → chat không gửi callback, callback lỗi/thử lại, tải lại không tạo yêu cầu/gửi thông báo trùng; SePay checkout/popup hồi quy đạt. API ngoài đều bị chặn/giả lập, không tạo giao dịch/thông báo thật.
- Kiểm tra cấu hình đang chạy: HTTP 200 ready; bot, nhóm Recall và quyền gửi đã được xác minh chỉ đọc. Chưa test nhận tin thật.

## Thứ tự phát hành và kiểm tra

1. Đã xác minh cấu hình chỉ đọc, ready. Không cần cung cấp token qua chat.
2. Đã deploy `purchase-request` v12 kèm helper biên nhận; giữ verify_jwt=false hiện có và validation nội bộ. `consultation-callback` v4 tự xác thực biên nhận HMAC.
3. Phát hành frontend qua GitHub/Vercel; đối chiếu trạng thái READY và runtime với build. Phần đọc endpoint production dùng dữ liệu không hợp lệ để kiểm guard; không tạo lead thử hoặc gửi Telegram.
4. Chỉ thử gửi một tin thật sau khi chủ dự án cho phép, với thông tin thử đã thống nhất. Kiểm tra nhóm nhận và delivery sent; bấm lại/reload không tạo lượt gửi mới.

## File thay đổi

- `catalog/purchase.mjs`: nút callback, trạng thái/lỗi/kiểm tra, biên nhận phiên và consent.
- `supabase/functions/purchase-request/handler.mjs`: trả biên nhận sau khi lưu.
- `supabase/functions/consultation-callback/index.ts`, `handler.mjs`, `deno.json`: endpoint mới, không phải hệ thống chat mới.
- `supabase/functions/_shared/consultation-receipt.mjs`, `callback-destination.mjs`: ký/xác minh biên nhận và đích nhận.
- `supabase/functions/_shared/telegram.mjs`: thêm mẫu callback, hành vi mặc định cũ giữ nguyên.
- `supabase/functions/.env.example`: hai Secret callback, giá trị để trống.
- `scripts/get-telegram-callback-chat.py`: công cụ xác minh ID chỉ đọc.
- `tests/consultation-callback.test.mjs`, `callback-database.test.mjs`, `telegram-chat-discovery.test.py`, `purchase-browser.mjs`, `purchase.test.mjs`, `layout.test.mjs`: kiểm thử.
- `package.json`, `README.md`, tài liệu này: kiểm tra và hướng dẫn phát hành.

## Kiểm tra bổ sung khi chưa nhận thông báo

Sau phản ánh của người dùng: yêu cầu Smart Workspace lúc 21:19 ngày 03/11 (giờ Việt Nam) đã lưu; tại thời điểm kiểm tra, log chưa có POST/OPTIONS callback sau lần lưu này và bảng delivery chưa có lượt gửi cho yêu cầu đó. Không kết luận người dùng chưa bấm nút; cần đối chiếu thông báo giao diện và khả năng tab cũ.

Callback v5 bổ sung tự kiểm tra ký/xác minh biên nhận trong runtime thật trước khi trả ready. Probe không đọc/ghi database, không gửi Telegram và không trả biên nhận ra ngoài. Kiểm tra thực tế trả 200 ready. 98 tests đạt, gồm lỗi cấu hình ký bị chặn an toàn. Chưa có bằng chứng nhận tin Telegram thật; không tự phát lại dữ liệu khách hàng.
