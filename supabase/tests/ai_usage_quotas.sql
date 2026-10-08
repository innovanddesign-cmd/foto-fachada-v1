begin;
do $test$
declare u uuid:=gen_random_uuid(); r uuid; s text; lim integer; p text; i integer;
begin
 insert into auth.users(id,email) values(u,u::text||'@ai-quota-test.invalid');
 if has_table_privilege('authenticated','public.escaparates_ai_accounts','UPDATE')
 or has_table_privilege('anon','public.escaparates_ai_attempts','SELECT')
 or has_table_privilege('authenticated','public.escaparates_ai_requests','INSERT')
 or has_function_privilege('authenticated','public.escaparates_ai_reserve(uuid,uuid)','EXECUTE')
 or has_function_privilege('anon','public.escaparates_ai_finish(uuid,uuid,boolean)','EXECUTE') then raise exception 'Browser access exposed'; end if;
 foreach p in array array['FREE','PRO','ESCAPARATE'] loop
  delete from public.escaparates_ai_requests where owner_id=u;
  insert into public.escaparates_ai_accounts(owner_id,plan) values(u,p) on conflict(owner_id) do update set plan=excluded.plan;
  lim:=case p when 'FREE' then 1 when 'PRO' then 3 else 10 end;
  for i in 1..lim loop
   r:=gen_random_uuid();
   if public.escaparates_ai_reserve(u,r)<>'reserved' then raise exception 'Unexpected limit for %',p; end if;
   if public.escaparates_ai_reserve(u,r)<>'duplicate' then raise exception 'Duplicate accepted'; end if;
   if not public.escaparates_ai_finish(u,r,true) then raise exception 'Success not finalized'; end if;
   if public.escaparates_ai_finish(u,r,false) then raise exception 'Success refunded'; end if;
  end loop;
  if public.escaparates_ai_reserve(u,gen_random_uuid())<>'quota' then raise exception 'Quota bypass for %',p; end if;
 end loop;
 delete from public.escaparates_ai_requests where owner_id=u;
 delete from public.escaparates_ai_accounts where owner_id=u;
 r:=gen_random_uuid();
 if public.escaparates_ai_reserve(u,r)<>'reserved' then raise exception 'Default FREE unavailable'; end if;
 if public.escaparates_ai_reserve(u,gen_random_uuid())<>'quota' then raise exception 'Reservation not counted'; end if;
 if public.escaparates_ai_finish(gen_random_uuid(),r,false) then raise exception 'Cross owner finalization'; end if;
 if not public.escaparates_ai_finish(u,r,false) then raise exception 'Failed generation not released'; end if;
 for i in 2..10 loop
  r:=gen_random_uuid();
  if public.escaparates_ai_reserve(u,r)<>'reserved' then raise exception 'Failure billed'; end if;
  perform public.escaparates_ai_finish(u,r,false);
 end loop;
 if public.escaparates_ai_reserve(u,gen_random_uuid())<>'rate' then raise exception 'Failure flooding allowed'; end if;
 update public.escaparates_ai_requests set created_at=now()-interval '2 hours',month=(date_trunc('month',now() at time zone 'Europe/Madrid')-interval '1 month')::date,state='succeeded' where owner_id=u;
 if public.escaparates_ai_reserve(u,gen_random_uuid())<>'reserved' then raise exception 'Previous month counted'; end if;
end $test$;
rollback;
select 'PASS: plan limits, default FREE, reservations, duplicate, immutable success, failure release, owner check, hourly guard, month boundary, browser permissions; fixtures rolled back' as result;
