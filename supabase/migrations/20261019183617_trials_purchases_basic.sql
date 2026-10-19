begin;
-- Delivery is deliberately separate: store due notices without contacting a provider.
create table private.innova_experience_notices(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 kind text not null check(kind in ('campaign_trial_24h','campaign_trial_end','basic_trial_start','basic_trial_end')),
 due_at timestamptz not null,state text not null default 'pending' check(state in ('pending','sent','cancelled')),
 unique(owner_id,kind)
);
alter table private.innova_experience_notices enable row level security;
revoke all on private.innova_experience_notices from public,anon,authenticated;
grant select,insert,update on private.innova_experience_notices to innova_mvp_runtime,service_role;
create policy runtime_experience_notices on private.innova_experience_notices to innova_mvp_runtime using(true) with check(true);
create table private.innova_experiences(
 owner_id uuid primary key references auth.users(id),
 campaign_id uuid references public.escaparates_campaigns(id) on delete set null,
 campaign_started_at timestamptz,
 basic_started_at timestamptz,
 basic_declined boolean not null default false,
 basic_balance integer not null default 0 check(basic_balance between 0 and 40),
 created_at timestamptz not null default now()
);
create table private.innova_campaign_purchases(
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 campaign_id uuid unique references public.escaparates_campaigns(id) on delete set null,
 original_campaign_id uuid not null,
 order_id uuid not null unique references private.innova_orders(id),
 payment_reference text not null unique check(length(payment_reference) between 3 and 160),
 net_cents integer not null check(net_cents=4000), paid_at timestamptz not null default now(),
 recorded_by uuid not null references auth.users(id)
);
alter table private.innova_experiences enable row level security;
alter table private.innova_campaign_purchases enable row level security;
revoke all on private.innova_experiences,private.innova_campaign_purchases from public,anon,authenticated;
grant select,insert,update on private.innova_experiences,private.innova_campaign_purchases to innova_mvp_runtime,service_role;
create policy runtime_experiences on private.innova_experiences to innova_mvp_runtime using(true) with check(true);
create policy runtime_purchases on private.innova_campaign_purchases to innova_mvp_runtime using(true) with check(true);
grant select on public.escaparates_campaigns to innova_mvp_runtime;
create policy runtime_campaigns_read on public.escaparates_campaigns for select to innova_mvp_runtime using(true);

alter table private.innova_orders drop constraint innova_orders_kind_check;
alter table private.innova_orders add constraint innova_orders_kind_check check(kind in ('plan','credits','campaign'));
alter table private.innova_orders drop constraint innova_orders_billing_check;
alter table private.innova_orders add constraint innova_orders_billing_check check(billing in ('monthly','annual','once'));
-- Replace only the product constraint, leaving test-payment and amount checks intact.
do $$ declare c record; begin
 for c in select conname from pg_constraint where conrelid='private.innova_orders'::regclass and contype='c' and pg_get_constraintdef(oid) like '%product%' loop
  execute format('alter table private.innova_orders drop constraint %I',c.conname);
 end loop;
end $$;
alter table private.innova_orders add constraint innova_orders_product_check check(
 (kind='plan' and product in ('BASIC','PRO','BUSINESS') and billing in ('monthly','annual')) or
 (kind='credits' and product in ('small','medium','large') and billing in ('monthly','annual')) or
 (kind='campaign' and product ~ '^[0-9a-f-]{36}$' and billing='once'));
alter table public.escaparates_campaigns drop constraint escaparates_campaigns_plan_check;
alter table public.escaparates_campaigns add constraint escaparates_campaigns_plan_check check(plan in ('FREE','BASIC','PRO','ESCAPARATE'));
alter table public.escaparates_published drop constraint escaparates_published_plan_check;
alter table public.escaparates_published add constraint escaparates_published_plan_check check(plan in ('FREE','BASIC','PRO','ESCAPARATE'));
alter table private.innova_credit_operations add column trial_debit integer not null default 0 check(trial_debit>=0);

create function private.innova_basic_trial(p_owner uuid) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from private.innova_experiences where owner_id=p_owner and not basic_declined and basic_started_at<=now() and now()<basic_started_at+interval '48 hours');
$$;
alter function private.innova_plan(uuid) rename to innova_subscription_plan;
create function private.innova_plan(p_owner uuid) returns text language sql stable security definer set search_path='' as $$
 select case when private.innova_subscription_plan(p_owner)<>'FREE' then private.innova_subscription_plan(p_owner)
 when private.innova_basic_trial(p_owner) then 'BASIC' else 'FREE' end;
