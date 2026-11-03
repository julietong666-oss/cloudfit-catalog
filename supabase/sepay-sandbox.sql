-- Sandbox only. Applying this switches Telegram away from consultation inserts.
-- No production payment or package activation is represented by these tables.
create table public.sepay_sandbox_invoices (
 id uuid primary key,
 invoice_number text unique not null check(invoice_number ~ '^CFSBX[A-F0-9]{32}$'),
 access_token_hash text not null check(access_token_hash ~ '^[0-9a-f]{64}$'),
 environment text not null default 'sandbox' check(environment='sandbox'),
 amount bigint not null check(amount between 1 and 1000000000),
 currency text not null default 'VND' check(currency='VND'),
 details jsonb not null check(jsonb_typeof(details)='object'),
 status text not null default 'pending' check(status in('pending','paid','cancelled')),
 provider_order_id uuid,
 provider_transaction_id uuid unique,
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 expires_at timestamptz not null default now()+interval '24 hours',
 check((status='paid')=(paid_at is not null)),
 check(status<>'paid' or (provider_order_id is not null and provider_transaction_id is not null))
);
create index sepay_sandbox_created_idx on public.sepay_sandbox_invoices(created_at);
create index sepay_sandbox_phone_idx on public.sepay_sandbox_invoices((details->>'phone'),created_at);
alter table public.sepay_sandbox_invoices enable row level security;
revoke all on public.sepay_sandbox_invoices from public,anon,authenticated;
grant select,insert,update on public.sepay_sandbox_invoices to service_role;

create table public.sandbox_payment_deliveries (
 invoice_id uuid primary key references public.sepay_sandbox_invoices(id),
 token_hash text not null,
 status text not null default 'pending' check(status in('pending','processing','sent','failed','unknown')),
 code text,message_id bigint,http_request_id bigint,
 updated_at timestamptz not null default now()
);
alter table public.sandbox_payment_deliveries enable row level security;
revoke all on public.sandbox_payment_deliveries from public,anon,authenticated;
grant select,insert,update on public.sandbox_payment_deliveries to service_role;

