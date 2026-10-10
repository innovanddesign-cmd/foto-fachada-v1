begin;
alter table private.innova_credit_operations add column campaign_id uuid;
alter table private.innova_credit_operations add column initial_generation boolean not null default false;
alter table private.innova_credit_operations add column budget_micros bigint not null default 100000;
alter table public.escaparates_ai_attempts add column estimated_usd_micros bigint check(estimated_usd_micros>=0);
create table private.innova_ai_budget(month date primary key, committed_micros bigint not null default 0 check(committed_micros>=0), limit_micros bigint not null default 25000000 check(limit_micros>=0));
alter table private.innova_ai_budget enable row level security;
revoke all on private.innova_ai_budget from public,anon,authenticated;
grant select,insert,update on private.innova_ai_budget to service_role,innova_mvp_runtime;
create policy runtime_ai_budget on private.innova_ai_budget to innova_mvp_runtime using(true) with check(true);
create unique index innova_initial_once on private.innova_credit_operations(owner_id,campaign_id) where initial_generation and state in ('reserved','succeeded');

create function private.innova_ai_cost(p_owner uuid,p_operation text) returns integer language sql stable security invoker set search_path='' as $$
 select case when p_operation in ('free_text','free_image','free_logo') then 0
 when private.innova_plan(p_owner) in ('PRO','BUSINESS') then
 (case private.innova_plan(p_owner) when 'PRO' then 100 else 50 end) * (case when p_operation='campaign' then 2 else 1 end)
 when private.innova_plan(p_owner)='ENTERPRISE' then (select operation_cost from private.innova_accounts where owner_id=p_owner)
 else null end;
$$;

create or replace function private.innova_accrue(p_owner uuid) returns void language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; n integer; boundary timestamptz; until_at timestamptz; amount integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 insert into private.innova_accounts(owner_id) values(p_owner) on conflict do nothing;
 select * into a from private.innova_accounts where owner_id=p_owner for update;
 if a.plan='FREE' or a.paid_until is null then return; end if;
 amount:=case when a.plan in ('PRO','BUSINESS') then 1000 else a.monthly_credits end;
 if amount is null then return; end if;
 until_at:=case when a.cancel_at_end then a.paid_until else coalesce(a.grace_until,a.paid_until) end;
 n:=a.credited_period+1;
 loop
  boundary:=a.anchor+make_interval(months=>n);
  exit when boundary>now() or boundary>=until_at or n>1200;
  insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,amount,'Asignación mensual',p_owner::text||':month:'||a.anchor::text||':'||n) on conflict do nothing;
  if found then update private.innova_accounts set balance=balance+amount where owner_id=p_owner; end if;
  update private.innova_accounts set credited_period=n where owner_id=p_owner;
  n:=n+1;
 end loop;
end $$;

create function private.innova_ai_quote(p_owner uuid,p_operation text,p_campaign uuid default null,p_initial boolean default false) returns jsonb language plpgsql security invoker set search_path='' as $$
declare cost integer; a private.innova_accounts; available boolean; tier text; initial_count integer; initial_limit integer;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 tier:=private.innova_plan(p_owner);
 if p_operation not in ('analysis','design','marketing','campaign','free_text','free_image','free_logo') then return jsonb_build_object('available',false); end if;
 cost:=private.innova_ai_cost(p_owner,p_operation);
 available:=cost is not null;
 if p_initial then
  if p_operation<>'analysis' or p_campaign is null then return jsonb_build_object('available',false); end if;
  initial_limit:=case tier when 'FREE' then 1 when 'PRO' then 5 when 'BUSINESS' then 10 else coalesce(a.enterprise_limit,1) end;
  select count(*) into initial_count from private.innova_credit_operations where owner_id=p_owner and initial_generation and state in ('reserved','succeeded') and (tier='FREE' or created_at>=a.anchor+make_interval(months=>greatest(a.credited_period,0)));
  available:=initial_count<initial_limit and not exists(select 1 from private.innova_credit_operations where owner_id=p_owner and campaign_id=p_campaign and initial_generation and state in ('reserved','succeeded'));
  cost:=0;
 end if;
 return jsonb_build_object('available',available,'cost',cost,'balance',a.balance,'mode','credits','initial',p_initial,'operation',p_operation,
 'initialUsed',exists(select 1 from private.innova_credit_operations where owner_id=p_owner and campaign_id=p_campaign and initial_generation and state='succeeded'));
end $$;

