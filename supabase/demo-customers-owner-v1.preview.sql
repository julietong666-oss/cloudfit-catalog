-- PREVIEW ONLY. Not applied. Requires approval of this exact package,
-- verified fresh scoped backup, and rechecked live schema/policies/grants.
-- Scope: synthetic demo_customers only; SELECT + INSERT, active owners only.
begin;

do $$
begin
  if (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'demo_customers') <> 1
     or not exists (
       select 1 from pg_policies where schemaname = 'public'
       and tablename = 'demo_customers' and policyname = 'demo_customers_read'
       and cmd = 'SELECT' and qual = 'true'
     ) then
    raise exception 'Policy drift: re-audit and reapprove before applying';
  end if;
  if exists (
    select 1 from information_schema.columns where table_schema = 'public'
    and table_name = 'demo_customers' and column_name = 'user_id'
  ) then
    raise exception 'Schema drift: user_id exists; re-audit before applying';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'demo_customers' and c.relrowsecurity
  ) then
    raise exception 'RLS drift: stop and investigate';
  end if;
end $$;

lock table public.demo_customers in access exclusive mode;
alter table public.demo_customers enable row level security;
-- No default on ADD COLUMN: legacy rows remain NULL, never assigned to executor.
alter table public.demo_customers
  add column user_id uuid references auth.users(id) on delete restrict;
alter table public.demo_customers alter column user_id set default auth.uid();
create index demo_customers_user_id_idx on public.demo_customers(user_id);

drop policy demo_customers_read on public.demo_customers;
revoke all privileges on table public.demo_customers from public, anon, authenticated;
-- Also remove independent column privileges; table-level REVOKE is insufficient.
revoke all privileges (id, company_name, contact_name, email, product_id, stage, user_id)
on table public.demo_customers from public, anon, authenticated;

grant select on public.demo_customers to authenticated;
-- user_id is intentionally excluded: server default binds the JWT's uid.
grant insert (id, company_name, contact_name, email, product_id, stage)
on public.demo_customers to authenticated;

create policy demo_customers_owner_select
on public.demo_customers for select to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.app_members m
    where m.user_id = (select auth.uid()) and m.is_active
  )
);

create policy demo_customers_owner_insert
on public.demo_customers for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.app_members m
    where m.user_id = (select auth.uid()) and m.is_active
  )
);

comment on table public.demo_customers is
  'SYNTHETIC ONLY. Active owners SELECT/INSERT their own example.com demo records. Legacy NULL owners remain quarantined. No client UPDATE/DELETE. Not a real customer CRM.';

-- products and app_members schema, policies, grants and data are unchanged.
-- No UPDATE/DELETE policies, membership grants, Auth changes, or legacy backfill.
commit;