$$;
create function private.innova_extra_campaign(p_owner uuid,p_campaign uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.innova_campaign_purchases where owner_id=p_owner and campaign_id=p_campaign)
 or exists(select 1 from private.innova_experiences where owner_id=p_owner and campaign_id=p_campaign and (campaign_started_at is null or now()<campaign_started_at+interval '7 days'));
$$;
create function private.innova_campaign_tier(p_owner uuid,p_campaign uuid) returns text language sql stable security definer set search_path='' as $$
 select case when private.innova_plan(p_owner) in ('PRO','BUSINESS','ENTERPRISE') then private.innova_plan(p_owner)
 when private.innova_extra_campaign(p_owner,p_campaign) then 'PRO' else private.innova_plan(p_owner) end;
$$;
create or replace function private.innova_visible(p_campaign uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.escaparates_published p where p.campaign_id=p_campaign and
 (private.innova_extra_campaign(p.owner_id,p.campaign_id) or p.campaign_id in(
 select x.campaign_id from public.escaparates_published x where x.owner_id=p.owner_id and not private.innova_extra_campaign(x.owner_id,x.campaign_id)
 order by x.published_at,x.campaign_id limit private.innova_limit(p.owner_id))));
$$;
create or replace function private.innova_guard_publication() returns trigger language plpgsql security definer set search_path='' as $$
declare tier text; current_count integer;
begin
 if auth.uid() is not null and auth.uid()<>new.owner_id then raise exception 'No autorizado'; end if;
 if not exists(select 1 from public.escaparates_campaigns where id=new.campaign_id and owner_id=new.owner_id) then raise exception 'No autorizado'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text,813));
 if not private.innova_extra_campaign(new.owner_id,new.campaign_id) then
  select count(*) into current_count from public.escaparates_published where owner_id=new.owner_id and campaign_id<>new.campaign_id and not private.innova_extra_campaign(owner_id,campaign_id);
  if current_count>=private.innova_limit(new.owner_id) and not (TG_OP='UPDATE' and private.innova_visible(new.campaign_id)) then raise exception 'Has alcanzado el límite de campañas activas. Retira una publicación o amplía tu plan.'; end if;
 end if;
 update private.innova_experiences set campaign_started_at=now() where owner_id=new.owner_id and campaign_id=new.campaign_id and campaign_started_at is null;
 if found then
  insert into private.innova_experience_notices(owner_id,kind,due_at) values(new.owner_id,'campaign_trial_24h',now()+interval '6 days'),(new.owner_id,'campaign_trial_end',now()+interval '7 days') on conflict do nothing;
 end if;
 tier:=private.innova_campaign_tier(new.owner_id,new.campaign_id);
 new.plan:=case when tier in ('BUSINESS','ENTERPRISE') then 'ESCAPARATE' else tier end;
 new.payload:=jsonb_set(new.payload,'{datosEscaparate,planVisual}',to_jsonb(new.plan),true);
 return new;
