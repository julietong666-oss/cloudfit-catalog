alter table public.products add column is_demo boolean not null default false;
update public.products set is_demo = true
where id in ('startup-foundation', 'modern-ai-saas', 'smart-workspace');
grant select (id,name,short_description,detail_description,need_tags,sample_notice,display_price,created_at,is_demo) on public.products to anon;
create policy demo_products_read on public.products for select to anon, authenticated using (is_demo = true);

create table public.demo_customers (
  id text primary key,
  company_name text not null check (length(btrim(company_name)) > 0),
  contact_name text not null,
  email text not null check (email ~ '^[a-z0-9._+-]+@example[.]com$'),
  product_id text not null references public.products(id),
  stage text not null check (stage in ('Đang tìm hiểu','Đã chọn gói','Đang dùng thử'))
);
create index demo_customers_product_id_idx on public.demo_customers(product_id);
alter table public.demo_customers enable row level security;
revoke all on public.demo_customers from public, anon, authenticated;
grant select on public.demo_customers to anon, authenticated;
grant all on public.demo_customers to service_role;
create policy demo_customers_read on public.demo_customers for select to anon, authenticated using (true);
comment on table public.demo_customers is 'PUBLIC SYNTHETIC DEMO ONLY. Never insert real customer names, emails, or business data here.';
comment on table public.products is 'Demo rows are publicly readable; other rows require active internal membership. Clients cannot write.';

