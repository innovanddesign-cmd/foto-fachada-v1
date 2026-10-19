begin;
do $$ begin
 if exists(select 1 from private.innova_contracts where billing='annual' and ((plan='PRO' and net_cents=10000) or (plan='BUSINESS' and net_cents=19000))) then
  raise exception 'LAUNCH_HISTORY_RECONCILIATION_REQUIRED: reconcile existing paid launch contracts before applying this migration';
 end if;
end $$;
-- Slots are consumed only by a verified annual launch contract, never by a request/test.
-- Existing contracts need an explicit reconciliation before enabling launch sales.
create table private.innova_launch_slots (
 slot integer primary key check(slot between 1 and 100), owner_id uuid not null unique references auth.users(id),
 plan text not null check(plan in ('PRO','BUSINESS')), net_cents integer not null,
 first_reference text not null unique, continuous_until timestamptz not null,
 lost_at timestamptz, created_at timestamptz not null default now()
);
alter table private.innova_launch_slots enable row level security;
revoke all on private.innova_launch_slots from public,anon,authenticated;
grant select on private.innova_launch_slots to innova_mvp_runtime;
grant all on private.innova_launch_slots to service_role;
create policy runtime_launch_read on private.innova_launch_slots for select to innova_mvp_runtime using(true);

create function private.innova_plan_quote(p_owner uuid,p_plan text,p_billing text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare net integer; promo boolean:=false; s private.innova_launch_slots;
begin
 if p_plan not in ('BASIC','PRO','BUSINESS') or p_billing not in ('monthly','annual') then raise exception 'INVALID_PLAN'; end if;
 net:=case when p_billing='monthly' then case p_plan when 'BASIC' then 600 when 'PRO' then 2000 else 3800 end
 else case p_plan when 'BASIC' then 6000 when 'PRO' then 20000 else 38000 end end;
 if p_billing='annual' and p_plan in ('PRO','BUSINESS') then
  select * into s from private.innova_launch_slots where owner_id=p_owner;
  if found then
   promo:=s.plan=p_plan and s.lost_at is null and now()<=s.continuous_until+interval '1 month';
  else
   promo:=(select count(*) from private.innova_launch_slots)<100;
  end if;
  if promo then net:=case p_plan when 'PRO' then 10000 else 19000 end; end if;
 end if;
 return jsonb_build_object('netCents',net,'taxCents',round(net*.21),'launch',promo,'reserved',false);
end $$;

create function private.innova_enforce_contract_price() returns trigger
language plpgsql security definer set search_path='' as $$
declare normal integer; discount integer; s private.innova_launch_slots; next_slot integer;
begin
 if new.plan='ENTERPRISE' then return new; end if;
 if new.plan not in ('BASIC','PRO','BUSINESS') or new.billing not in ('monthly','annual') then raise exception 'INVALID_PLAN'; end if;
 perform pg_catalog.pg_advisory_xact_lock(19102026,100);
 normal:=case when new.billing='monthly' then case new.plan when 'BASIC' then 600 when 'PRO' then 2000 else 3800 end else case new.plan when 'BASIC' then 6000 when 'PRO' then 20000 else 38000 end end;
 discount:=case new.plan when 'PRO' then 10000 when 'BUSINESS' then 19000 else normal end;
 if new.tax_cents<>round(new.net_cents*.21) then raise exception 'INVALID_TAX'; end if;
 select * into s from private.innova_launch_slots where owner_id=new.owner_id for update;
 if new.net_cents=normal then
  if s.owner_id is not null and s.lost_at is null and new.plan=s.plan and new.billing='annual'
   and new.period_start<=s.continuous_until and new.paid_at<=s.continuous_until+interval '1 month' then raise exception 'RENEWAL_MUST_KEEP_LAUNCH_PRICE'; end if;
  -- A paid change away from the original annual offer ends that specific concession.
  if s.owner_id is not null and (new.plan<>s.plan or new.billing<>'annual') then
   update private.innova_launch_slots set lost_at=coalesce(lost_at,now()) where owner_id=new.owner_id;
  end if;
  return new;
 end if;
 if new.billing<>'annual' or new.plan not in ('PRO','BUSINESS') or new.net_cents<>discount then raise exception 'PRICE_NOT_APPROVED'; end if;
 if new.paid_at>now() or (s.owner_id is null and new.period_start>now()) then raise exception 'INVALID_PAYMENT_DATE'; end if;
 if s.owner_id is null then
  select coalesce(max(slot),0)+1 into next_slot from private.innova_launch_slots;
  if next_slot>100 then raise exception 'LAUNCH_FULL'; end if;
  insert into private.innova_launch_slots(slot,owner_id,plan,net_cents,first_reference,continuous_until)
   values(next_slot,new.owner_id,new.plan,new.net_cents,new.reference,new.period_end);
 else
  if s.lost_at is not null or s.plan<>new.plan or s.net_cents<>new.net_cents or new.period_start>s.continuous_until
   or new.paid_at>s.continuous_until+interval '1 month' or new.period_end<=s.continuous_until then raise exception 'LAUNCH_CONTINUITY_LOST'; end if;
  update private.innova_launch_slots set continuous_until=new.period_end where owner_id=new.owner_id;
 end if;
 return new;
end $$;
create trigger innova_contract_price before insert on private.innova_contracts for each row execute function private.innova_enforce_contract_price();
revoke all on function private.innova_enforce_contract_price(),private.innova_plan_quote(uuid,text,text) from public,anon,authenticated;
grant execute on function private.innova_plan_quote(uuid,text,text) to innova_mvp_runtime,service_role;

-- A durable tombstone survives the campaign row and is safe to retry after network errors.
create table private.innova_storage_cleanup (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null,campaign_id uuid not null,
 bucket text not null check(bucket in ('escaparates-public','escaparates-assets')),
 state text not null default 'pending' check(state in ('pending','running','done')),
 attempts integer not null default 0,available_at timestamptz not null default now(),
 lease uuid,lease_until timestamptz,last_error text,created_at timestamptz not null default now(),completed_at timestamptz,
 unique(campaign_id,bucket)
);
alter table private.innova_storage_cleanup enable row level security;
create index innova_cleanup_pending on private.innova_storage_cleanup(available_at,created_at) where state<>'done';
revoke all on private.innova_storage_cleanup from public,anon,authenticated;
grant select,update on private.innova_storage_cleanup to innova_mvp_runtime;
grant all on private.innova_storage_cleanup to service_role;
create policy runtime_cleanup on private.innova_storage_cleanup to innova_mvp_runtime using(true) with check(true);
create function private.innova_queue_storage_cleanup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into private.innova_storage_cleanup(owner_id,campaign_id,bucket)
 select old.owner_id,old.id,b from unnest(array['escaparates-public','escaparates-assets']) b on conflict do nothing;
 return old;
end $$;
create trigger innova_queue_storage_cleanup before delete on public.escaparates_campaigns for each row execute function private.innova_queue_storage_cleanup();
create function private.innova_prevent_deleted_id_reuse() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from private.innova_storage_cleanup where campaign_id=new.id) then raise exception 'DELETED_CAMPAIGN_ID'; end if;
 return new;
