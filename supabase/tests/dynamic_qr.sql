begin;
select set_config('test.owner',gen_random_uuid()::text,true),set_config('test.other',gen_random_uuid()::text,true),set_config('test.a',gen_random_uuid()::text,true),set_config('test.b',gen_random_uuid()::text,true),set_config('test.c',gen_random_uuid()::text,true);
select set_config('test.slug','qr-test-'||replace(gen_random_uuid()::text,'-',''),true);
insert into auth.users(id) values(current_setting('test.owner')::uuid),(current_setting('test.other')::uuid);
insert into public.escaparates_campaigns(id,owner_id,name) values
(current_setting('test.a')::uuid,current_setting('test.owner')::uuid,'QR test A'),
(current_setting('test.b')::uuid,current_setting('test.owner')::uuid,'QR test B'),
(current_setting('test.c')::uuid,current_setting('test.other')::uuid,'QR test C');
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
insert into public.escaparates_published(campaign_id,owner_id,slug,plan) values
(current_setting('test.a')::uuid,current_setting('test.owner')::uuid,current_setting('test.slug'),'FREE'),
(current_setting('test.b')::uuid,current_setting('test.owner')::uuid,current_setting('test.slug')||'-b','FREE');
set local role anon;
insert into public.escaparates_qr_scans(qr_slug,target_slug,version) values(current_setting('test.slug'),current_setting('test.slug'),1);
do $$ begin
begin update public.escaparates_qr set target_campaign_id=current_setting('test.b')::uuid where slug=current_setting('test.slug'); raise exception 'anon update unexpectedly allowed'; exception when insufficient_privilege then null; end;
begin perform owner_id from public.escaparates_qr; raise exception 'anon owner data exposed'; exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
update public.escaparates_qr set target_campaign_id=current_setting('test.b')::uuid where slug=current_setting('test.slug') and version=1;
do $$ begin
if not exists(select 1 from public.escaparates_qr where slug=current_setting('test.slug') and version=2 and target_campaign_id=current_setting('test.b')::uuid) then raise exception 'destination update failed'; end if;
begin update public.escaparates_qr set target_campaign_id=current_setting('test.c')::uuid where slug=current_setting('test.slug'); raise exception 'foreign target allowed'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
insert into public.escaparates_qr_scans(qr_slug,target_slug,version) values(current_setting('test.slug'),current_setting('test.slug')||'-b',2);
do $$ begin
begin insert into public.escaparates_qr_scans(qr_slug,target_slug,version) values(current_setting('test.slug'),current_setting('test.slug'),1); raise exception 'stale event allowed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.other'),true);
set local role authenticated;
do $$ declare n integer; begin
update public.escaparates_qr set target_campaign_id=current_setting('test.c')::uuid where slug=current_setting('test.slug');
get diagnostics n=row_count;
if n<>0 then raise exception 'other user modified QR'; end if;
if exists(select 1 from public.escaparates_qr_scans where qr_slug=current_setting('test.slug')) then raise exception 'other user read history'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
do $$ begin
if (select count(*) from public.escaparates_qr_scans where qr_slug=current_setting('test.slug'))<>2 then raise exception 'history not preserved'; end if;
end $$;
reset role;
select 'PASS: publication creates QR; anon resolves/inserts but cannot edit or read owner; owner changes target; other user denied; two destinations retained; stale events denied. Fixtures rolled back.' as result;
rollback;