end $$;
create or replace function public.innova_public_page(p_slug text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.escaparates_published; tier text;
begin
 select * into p from public.escaparates_published where slug=p_slug;
 if not found or not private.innova_visible(p.campaign_id) then return null; end if;
 tier:=private.innova_campaign_tier(p.owner_id,p.campaign_id);
 tier:=case when tier in ('BUSINESS','ENTERPRISE') then 'ESCAPARATE' else tier end;
 return jsonb_build_object('slug',p.slug,'payload',jsonb_set(p.payload,'{datosEscaparate,planVisual}',to_jsonb(tier),true),'plan',tier,'published_at',p.published_at,'updated_at',p.updated_at);
end $$;

create function private.innova_experience_action(p_owner uuid,p_action text,p_campaign uuid default null) returns void language plpgsql security invoker set search_path='' as $$
declare e private.innova_experiences;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 select * into e from private.innova_experiences where owner_id=p_owner for update;
 if p_action='campaign_trial' then
  if e.owner_id is not null then
   if e.campaign_id=p_campaign then return; end if;
   raise exception 'TRIAL_ALREADY_USED';
  end if;
  if private.innova_subscription_plan(p_owner) not in ('FREE','BASIC') then raise exception 'ALREADY_SUBSCRIBED'; end if;
  if not exists(select 1 from public.escaparates_campaigns where id=p_campaign and owner_id=p_owner) then raise exception 'CAMPAIGN_NOT_FOUND'; end if;
  if exists(select 1 from private.innova_campaign_purchases where campaign_id=p_campaign) then raise exception 'ALREADY_PURCHASED'; end if;
  insert into private.innova_experiences(owner_id,campaign_id,campaign_started_at)
  values(p_owner,p_campaign,case when exists(select 1 from public.escaparates_published where campaign_id=p_campaign) then now() else null end);
  if exists(select 1 from public.escaparates_published where campaign_id=p_campaign) then
   insert into private.innova_experience_notices(owner_id,kind,due_at) values(p_owner,'campaign_trial_24h',now()+interval '6 days'),(p_owner,'campaign_trial_end',now()+interval '7 days') on conflict do nothing;
  end if;
 elsif p_action in ('basic_trial','free') then
  if e.owner_id is null or e.campaign_started_at is null or now()<e.campaign_started_at+interval '7 days' then raise exception 'CAMPAIGN_TRIAL_NOT_FINISHED'; end if;
  if private.innova_subscription_plan(p_owner)<>'FREE' then raise exception 'ALREADY_SUBSCRIBED'; end if;
  if p_action='basic_trial' then
   if e.basic_started_at is not null or e.basic_declined then raise exception 'BASIC_TRIAL_ALREADY_USED'; end if;
   update private.innova_experiences set basic_started_at=now(),basic_balance=40 where owner_id=p_owner;
   perform private.innova_accrue(p_owner);
   insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,40,'Bolsa separada de prueba BASIC · 48 horas',p_owner::text||':basic-trial') on conflict do nothing;
   insert into private.innova_experience_notices(owner_id,kind,due_at) values(p_owner,'basic_trial_start',now()),(p_owner,'basic_trial_end',now()+interval '48 hours') on conflict do nothing;
  else update private.innova_experiences set basic_declined=true where owner_id=p_owner;
   update private.innova_experience_notices set state='cancelled' where owner_id=p_owner and kind='basic_trial_end' and state='pending';
  end if;
 else raise exception 'INVALID_ACTION'; end if;
end $$;

-- Dedicated trial balance: a BASIC preview cannot unlock a frozen historical balance.
alter function private.innova_ai_cost(uuid,text) rename to innova_paid_ai_cost;
create function private.innova_ai_cost(p_owner uuid,p_operation text) returns integer language sql stable security invoker set search_path='' as $$
 select coalesce(private.innova_paid_ai_cost(p_owner,p_operation),case when private.innova_basic_trial(p_owner) then
 case when p_operation in ('free_text','marketing') then 5 when p_operation in ('free_image','free_logo') then 20 end end);
$$;
create or replace function private.innova_ai_quote(p_owner uuid,p_operation text,p_campaign uuid default null,p_initial boolean default false) returns jsonb language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; cost integer; available boolean; used boolean; initial_count integer; tier text; balance bigint;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 cost:=private.innova_ai_cost(p_owner,p_operation); available:=cost is not null; balance:=a.balance;
 if not coalesce(a.plan<>'FREE' and a.paid_until>now(),false) then
  balance:=case when private.innova_basic_trial(p_owner) then (select basic_balance from private.innova_experiences where owner_id=p_owner) else 0 end;
 end if;
 used:=exists(select 1 from private.innova_credit_operations where owner_id=p_owner and campaign_id=p_campaign and initial_generation and state in ('reserved','succeeded'));
 if p_initial then
  tier:=private.innova_subscription_plan(p_owner);
  select count(*) into initial_count from private.innova_credit_operations where owner_id=p_owner and initial_generation and state in ('reserved','succeeded') and not private.innova_extra_campaign(p_owner,campaign_id) and created_at>=a.anchor+make_interval(months=>greatest(a.credited_period,0));
  available:=p_operation='analysis' and not used and exists(select 1 from public.escaparates_campaigns where id=p_campaign and owner_id=p_owner)
   and (private.innova_extra_campaign(p_owner,p_campaign) or (a.paid_until>now() and tier in ('PRO','BUSINESS','ENTERPRISE') and initial_count<private.innova_limit(p_owner)));
  cost:=case when available then 0 end;
 end if;
 return jsonb_build_object('available',coalesce(available,false),'cost',cost,'balance',balance,'mode','credits','initial',p_initial,'operation',p_operation,'initialUsed',used);
