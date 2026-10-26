begin;
select set_config('test.member_id', gen_random_uuid()::text, true);
insert into auth.users (id, aud, role) values (current_setting('test.member_id')::uuid, 'authenticated', 'authenticated');
insert into public.app_members(user_id) values (current_setting('test.member_id')::uuid);
insert into public.products(id,name,short_description,need_tags,sample_notice)
values ('test-' || current_setting('test.member_id'), 'Private fixture', 'Internal only', array['Lưu trữ'], 'Private test');
set local role anon;
do $$ begin
  if has_table_privilege(current_user, 'public.app_members', 'SELECT') then
    raise exception 'Anonymous membership access unexpectedly granted';
  end if;
  if (select count(id) from public.products) <> 3 then raise exception 'Anonymous demo access or private isolation failed'; end if;
  if (select count(*) from public.demo_customers) <> 3 then raise exception 'Demo customers missing'; end if;
  if has_table_privilege(current_user, 'public.demo_customers', 'INSERT') then raise exception 'Anonymous demo write granted'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.products) <> 3 then raise exception 'Nonmember demo isolation failed'; end if;
  if (select count(*) from public.app_members) <> 0 then raise exception 'Nonmember can read memberships'; end if;
  if has_table_privilege(current_user, 'public.app_members', 'INSERT') or
     has_table_privilege(current_user, 'public.app_members', 'UPDATE') or
     has_table_privilege(current_user, 'public.app_members', 'DELETE') or
     has_table_privilege(current_user, 'public.products', 'INSERT') or
     has_table_privilege(current_user, 'public.products', 'UPDATE') or
     has_table_privilege(current_user, 'public.products', 'DELETE') then
    raise exception 'Client has unauthorized write privileges';
  end if;
end $$;
reset role;
select set_config('request.jwt.claims', json_build_object('sub', current_setting('test.member_id'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$ begin
  if (select count(*) from public.products) <> 4 then raise exception 'Active member cannot read demo and internal catalog'; end if;
  if (select count(*) from public.app_members) <> 1 then raise exception 'Member cannot read own membership'; end if;
end $$;
reset role;
update public.app_members set is_active = false where user_id = current_setting('test.member_id')::uuid;
set local role authenticated;
do $$ begin
  if (select count(*) from public.products) <> 3 then raise exception 'Inactive member can read private catalog'; end if;
end $$;
reset role;
select 'PASS: public demo readable; private catalog isolated; membership private; client writes denied' as verification;
rollback;
