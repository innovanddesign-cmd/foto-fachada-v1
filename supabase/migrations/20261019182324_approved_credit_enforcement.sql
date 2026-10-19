begin;
-- Existing balance is preserved as legacy balance. Only new included grants are capped.
alter table private.innova_accounts add column included_balance bigint not null default 0 check(included_balance>=0);
alter table private.innova_accounts drop constraint innova_accounts_plan_check;
alter table private.innova_accounts add constraint innova_accounts_plan_check check(plan in ('FREE','BASIC','PRO','BUSINESS','ENTERPRISE'));
alter table private.innova_credit_operations add column included_debit bigint not null default 0 check(included_debit>=0);

create or replace function private.innova_accrue(p_owner uuid) returns void language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; n integer; boundary timestamptz; quota integer; cap bigint; amount bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 insert into private.innova_accounts(owner_id) values(p_owner) on conflict do nothing;
 select * into a from private.innova_accounts where owner_id=p_owner for update;
 if a.plan='FREE' or a.paid_until is null then return; end if;
 quota:=case a.plan when 'BASIC' then 100 when 'PRO' then 200 when 'BUSINESS' then 400 else a.monthly_credits end;
 if quota is null then return; end if;
 cap:=case when a.plan='ENTERPRISE' then 9223372036854775807 else quota*2 end;
 n:=a.credited_period+1;
 loop
  boundary:=a.anchor+make_interval(months=>n);
  exit when boundary>now() or boundary>=a.paid_until or n>1200;
  amount:=least(quota,greatest(0,cap-a.included_balance));
  insert into private.innova_ledger(owner_id,amount,reason,reference)
    values(p_owner,amount,'Asignación mensual',p_owner::text||':month:'||a.anchor::text||':'||n) on conflict do nothing;
  if found then
   update private.innova_accounts set balance=balance+amount,included_balance=included_balance+amount where owner_id=p_owner;
   a.included_balance:=a.included_balance+amount;
  end if;
  update private.innova_accounts set credited_period=n where owner_id=p_owner;
  n:=n+1;
 end loop;
end $$;

create or replace function private.innova_ai_cost(p_owner uuid,p_operation text) returns integer language sql stable security invoker set search_path='' as $$
 select case when not exists(select 1 from private.innova_accounts where owner_id=p_owner and plan<>'FREE' and paid_until>now()) then null
 when p_operation in ('free_text','marketing') then 5
 when p_operation in ('free_image','free_logo') then 20
 when p_operation='metrics_analysis' and private.innova_plan(p_owner)='BUSINESS' then 20
 when p_operation='metrics_comparison' and private.innova_plan(p_owner)='BUSINESS' then 40
 else null end;
$$;
-- No old initial allowance or bundled operation may bypass approved rights.
create or replace function private.innova_ai_quote(p_owner uuid,p_operation text,p_campaign uuid default null,p_initial boolean default false) returns jsonb language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; cost integer;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 cost:=private.innova_ai_cost(p_owner,p_operation);
 return jsonb_build_object('available',cost is not null and not p_initial,'cost',cost,'balance',a.balance,'mode','credits','initial',p_initial,'operation',p_operation,'initialUsed',false);
end $$;

alter function private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean) rename to innova_reserve_preapproved;
create function private.innova_reserve_v2(p_owner uuid,p_id uuid,p_operation text,p_expected_cost integer,p_campaign uuid default null,p_initial boolean default false) returns text language plpgsql security invoker set search_path='' as $$
declare result text; before_included bigint; charge integer;
begin
 perform private.innova_accrue(p_owner);
 select included_balance into before_included from private.innova_accounts where owner_id=p_owner;
 result:=private.innova_reserve_preapproved(p_owner,p_id,p_operation,p_expected_cost,p_campaign,p_initial);
 if result='reserved' then
  select cost into charge from private.innova_credit_operations where id=p_id;
  update private.innova_credit_operations set included_debit=least(before_included,charge) where id=p_id;
  update private.innova_accounts set included_balance=included_balance-least(before_included,charge) where owner_id=p_owner;
 end if;
 return result;
end $$;
alter function private.innova_finish(uuid,uuid,boolean) rename to innova_finish_preapproved;
create function private.innova_finish(p_owner uuid,p_id uuid,p_success boolean) returns boolean language plpgsql security invoker set search_path='' as $$
declare done boolean; amount bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 select included_debit into amount from private.innova_credit_operations where id=p_id and owner_id=p_owner;
 done:=private.innova_finish_preapproved(p_owner,p_id,p_success);
 if done and not p_success then
  update private.innova_accounts set included_balance=included_balance+amount where owner_id=p_owner;
 end if;
 return done;
end $$;
create or replace function private.innova_topup(p_owner uuid,p_pack text,p_reference text,p_actor uuid) returns void language plpgsql security invoker set search_path='' as $$
begin raise exception 'TOPUPS_DISABLED'; end $$;
create or replace function private.innova_account_summary(p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare base jsonb; a private.innova_accounts; quota integer;
begin
 base:=private.innova_account_summary_base(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 quota:=case a.plan when 'BASIC' then 100 when 'PRO' then 200 when 'BUSINESS' then 400 when 'ENTERPRISE' then a.monthly_credits else 0 end;
 return base||jsonb_build_object('canTopUp',false,'monthlyCredits',case when a.paid_until>now() then quota else 0 end,
 'includedBalance',a.included_balance,'legacyBalance',a.balance-a.included_balance,'creditCap',case when a.plan<>'ENTERPRISE' then quota*2 end,
 'balanceFrozen',not coalesce(a.plan<>'FREE' and a.paid_until>now(),false) and a.balance>0,'operationCost',null,
 'nextCreditAt',case when a.plan<>'FREE' and a.anchor+make_interval(months=>a.credited_period+1)<a.paid_until then a.anchor+make_interval(months=>a.credited_period+1) end);
end $$;
revoke all on function private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean),private.innova_finish(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean),private.innova_finish(uuid,uuid,boolean) to service_role,innova_mvp_runtime;
commit;
