begin;
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create table private.innova_accounts (
 owner_id uuid primary key references auth.users(id),
 plan text not null default 'FREE' check(plan in ('FREE','PRO','BUSINESS','ENTERPRISE')),
 billing text not null default 'free' check(billing in ('free','monthly','annual')),
 anchor timestamptz not null default now(), paid_until timestamptz, grace_until timestamptz,
 cancel_at_end boolean not null default false, launch_eligible boolean not null default false,
 enterprise_limit integer check(enterprise_limit>0), monthly_credits integer check(monthly_credits>=0),
 operation_cost integer check(operation_cost>0), credited_period integer not null default -1,
 balance bigint not null default 0 check(balance>=0), updated_at timestamptz not null default now(),
 check(grace_until is null or grace_until>=paid_until)
);
create table private.innova_ledger (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references private.innova_accounts(owner_id),
 amount bigint not null, reason text not null, reference text not null unique, created_at timestamptz not null default now()
);
create table private.innova_credit_operations (
 id uuid primary key, owner_id uuid not null references private.innova_accounts(owner_id),
 operation text not null, cost integer not null check(cost>=0),
 state text not null check(state in ('reserved','succeeded','failed')), created_at timestamptz not null default now()
);
create table private.innova_contracts (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 reference text not null unique, plan text not null, billing text not null, net_cents integer not null check(net_cents>=0),
 tax_cents integer not null check(tax_cents>=0), payment_method text not null check(payment_method in ('bizum','transfer','cash','card')),
 paid_at timestamptz not null, period_start timestamptz not null, period_end timestamptz not null,
 accepted_document_ref text not null, recorded_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 check(period_end>period_start)
);
alter table private.innova_accounts enable row level security;
alter table private.innova_ledger enable row level security;
alter table private.innova_credit_operations enable row level security;
alter table private.innova_contracts enable row level security;
revoke all on private.innova_accounts,private.innova_ledger,private.innova_credit_operations,private.innova_contracts from public,anon,authenticated;
grant usage on schema private to service_role;
grant all on private.innova_accounts,private.innova_ledger,private.innova_credit_operations,private.innova_contracts to service_role;

create function private.innova_plan(p_owner uuid) returns text language sql stable security definer set search_path='' as $$
 select coalesce((select case when a.plan='FREE' then 'FREE'
  when now()<a.paid_until or (not a.cancel_at_end and now()<a.grace_until) then a.plan else 'FREE' end
 from private.innova_accounts a where a.owner_id=p_owner),'FREE');
$$;
create function private.innova_limit(p_owner uuid) returns integer language sql stable security definer set search_path='' as $$
 select case private.innova_plan(p_owner) when 'PRO' then 5 when 'BUSINESS' then 10 when 'ENTERPRISE' then
 coalesce((select enterprise_limit from private.innova_accounts where owner_id=p_owner),1) else 1 end;
$$;

-- Server-only monthly accrual, anchored to the original date (Jan 31 -> Feb 28 -> Mar 31).
create function private.innova_accrue(p_owner uuid) returns void language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; n integer; boundary timestamptz;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 insert into private.innova_accounts(owner_id) values(p_owner) on conflict do nothing;
 select * into a from private.innova_accounts where owner_id=p_owner for update;
 if a.monthly_credits is null then return; end if;
 n:=a.credited_period+1;
 loop
  boundary:=a.anchor+make_interval(months=>n);
  exit when boundary>now() or (a.plan<>'FREE' and (a.paid_until is null or boundary>=a.paid_until));
  exit when n>1200;
  insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,a.monthly_credits,'Asignación mensual',p_owner::text||':month:'||a.anchor::text||':'||n) on conflict do nothing;
  if found then update private.innova_accounts set balance=balance+a.monthly_credits where owner_id=p_owner; end if;
  update private.innova_accounts set credited_period=n where owner_id=p_owner;
  n:=n+1;
 end loop;
