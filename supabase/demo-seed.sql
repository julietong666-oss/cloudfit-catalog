-- Synthetic customers only. This table is publicly readable.
insert into public.demo_customers(id, company_name, contact_name, email, product_id, stage) values
('demo-001','Công ty Demo 01','Khách mẫu 01','demo01@example.com','startup-foundation','Đang tìm hiểu'),
('demo-002','Công ty Demo 02','Khách mẫu 02','demo02@example.com','modern-ai-saas','Đã chọn gói'),
('demo-003','Công ty Demo 03','Khách mẫu 03','demo03@example.com','smart-workspace','Đang dùng thử')
on conflict (id) do nothing;