end $$;
create or replace function private.innova_reserve_v2(p_owner uuid,p_id uuid,p_operation text,p_expected_cost integer,p_campaign uuid default null,p_initial boolean default false) returns text language plpgsql security invoker set search_path='' as $$
declare q jsonb; charge integer; trial_only boolean; included bigint; month_start date; budget_hold bigint;
begin
 perform private.innova_accrue(p_owner);
 if exists(select 1 from private.innova_credit_operations where id=p_id) then return 'duplicate'; end if;
 q:=private.innova_ai_quote(p_owner,p_operation,p_campaign,p_initial);
 if not coalesce((q->>'available')::boolean,false) then return 'unavailable'; end if;
 charge:=(q->>'cost')::integer;
 if p_expected_cost is null or p_expected_cost<>charge then return 'price_changed'; end if;
 if (q->>'balance')::bigint<charge then return 'quota'; end if;
 if (select count(*) from private.innova_credit_operations where owner_id=p_owner and created_at>now()-interval '1 hour')>=30 then return 'rate'; end if;
 select included_balance,not coalesce(plan<>'FREE' and paid_until>now(),false) and private.innova_basic_trial(p_owner) into included,trial_only from private.innova_accounts where owner_id=p_owner;
 month_start:=date_trunc('month',now() at time zone 'UTC')::date;
 budget_hold:=case when p_operation like 'free_%' then 0 else 100000 end;
 insert into private.innova_ai_budget(month) values(month_start) on conflict do nothing;
 update private.innova_ai_budget set committed_micros=committed_micros+budget_hold where month=month_start and committed_micros+budget_hold<=limit_micros;
 if not found then return 'budget'; end if;
 insert into private.innova_credit_operations(id,owner_id,operation,cost,state,campaign_id,initial_generation,budget_micros,included_debit,trial_debit)
 values(p_id,p_owner,p_operation,charge,'reserved',p_campaign,p_initial,budget_hold,case when trial_only then 0 else least(included,charge) end,case when trial_only then charge else 0 end);
 if trial_only then
  update private.innova_experiences set basic_balance=basic_balance-charge where owner_id=p_owner;
 else
  update private.innova_accounts set balance=balance-charge,included_balance=included_balance-least(included,charge) where owner_id=p_owner;
 end if;
 insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,-charge,case when trial_only then 'IA de prueba BASIC' when p_initial then 'Generación inicial incluida' else 'Generación IA '||p_operation end,p_id::text||':debit');
 insert into public.escaparates_ai_requests(id,owner_id,month) values(p_id,p_owner,current_date);
 return 'reserved';
end $$;
create or replace function private.innova_finish(p_owner uuid,p_id uuid,p_success boolean) returns boolean language plpgsql security invoker set search_path='' as $$
declare done boolean; amount bigint; trial_amount integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 select included_debit,trial_debit into amount,trial_amount from private.innova_credit_operations where id=p_id and owner_id=p_owner;
 done:=private.innova_finish_preapproved(p_owner,p_id,p_success);
 if done and not p_success then
  update private.innova_accounts set included_balance=included_balance+amount,balance=balance-trial_amount where owner_id=p_owner;
  update private.innova_experiences set basic_balance=basic_balance+trial_amount where owner_id=p_owner;
 end if;
 return done;
end $$;

-- Purchased rights are lost only by an explicitly confirmed owner deletion, not by unpublishing.
revoke delete on public.escaparates_campaigns from authenticated;
create function public.innova_delete_campaign(p_campaign uuid,p_confirm_purchased boolean default false) returns boolean language plpgsql security definer set search_path='' as $$
declare owner uuid:=auth.uid();
begin
 if owner is null or not exists(select 1 from public.escaparates_campaigns where id=p_campaign and owner_id=owner) then raise exception 'No autorizado'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text,813));
 if exists(select 1 from private.innova_campaign_purchases where campaign_id=p_campaign) and not p_confirm_purchased then raise exception 'Confirma que eliminar esta campaña hace perder definitivamente su compra.'; end if;
 delete from public.escaparates_campaigns where id=p_campaign and owner_id=owner;
 return true;