create function public.create_sepay_sandbox_invoice(p_id uuid,p_token_hash text,p_invoice_number text,p_amount bigint,p_details jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare invoice public.sepay_sandbox_invoices%rowtype;
begin
 if p_token_hash !~ '^[0-9a-f]{64}$' or p_invoice_number <> 'CFSBX'||upper(replace(p_id::text,'-',''))
  or p_amount not between 1 and 1000000000 or jsonb_typeof(p_details)<>'object'
  or coalesce(p_details->>'phone','') !~ '^\+?[0-9]{8,15}$' then raise exception 'invalid_invoice';end if;
 perform pg_advisory_xact_lock(hashtextextended('sepay-sandbox-create',0));
 select * into invoice from public.sepay_sandbox_invoices where id=p_id for update;
 if found then
  if invoice.access_token_hash<>p_token_hash or invoice.amount<>p_amount or invoice.details<>p_details or invoice.expires_at<now() then raise exception 'invoice_conflict';end if;
  return jsonb_build_object('id',invoice.id,'invoice_number',invoice.invoice_number,'amount',invoice.amount,'status',invoice.status);
 end if;
 if (select count(*) from public.sepay_sandbox_invoices where created_at>now()-interval '1 hour')>=100
  or (select count(*) from public.sepay_sandbox_invoices where details->>'phone'=p_details->>'phone' and created_at>now()-interval '1 hour')>=3 then raise exception 'rate_limited';end if;
 insert into public.sepay_sandbox_invoices(id,access_token_hash,invoice_number,amount,details)
 values(p_id,p_token_hash,p_invoice_number,p_amount,p_details) returning * into invoice;
 return jsonb_build_object('id',invoice.id,'invoice_number',invoice.invoice_number,'amount',invoice.amount,'status',invoice.status);
end $$;
create function public.read_sepay_sandbox_invoice(p_id uuid,p_token_hash text,p_cancel boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare invoice public.sepay_sandbox_invoices%rowtype;
begin
 select * into invoice from public.sepay_sandbox_invoices where id=p_id and access_token_hash=p_token_hash and expires_at>now() for update;
 if not found then return null;end if;
 if p_cancel and invoice.status='pending' then update public.sepay_sandbox_invoices set status='cancelled' where id=p_id returning * into invoice;end if;
 return jsonb_build_object('id',invoice.id,'invoice_number',invoice.invoice_number,'amount',invoice.amount,'status',invoice.status);
end $$;
create function public.settle_sepay_sandbox_invoice(p_invoice_number text,p_amount bigint,p_transaction_id uuid,p_provider_order_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare invoice public.sepay_sandbox_invoices%rowtype;
begin
 select * into invoice from public.sepay_sandbox_invoices where invoice_number=p_invoice_number for update;
 if not found or invoice.environment<>'sandbox' or invoice.currency<>'VND' or invoice.amount<>p_amount then return jsonb_build_object('accepted',false);end if;
 if invoice.status='paid' then return jsonb_build_object('accepted',invoice.provider_transaction_id=p_transaction_id and invoice.provider_order_id=p_provider_order_id);end if;
 if invoice.status<>'pending' or invoice.expires_at<now() then return jsonb_build_object('accepted',false);end if;
 update public.sepay_sandbox_invoices set status='paid',paid_at=now(),provider_transaction_id=p_transaction_id,provider_order_id=p_provider_order_id where id=invoice.id;
 return jsonb_build_object('accepted',true);
end $$;
revoke all on function public.create_sepay_sandbox_invoice(uuid,text,text,bigint,jsonb) from public,anon,authenticated;
revoke all on function public.read_sepay_sandbox_invoice(uuid,text,boolean) from public,anon,authenticated;
revoke all on function public.settle_sepay_sandbox_invoice(text,bigint,uuid,uuid) from public,anon,authenticated;
grant execute on function public.create_sepay_sandbox_invoice(uuid,text,text,bigint,jsonb) to service_role;
grant execute on function public.read_sepay_sandbox_invoice(uuid,text,boolean) to service_role;
grant execute on function public.settle_sepay_sandbox_invoice(text,bigint,uuid,uuid) to service_role;

create function telegram_private.dispatch_sandbox_invoice(p_invoice_id uuid)
returns void language plpgsql security invoker set search_path='' as $$
declare delivery_token text:=gen_random_uuid()::text||gen_random_uuid()::text;claimed uuid;http_id bigint;
begin
 if not exists(select 1 from public.sepay_sandbox_invoices where id=p_invoice_id and status='paid' and environment='sandbox') then return;end if;
 insert into public.sandbox_payment_deliveries(invoice_id,token_hash)
 values(p_invoice_id,encode(sha256(convert_to(delivery_token,'UTF8')),'hex'))
 on conflict(invoice_id) do update set token_hash=excluded.token_hash,status='pending',code=null,updated_at=now()
 where sandbox_payment_deliveries.status='failed' returning invoice_id into claimed;
 if claimed is null then return;end if;
 begin
  select net.http_post(url:='https://qibpsehkmzjwusllorbf.supabase.co/functions/v1/sandbox-payment-notify',
   headers:=jsonb_build_object('Content-Type','application/json','x-delivery-token',delivery_token),
   body:=jsonb_build_object('invoice_id',p_invoice_id),timeout_milliseconds:=15000) into http_id;
  update public.sandbox_payment_deliveries set http_request_id=http_id where invoice_id=p_invoice_id;
 exception when others then update public.sandbox_payment_deliveries set status='failed',code='dispatch_failed',updated_at=now() where invoice_id=p_invoice_id;end;
end $$;
create function telegram_private.after_sandbox_invoice_paid()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.status='paid' and old.status is distinct from 'paid' then
  begin perform telegram_private.dispatch_sandbox_invoice(new.id);exception when others then raise warning 'sandbox_dispatch_failed';end;
 end if;
 return new;
end $$;
revoke all on function telegram_private.dispatch_sandbox_invoice(uuid) from public,anon,authenticated;
revoke all on function telegram_private.after_sandbox_invoice_paid() from public,anon,authenticated;
grant execute on function telegram_private.dispatch_sandbox_invoice(uuid) to service_role;
grant execute on function telegram_private.after_sandbox_invoice_paid() to service_role;
create trigger sepay_sandbox_invoice_paid after update of status on public.sepay_sandbox_invoices
for each row execute function telegram_private.after_sandbox_invoice_paid();
-- Replaces the old event source. Historic consultation records/deliveries stay intact.
drop trigger if exists purchase_requests_telegram_insert on public.purchase_requests;