create function private.innova_reserve_v2(p_owner uuid,p_id uuid,p_operation text,p_expected_cost integer,p_campaign uuid default null,p_initial boolean default false) returns text language plpgsql security invoker set search_path='' as $$
declare q jsonb; charge integer; month_start date; budget_hold bigint;
begin
 perform private.innova_accrue(p_owner);
 if exists(select 1 from private.innova_credit_operations where id=p_id) then return 'duplicate'; end if;
 q:=private.innova_ai_quote(p_owner,p_operation,p_campaign,p_initial);
 if not coalesce((q->>'available')::boolean,false) then return 'unavailable'; end if;
 charge:=(q->>'cost')::integer;
 if p_expected_cost is null or p_expected_cost<>charge then return 'price_changed'; end if;
 if (q->>'balance')::bigint<charge then return 'quota'; end if;
 if (select count(*) from private.innova_credit_operations where owner_id=p_owner and created_at>now()-interval '1 hour')>=30 then return 'rate'; end if;
 -- Conservative reservation prevents concurrent requests from overspending the application budget.
 month_start:=date_trunc('month',now() at time zone 'UTC')::date;
 budget_hold:=case when p_operation like 'free_%' then 0 else 100000 end;
 insert into private.innova_ai_budget(month) values(month_start) on conflict do nothing;
 update private.innova_ai_budget set committed_micros=committed_micros+budget_hold where month=month_start and committed_micros+budget_hold<=limit_micros;
 if not found then return 'budget'; end if;
 insert into private.innova_credit_operations(id,owner_id,operation,cost,state,campaign_id,initial_generation,budget_micros) values(p_id,p_owner,p_operation,charge,'reserved',p_campaign,p_initial,budget_hold);
 update private.innova_accounts set balance=balance-charge where owner_id=p_owner;
 insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,-charge,case when p_initial then 'Generación inicial incluida' else 'Regeneración IA '||p_operation end,p_id::text||':debit');
 insert into public.escaparates_ai_requests(id,owner_id,month) values(p_id,p_owner,current_date);
 return 'reserved';
end $$;

-- Keep the old signature for older clients, with the same authoritative tariff.
create or replace function private.innova_reserve(p_owner uuid,p_id uuid,p_operation text,p_expected_cost integer default null) returns text language sql security invoker set search_path='' as $$
 select private.innova_reserve_v2(p_owner,p_id,p_operation,p_expected_cost,null,false);
$$;

create or replace function private.innova_finish(p_owner uuid,p_id uuid,p_success boolean) returns boolean language plpgsql security invoker set search_path='' as $$
declare op private.innova_credit_operations; measured bigint; missing bigint;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 select * into op from private.innova_credit_operations where id=p_id and owner_id=p_owner for update;
 if not found or op.state<>'reserved' then return false; end if;
 update private.innova_credit_operations set state=case when p_success then 'succeeded' else 'failed' end where id=p_id;
 update public.escaparates_ai_requests set state=case when p_success then 'succeeded' else 'failed' end,finished_at=now() where id=p_id and owner_id=p_owner;
 if not p_success then
  update private.innova_accounts set balance=balance+op.cost where owner_id=p_owner;
  insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,op.cost,'Devolución por fallo técnico',p_id::text||':refund');
 end if;
 select sum(estimated_usd_micros),count(*) filter(where estimated_usd_micros is null) into measured,missing from public.escaparates_ai_attempts where request_id=p_id;
 -- Unknown/provider timeout costs keep the full reservation, never assume a free failure.
 if measured is not null and missing=0 and op.budget_micros>0 then
  update private.innova_ai_budget set committed_micros=greatest(0,committed_micros-op.budget_micros+measured) where month=date_trunc('month',op.created_at at time zone 'UTC')::date;
 end if;
 return true;
end $$;

create function private.innova_topup(p_owner uuid,p_pack text,p_reference text,p_actor uuid) returns void language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; credits integer;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner for update;
 if a.plan='FREE' or a.paid_until is null or now()>=a.paid_until then raise exception 'TOPUP_UNAVAILABLE'; end if;
 credits:=case p_pack when 'small' then 200 when 'medium' then 600 when 'large' then 1400 end;
 if credits is null or length(p_reference) not between 3 and 160 then raise exception 'INVALID_PACK'; end if;
 insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,credits,'Recarga '||p_pack||' verificada por '||p_actor::text,'topup:'||p_reference);
 update private.innova_accounts set balance=balance+credits where owner_id=p_owner;
end $$;
alter function private.innova_account_summary(uuid) rename to innova_account_summary_base;
create function private.innova_account_summary(p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare base jsonb; a private.innova_accounts; tier text; until_at timestamptz;
begin
 base:=private.innova_account_summary_base(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 tier:=private.innova_plan(p_owner);
 until_at:=case when a.cancel_at_end then a.paid_until else coalesce(a.grace_until,a.paid_until) end;
 return base||jsonb_build_object('balanceFrozen',tier='FREE' and a.balance>0,'canTopUp',a.plan<>'FREE' and a.paid_until>now(),
 'monthlyCredits',case when tier='FREE' then 0 when tier in ('PRO','BUSINESS') then 1000 else a.monthly_credits end,
 'operationCost',private.innova_ai_cost(p_owner,'campaign'),
 'status',case when tier='FREE' and a.plan<>'FREE' then 'expired' when now()>=a.paid_until and now()<until_at then 'grace' else 'active' end,
 'nextCreditAt',case when tier<>'FREE' and a.anchor+make_interval(months=>a.credited_period+1)<until_at then a.anchor+make_interval(months=>a.credited_period+1) end);
end $$;
revoke all on function private.innova_account_summary(uuid) from public,anon,authenticated;
grant execute on function private.innova_account_summary(uuid) to service_role,innova_mvp_runtime;
revoke all on function private.innova_ai_cost(uuid,text),private.innova_ai_quote(uuid,text,uuid,boolean),private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean),private.innova_topup(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function private.innova_ai_cost(uuid,text),private.innova_ai_quote(uuid,text,uuid,boolean),private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean),private.innova_topup(uuid,text,text,uuid) to service_role,innova_mvp_runtime;
commit;