end $$;
revoke all on function public.innova_delete_campaign(uuid,boolean) from public,anon;
grant execute on function public.innova_delete_campaign(uuid,boolean) to authenticated;
revoke all on function private.innova_basic_trial(uuid),private.innova_plan(uuid),private.innova_extra_campaign(uuid,uuid),private.innova_campaign_tier(uuid,uuid),private.innova_experience_action(uuid,text,uuid),private.innova_ai_cost(uuid,text) from public,anon,authenticated;
grant execute on function private.innova_basic_trial(uuid),private.innova_plan(uuid),private.innova_extra_campaign(uuid,uuid),private.innova_campaign_tier(uuid,uuid),private.innova_experience_action(uuid,text,uuid),private.innova_ai_cost(uuid,text) to innova_mvp_runtime,service_role;
create function private.innova_verify_campaign_order(p_order uuid,p_reference text,p_actor uuid) returns void language plpgsql security invoker set search_path='' as $$
declare o private.innova_orders; existing private.innova_campaign_purchases; campaign uuid;
begin
 select * into o from private.innova_orders where id=p_order for update;
 if not found or o.kind<>'campaign' or o.mode<>'manual' or o.net_cents<>4000 or o.tax_cents<>840 or o.state not in ('requested','awaiting_payment','payment_review','fulfilled') then raise exception 'INVALID_CAMPAIGN_ORDER'; end if;
 select * into existing from private.innova_campaign_purchases where order_id=p_order;
 if found then
  if existing.payment_reference=p_reference then return; end if;
  raise exception 'PAYMENT_CONFLICT';
 end if;
 campaign:=o.product::uuid;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(o.owner_id::text,813));
 if not exists(select 1 from public.escaparates_campaigns where id=campaign and owner_id=o.owner_id) then raise exception 'CAMPAIGN_NOT_FOUND'; end if;
 insert into private.innova_campaign_purchases(owner_id,campaign_id,original_campaign_id,order_id,payment_reference,net_cents,recorded_by)
 values(o.owner_id,campaign,campaign,p_order,p_reference,4000,p_actor);
 update private.innova_orders set state='fulfilled',fulfillment_reference=p_reference,updated_at=now() where id=p_order;
 update private.innova_experience_notices set state='cancelled' where owner_id=o.owner_id and kind in ('campaign_trial_24h','campaign_trial_end') and state='pending'
 and exists(select 1 from private.innova_experiences where owner_id=o.owner_id and campaign_id=campaign);
end $$;
alter function private.innova_account_summary(uuid) rename to innova_account_summary_credits;
create function private.innova_account_summary(p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare base jsonb; e private.innova_experiences; total integer; visible_count integer; extra integer; spendable bigint;
begin
 base:=private.innova_account_summary_credits(p_owner);
 select * into e from private.innova_experiences where owner_id=p_owner;
 select case when plan<>'FREE' and paid_until>now() then balance when private.innova_basic_trial(p_owner) then e.basic_balance else 0 end into spendable from private.innova_accounts where owner_id=p_owner;
 select count(*),count(*) filter(where private.innova_visible(campaign_id)) into total,visible_count from public.escaparates_published where owner_id=p_owner;
 select count(*) into extra from public.escaparates_campaigns where owner_id=p_owner and private.innova_extra_campaign(p_owner,id);
 return base||jsonb_build_object('spendableBalance',coalesce(spendable,0),'active',visible_count,'activeLimit',private.innova_limit(p_owner)+extra,'locked',total-visible_count,
 'purchasedCampaignIds',coalesce((select jsonb_agg(campaign_id) from private.innova_campaign_purchases where owner_id=p_owner and campaign_id is not null),'[]'::jsonb),
 'experience',jsonb_build_object('canStartCampaignTrial',e.owner_id is null and private.innova_subscription_plan(p_owner) in ('FREE','BASIC'),
 'campaignId',e.campaign_id,'campaignStartedAt',e.campaign_started_at,'campaignEndsAt',e.campaign_started_at+interval '7 days',
 'basicStartedAt',e.basic_started_at,'basicEndsAt',e.basic_started_at+interval '48 hours','basicDeclined',coalesce(e.basic_declined,false),
 'basicActive',private.innova_basic_trial(p_owner),'basicCredits',case when private.innova_basic_trial(p_owner) then e.basic_balance else 0 end));
end $$;
revoke all on function private.innova_verify_campaign_order(uuid,text,uuid),private.innova_account_summary(uuid) from public,anon,authenticated;
grant execute on function private.innova_verify_campaign_order(uuid,text,uuid),private.innova_account_summary(uuid) to innova_mvp_runtime,service_role;
commit;
