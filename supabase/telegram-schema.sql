-- Additive backend-only schema. No changes to existing catalog/Auth/demo policies.
create extension if not exists pg_net with schema extensions;
create schema if not exists telegram_private;
revoke all on schema telegram_private from public, anon, authenticated;
grant usage on schema telegram_private to service_role;

create table public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id),
  product_name text not null check (length(btrim(product_name)) between 1 and 200),
  contact_name text not null check (length(btrim(contact_name)) between 1 and 120),
  phone text not null check (phone ~ '^\+?[0-9 ()-]{8,24}$'),
  created_at timestamptz not null default now(),
  is_test boolean not null default false
);
create index purchase_requests_product_id_idx on public.purchase_requests(product_id);
alter table public.purchase_requests enable row level security;
revoke all on public.purchase_requests from public, anon, authenticated;
grant select, insert on public.purchase_requests to service_role;
comment on table public.purchase_requests is 'Private purchase enquiries, not payments. Backend-only until an intake flow is approved.';

create table public.telegram_deliveries (
  request_id uuid primary key references public.purchase_requests(id),
  token_hash text not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','unknown')),
  code text,
  message_id bigint,
  http_request_id bigint,
  updated_at timestamptz not null default now()
);
alter table public.telegram_deliveries enable row level security;
revoke all on public.telegram_deliveries from public, anon, authenticated;
grant select, insert, update on public.telegram_deliveries to service_role;
comment on table public.telegram_deliveries is 'Backend-only notification state. Processing/unknown deliveries must be reconciled before retry; no automatic retries.';

create function telegram_private.dispatch(p_request_id uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  delivery_token text := gen_random_uuid()::text || gen_random_uuid()::text;
  http_id bigint;
  claimed uuid;
begin
  -- Only a new request or a confirmed failure may be manually dispatched.
  insert into public.telegram_deliveries(request_id, token_hash)
  values (p_request_id, encode(sha256(convert_to(delivery_token,'UTF8')),'hex'))
  on conflict (request_id) do update
    set token_hash = excluded.token_hash, status = 'pending', code = null, updated_at = now()
    where telegram_deliveries.status = 'failed'
  returning request_id into claimed;
  if claimed is null then return; end if;
  begin
    select net.http_post(
      url := 'https://qibpsehkmzjwusllorbf.supabase.co/functions/v1/telegram-notify',
      headers := jsonb_build_object('Content-Type','application/json','x-delivery-token',delivery_token),
      body := jsonb_build_object('request_id',p_request_id),
      timeout_milliseconds := 20000
    ) into http_id;
    update public.telegram_deliveries set http_request_id = http_id where request_id = p_request_id;
  exception when others then
    update public.telegram_deliveries set status = 'failed', code = 'dispatch_failed', updated_at = now()
    where request_id = p_request_id;
  end;
end $$;
revoke all on function telegram_private.dispatch(uuid) from public, anon, authenticated;
grant execute on function telegram_private.dispatch(uuid) to service_role;

create function telegram_private.after_purchase_insert()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  begin
    perform telegram_private.dispatch(new.id);
  exception when others then
    -- Notification infrastructure must never roll back a saved enquiry.
    raise warning 'telegram_dispatch_failed';
  end;
  return new;
end $$;
revoke all on function telegram_private.after_purchase_insert() from public, anon, authenticated;
grant execute on function telegram_private.after_purchase_insert() to service_role;
-- Attach trigger only after the standalone deployed function has been tested.
