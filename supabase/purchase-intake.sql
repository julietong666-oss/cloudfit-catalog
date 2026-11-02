-- A single transaction validates catalog data, deduplicates retries and saves.
-- Only the trusted intake backend may invoke this RPC; no public table grants.
create function public.submit_purchase_request(
 p_id uuid, p_product_id text, p_contact_name text, p_phone text, p_is_test boolean default false
) returns uuid language plpgsql security invoker set search_path='' as $$
declare existing public.purchase_requests%rowtype; package_name text;
begin
 if length(btrim(p_contact_name)) not between 1 and 120 or p_phone !~ '^\+?[0-9]{8,15}$' then
  raise exception using message='invalid_request',errcode='P0001';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_phone,0));
 select * into existing from public.purchase_requests where id=p_id;
 if found then
  if existing.product_id=p_product_id and existing.contact_name=p_contact_name and existing.phone=p_phone then return existing.id; end if;
  raise exception using message='request_conflict',errcode='P0001';
 end if;
 select name into package_name from public.products where id=p_product_id and is_demo=true;
 if not found then raise exception using message='product_unavailable',errcode='P0001'; end if;
 if (select count(*) from public.purchase_requests where phone=p_phone and created_at>now()-interval '1 hour')>=3 then
  raise exception using message='rate_limited',errcode='P0001';
 end if;
 insert into public.purchase_requests(id,product_id,product_name,contact_name,phone,is_test)
 values(p_id,p_product_id,package_name,p_contact_name,p_phone,p_is_test);
 return p_id;
end $$;
revoke all on function public.submit_purchase_request(uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.submit_purchase_request(uuid,text,text,text,boolean) to service_role;