end $$;
create trigger innova_prevent_deleted_id_reuse before insert on public.escaparates_campaigns for each row execute function private.innova_prevent_deleted_id_reuse();
revoke all on function private.innova_prevent_deleted_id_reuse() from public,anon,authenticated;
create function private.innova_claim_storage_cleanup() returns jsonb language plpgsql security definer set search_path='' as $$
declare job private.innova_storage_cleanup;
begin
 select * into job from private.innova_storage_cleanup where state<>'done' and available_at<=now() and (lease_until is null or lease_until<now()) order by created_at,id for update skip locked limit 1;
 if not found then return null; end if;
 update private.innova_storage_cleanup set state='running',lease=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1 where id=job.id returning * into job;
 return to_jsonb(job);
end $$;
create function private.innova_finish_storage_cleanup(p_id uuid,p_lease uuid,p_ok boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update private.innova_storage_cleanup set state=case when p_ok then 'done' else 'pending' end,
 completed_at=case when p_ok then now() else null end,last_error=case when p_ok then null else 'STORAGE_RETRY_REQUIRED' end,
 available_at=now()+interval '15 minutes',lease_until=null,lease=null where id=p_id and lease=p_lease and state='running';
 return found;
end $$;
revoke all on function private.innova_queue_storage_cleanup(),private.innova_claim_storage_cleanup(),private.innova_finish_storage_cleanup(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function private.innova_claim_storage_cleanup(),private.innova_finish_storage_cleanup(uuid,uuid,boolean) to innova_mvp_runtime,service_role;
commit;
