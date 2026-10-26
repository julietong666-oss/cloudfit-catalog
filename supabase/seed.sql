insert into public.products
(id, name, short_description, detail_description, need_tags, sample_notice, display_price)
values
('startup-foundation', 'Startup Foundation Stack',
'Gói mẫu cho ứng dụng web/app giai đoạn MVP.',
'Gói mẫu cho ứng dụng web/app giai đoạn MVP. Thành phần trong bản mẫu: Cloud Run, Cloud SQL, Cloud Storage và Firebase Auth.',
array['Lưu trữ','Tích hợp'],
'Gói giải pháp mẫu theo ảnh bạn cung cấp. Giá, thành phần và nhãn nhu cầu chỉ để minh họa, chưa được xác minh hoặc báo giá.',
'~$68 / tháng'),
('modern-ai-saas', 'Modern AI-Ready SaaS',
'Gói mẫu cho ứng dụng tích hợp Trí tuệ Nhân tạo.',
'Gói mẫu cho ứng dụng tích hợp Trí tuệ Nhân tạo. Thành phần trong bản mẫu: Vertex AI, Cloud Run, Cloud Firestore, Cloud Logging & Monitoring.',
array['Lưu trữ','Tích hợp'],
'Gói giải pháp mẫu theo ảnh bạn cung cấp. Giá, thành phần và nhãn nhu cầu chỉ để minh họa, chưa được xác minh hoặc báo giá.',
'~$145 / tháng'),
('smart-workspace', 'Smart Workspace & Sync',
'Gói mẫu cho cộng tác văn phòng và quản lý danh tính nhân sự.',
'Gói mẫu cho cộng tác văn phòng và quản lý danh tính nhân sự. Thành phần trong bản mẫu: Google Workspace (Gmail, Docs, Sheets), Shared Drive, Cloud Identity Free và 2-Step Verification.',
array['Lưu trữ','Cộng tác'],
'Gói giải pháp mẫu theo ảnh bạn cung cấp. Giá, thành phần và nhãn nhu cầu chỉ để minh họa, chưa được xác minh hoặc báo giá.',
'~$6 / người dùng / tháng')
on conflict (id) do nothing;