end $$;
create function private.innova_reserve(p_owner uuid,p_id uuid,p_operation text,p_expected_cost integer default null) returns text language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts; charge integer;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner for update;
 if exists(select 1 from private.innova_credit_operations where id=p_id) then return 'duplicate'; end if;
 if p_operation not in ('analysis','design','marketing','logo') then return 'unavailable'; end if;
 -- No unapproved tariff or post-cancellation spending policy is inferred.
 if a.operation_cost is null or (a.plan<>'FREE' and (a.paid_until is null or now()>=a.paid_until)) then return 'unavailable'; end if;
 charge:=a.operation_cost;
 if p_expected_cost is not null and p_expected_cost<>charge then return 'price_changed'; end if;
 if a.balance<charge then return 'quota'; end if;
 if (select count(*) from private.innova_credit_operations where owner_id=p_owner and created_at>now()-interval '1 hour')>=30 then return 'rate'; end if;
 insert into private.innova_credit_operations(id,owner_id,operation,cost,state) values(p_id,p_owner,p_operation,charge,'reserved');
 update private.innova_accounts set balance=balance-charge where owner_id=p_owner;
 insert into private.innova_ledger(owner_id,amount,reason,reference) values(p_owner,-charge,'Reserva IA '||p_operation,p_id::text||':debit');
 -- Retain provider telemetry compatibility.
 insert into public.escaparates_ai_requests(id,owner_id,month) values(p_id,p_owner,current_date);
 return 'reserved';
end $$;
create function private.innova_finish(p_owner uuid,p_id uuid,p_success boolean) returns boolean language plpgsql security invoker set search_path='' as $$
declare op private.innova_credit_operations;
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
 return true;
end $$;
create function private.innova_account_summary(p_owner uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare a private.innova_accounts;
begin
 perform private.innova_accrue(p_owner);
 select * into a from private.innova_accounts where owner_id=p_owner;
 return jsonb_build_object('plan',private.innova_plan(p_owner),'activeLimit',private.innova_limit(p_owner),
  'active',least(private.innova_limit(p_owner),(select count(*) from public.escaparates_published where owner_id=p_owner)),
  'locked',greatest(0,(select count(*) from public.escaparates_published where owner_id=p_owner)-private.innova_limit(p_owner)),
  'cancelAtEnd',a.cancel_at_end,
  'lockedCampaignIds',coalesce((select jsonb_agg(campaign_id) from public.escaparates_published where owner_id=p_owner and not private.innova_visible(campaign_id)),'[]'::jsonb),
  'balance',a.balance,'monthlyCredits',a.monthly_credits,'operationCost',a.operation_cost,'paidUntil',a.paid_until,
  'nextCreditAt',case when a.monthly_credits is not null and (a.plan='FREE' or a.anchor+make_interval(months=>a.credited_period+1)<a.paid_until) then a.anchor+make_interval(months=>a.credited_period+1) end,
  'status',case when a.plan<>private.innova_plan(p_owner) then 'expired' else 'active' end,
  'history',coalesce((select jsonb_agg(x) from(select amount,reason,created_at from private.innova_ledger where owner_id=p_owner order by created_at desc limit 30)x),'[]'::jsonb));
end $$;

-- The database, not client-editable planVisual, controls published entitlements.
create function private.innova_guard_publication() returns trigger language plpgsql security definer set search_path='' as $$
declare tier text; current_count integer;
begin
 if auth.uid() is not null and auth.uid()<>new.owner_id then raise exception 'No autorizado'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.owner_id::text,813));
 tier:=private.innova_plan(new.owner_id);
 select count(*) into current_count from public.escaparates_published where owner_id=new.owner_id and campaign_id<>new.campaign_id;
 if current_count>=private.innova_limit(new.owner_id) and not (TG_OP='UPDATE' and private.innova_visible(new.campaign_id)) then raise exception 'Has alcanzado el límite de campañas activas. Retira una publicación o amplía tu plan.'; end if;
 new.plan:=case when tier in ('BUSINESS','ENTERPRISE') then 'ESCAPARATE' else tier end;
 new.payload:=jsonb_set(new.payload,'{datosEscaparate,planVisual}',to_jsonb(new.plan),true);
 return new;
