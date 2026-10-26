-- Applied remotely as migration: create_internal_catalog
create table public.app_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.products (
  id text primary key check (length(btrim(id)) > 0),
  name text not null check (length(btrim(name)) > 0),
  short_description text not null check (length(btrim(short_description)) > 0),
  detail_description text,
  need_tags text[] not null check (cardinality(need_tags) > 0 and array_position(need_tags, null) is null),
  sample_notice text not null check (length(btrim(sample_notice)) > 0),
  display_price text,
  created_at timestamptz not null default now()
);
alter table public.app_members enable row level security;
alter table public.products enable row level security;
revoke all on public.app_members, public.products from public, anon, authenticated;
grant select on public.app_members, public.products to authenticated;
grant all on public.app_members, public.products to service_role;

create policy members_read_own_membership on public.app_members
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy active_members_read_products on public.products
  for select to authenticated
  using (exists (
    select 1 from public.app_members
    where user_id = (select auth.uid()) and is_active
  ));

comment on table public.products is 'Internal sample catalog; prices and content are illustrative and unverified. Client access is read-only for active members.';
comment on table public.app_members is 'Membership managed by trusted administrators; clients cannot grant themselves access.';