end $$;
create trigger innova_publication_entitlements before insert or update on public.escaparates_published for each row execute function private.innova_guard_publication();

-- Public readers see only the effective entitlement; private drafts are not erased.
create function private.innova_visible(p_campaign uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from (
 select p.campaign_id,row_number() over(order by p.published_at,p.campaign_id) as ordinal,private.innova_limit(p.owner_id) as allowed
 from public.escaparates_published p where p.owner_id=(select owner_id from public.escaparates_published where campaign_id=p_campaign)
 ) ranked where ranked.campaign_id=p_campaign and ordinal<=allowed);
$$;
drop policy escaparates_published_read on public.escaparates_published;
create policy escaparates_published_read on public.escaparates_published for select to anon,authenticated
 using(owner_id=(select auth.uid()) or private.innova_visible(campaign_id));
grant usage on schema private to anon,authenticated;
grant execute on function private.innova_visible(uuid) to anon,authenticated;

-- A narrow public projection returns only existing public fields, never account balances.
create function public.innova_public_page(p_slug text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p public.escaparates_published; tier text;
begin
 select * into p from public.escaparates_published where slug=p_slug;
 if not found or not private.innova_visible(p.campaign_id) then return null; end if;
 tier:=private.innova_plan(p.owner_id);
 return jsonb_build_object('slug',p.slug,'payload',p.payload,'plan',case when tier in ('BUSINESS','ENTERPRISE') then 'ESCAPARATE' else tier end,'published_at',p.published_at,'updated_at',p.updated_at);
end $$;
revoke all on function public.innova_public_page(text) from public;
grant execute on function public.innova_public_page(text) to anon,authenticated;

-- Keep old printed QR links useful after a downgrade without exposing locked pages.
create function public.innova_resolve_qr(p_slug text,p_record boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.escaparates_qr; destination text;
begin
 if p_slug !~ '^[a-z0-9][a-z0-9-]{1,100}$' then return null; end if;
 select * into q from public.escaparates_qr where slug=p_slug;
 if not found then return null; end if;
 select slug into destination from public.escaparates_published where campaign_id=q.target_campaign_id and private.innova_visible(campaign_id);
 if destination is null then
  select slug into destination from public.escaparates_published where owner_id=q.owner_id and private.innova_visible(campaign_id) order by published_at,campaign_id limit 1;
 end if;
 if destination is null then return null; end if;
 if p_record then
  begin insert into public.escaparates_qr_scans(qr_slug,target_slug,version) values(q.slug,destination,q.version);
  exception when others then null; end;
 end if;
 return jsonb_build_object('slug',destination,'version',q.version);
end $$;
revoke all on function public.innova_resolve_qr(text,boolean) from public;
grant execute on function public.innova_resolve_qr(text,boolean) to anon,authenticated;
revoke execute on function private.innova_plan(uuid),private.innova_limit(uuid),private.innova_accrue(uuid),private.innova_reserve(uuid,uuid,text,integer),private.innova_finish(uuid,uuid,boolean),private.innova_account_summary(uuid),private.innova_guard_publication(),private.innova_visible(uuid) from public,anon,authenticated;
grant execute on function private.innova_visible(uuid) to anon,authenticated;
grant execute on function private.innova_plan(uuid),private.innova_limit(uuid),private.innova_accrue(uuid),private.innova_reserve(uuid,uuid,text,integer),private.innova_finish(uuid,uuid,boolean),private.innova_account_summary(uuid),private.innova_guard_publication(),private.innova_visible(uuid) to service_role;
commit;
