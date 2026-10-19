begin;
create table private.innova_contacts (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),
 campaign_id uuid not null references public.escaparates_campaigns(id),
 name text not null check(length(name) between 1 and 120),channel text not null check(channel in ('email','phone')),
 address text not null check(length(address) between 3 and 254),message text not null check(length(message) between 1 and 4000),
 scope text not null check(scope in ('subscription','purchase')),created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '12 months',service_until timestamptz,
 access_until timestamptz not null,check(access_until<=expires_at)
);
create index innova_contacts_owner on private.innova_contacts(owner_id,id);
create index innova_contacts_campaign on private.innova_contacts(campaign_id);
create index innova_contacts_expiry on private.innova_contacts(access_until);
create table private.innova_contact_deletions (
 contact_id uuid primary key,owner_id uuid not null,campaign_id uuid not null,deleted_at timestamptz not null default now()
);
alter table private.innova_contact_deletions enable row level security;
revoke all on private.innova_contact_deletions from public,anon,authenticated;
grant select on private.innova_contact_deletions to innova_mvp_runtime;
grant all on private.innova_contact_deletions to service_role;
create policy runtime_contact_deletions_read on private.innova_contact_deletions for select to innova_mvp_runtime using(true);
create function private.innova_record_contact_deletion() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into private.innova_contact_deletions(contact_id,owner_id,campaign_id) values(old.id,old.owner_id,old.campaign_id) on conflict do nothing;return old;
end $$;
create trigger innova_record_contact_deletion before delete on private.innova_contacts for each row execute function private.innova_record_contact_deletion();
revoke all on function private.innova_record_contact_deletion() from public,anon,authenticated;
create table private.innova_contact_receipts (
 campaign_id uuid not null references public.escaparates_campaigns(id) on delete cascade,request_id uuid not null,
 contact_id uuid references private.innova_contacts(id) on delete set null,created_at timestamptz not null default now(),primary key(campaign_id,request_id)
);
create table private.innova_contact_notices (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null,kind text not null,
 dedupe_key text not null unique,not_before timestamptz not null default now(),
 details jsonb not null default '{}',sent_at timestamptz,created_at timestamptz not null default now()
);
create index innova_contact_notices_pending on private.innova_contact_notices(not_before) where sent_at is null;
create table private.innova_contact_rate (
 campaign_id uuid primary key references public.escaparates_campaigns(id) on delete cascade,
 window_start timestamptz not null default now(),attempts integer not null default 0
);
alter table private.innova_contacts enable row level security;
alter table private.innova_contact_receipts enable row level security;
alter table private.innova_contact_notices enable row level security;
alter table private.innova_contact_rate enable row level security;
revoke all on private.innova_contacts,private.innova_contact_receipts,private.innova_contact_notices,private.innova_contact_rate from public,anon,authenticated;
grant select on private.innova_contacts,private.innova_contact_notices to innova_mvp_runtime;
grant all on private.innova_contacts,private.innova_contact_receipts,private.innova_contact_notices,private.innova_contact_rate to service_role;
create policy runtime_contacts_read on private.innova_contacts for select to innova_mvp_runtime using(true);
create policy runtime_contact_notices_read on private.innova_contact_notices for select to innova_mvp_runtime using(true);

create function private.innova_contact_capacity(p_campaign uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare owner uuid; tier text; bucket_scope text; cap integer:=0; used integer; until_at timestamptz;
begin
 select owner_id into owner from public.escaparates_campaigns where id=p_campaign;
 if owner is null then return jsonb_build_object('available',false); end if;
 if exists(select 1 from private.innova_campaign_purchases where campaign_id=p_campaign and owner_id=owner) then bucket_scope:='purchase';cap:=100;
 else
  bucket_scope:='subscription';tier:=private.innova_subscription_plan(owner);
  if tier in ('PRO','BUSINESS') then
   cap:=case tier when 'BUSINESS' then 1500 else 500 end;select paid_until into until_at from private.innova_accounts where owner_id=owner;
   if until_at is null or until_at<=now() then cap:=0; end if;
  else
   select campaign_started_at+interval '7 days' into until_at from private.innova_experiences where owner_id=owner and campaign_id=p_campaign and campaign_started_at is not null and campaign_started_at+interval '7 days'>now();
   if found then cap:=500; end if;
  end if;
 end if;
 select count(*) into used from private.innova_contacts c where c.owner_id=owner and c.access_until>now() and c.scope=bucket_scope and (bucket_scope='subscription' or c.campaign_id=p_campaign);
 return jsonb_build_object('available',cap>0 and used<cap and private.innova_visible(p_campaign),'limit',cap,'used',used,'scope',bucket_scope,'serviceUntil',until_at,'owner',owner);
end $$;

create function private.innova_capture_contact(p_slug text,p_request uuid,p_name text,p_channel text,p_address text,p_message text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c uuid; owner uuid; receipt private.innova_contact_receipts; q jsonb; result_id uuid; n integer; scope_key text; until_at timestamptz;
begin
 select campaign_id,owner_id into c,owner from public.escaparates_published where slug=p_slug;
 if not found then return jsonb_build_object('status','unavailable'); end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text,813));
 if not private.innova_visible(c) then return jsonb_build_object('status','unavailable'); end if;
 select * into receipt from private.innova_contact_receipts where campaign_id=c and request_id=p_request;
 if found then
  if receipt.contact_id is null or exists(select 1 from private.innova_contact_deletions where contact_id=receipt.contact_id) then return jsonb_build_object('status','removed'); end if;
  if not exists(select 1 from private.innova_contacts where id=receipt.contact_id and name=trim(p_name) and channel=p_channel and address=trim(p_address) and message=trim(p_message)) then return jsonb_build_object('status','conflict'); end if;
  return jsonb_build_object('status','saved');
 end if;
 insert into private.innova_contact_rate(campaign_id,attempts) values(c,1) on conflict(campaign_id) do update set
 attempts=case when innova_contact_rate.window_start<=now()-interval '1 minute' then 1 else innova_contact_rate.attempts+1 end,
 window_start=case when innova_contact_rate.window_start<=now()-interval '1 minute' then now() else innova_contact_rate.window_start end returning attempts into n;
 if n>20 then return jsonb_build_object('status','rate_limited'); end if;
 q:=private.innova_contact_capacity(c);
 if not (q->>'available')::boolean then return jsonb_build_object('status',case when (q->>'limit')::integer>0 then 'full' else 'unavailable' end); end if;
 until_at:=(q->>'serviceUntil')::timestamptz;
 insert into private.innova_contacts(owner_id,campaign_id,name,channel,address,message,scope,service_until,access_until)
 values(owner,c,trim(p_name),p_channel,trim(p_address),trim(p_message),q->>'scope',until_at,least(now()+interval '12 months',coalesce(until_at+interval '30 days','infinity'::timestamptz))) returning id into result_id;
 insert into private.innova_contact_receipts(campaign_id,request_id,contact_id) values(c,p_request,result_id);
 insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details) values(owner,'contact','contact:'||result_id,jsonb_build_object('campaignId',c,'count',1));
 n:=(q->>'used')::integer+1;scope_key:=case q->>'scope' when 'purchase' then c::text else owner::text end;
 if n>=ceil((q->>'limit')::integer*.8) then
  insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details) values(owner,case when n>=(q->>'limit')::integer then 'capacity_full' else 'capacity_80' end,
   'capacity:'||scope_key||':'||case when n>=(q->>'limit')::integer then '100' else '80' end||':'||current_date,
   jsonb_build_object('campaignId',c,'used',n,'limit',(q->>'limit')::integer)) on conflict(dedupe_key) do nothing;
 end if;
 return jsonb_build_object('status','saved');
end $$;

-- Extend an uninterrupted service only. Once lost, never reset the 30-day window by returning.
create function private.innova_contacts_account_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.plan in ('PRO','BUSINESS') and new.paid_until>now() then
  update private.innova_contacts set service_until=new.paid_until,access_until=least(expires_at,new.paid_until+interval '30 days')
   where owner_id=new.owner_id and scope='subscription' and service_until>=now() and access_until>now();
 elsif TG_OP='UPDATE' and old.plan in ('PRO','BUSINESS') and new.plan not in ('PRO','BUSINESS') then
  update private.innova_contacts set service_until=least(service_until,now()),access_until=least(access_until,now()+interval '30 days') where owner_id=new.owner_id and scope='subscription';
 end if;
 return new;
end $$;
create trigger innova_contacts_account_change after insert or update of plan,paid_until on private.innova_accounts for each row execute function private.innova_contacts_account_change();
create function private.innova_contacts_on_purchase() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update private.innova_contacts set scope='purchase',access_until=case when service_until>=now() then expires_at else access_until end,service_until=null
 where campaign_id=new.campaign_id and owner_id=new.owner_id and scope='subscription' and access_until>now();
 return new;
end $$;
create trigger innova_contacts_on_purchase after insert on private.innova_campaign_purchases for each row execute function private.innova_contacts_on_purchase();
revoke all on function private.innova_contacts_on_purchase() from public,anon,authenticated;
create function private.innova_delete_contacts(p_owner uuid,p_campaign uuid,p_contact uuid default null) returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 delete from private.innova_contacts where owner_id=p_owner and campaign_id=p_campaign and (p_contact is null or id=p_contact);
 get diagnostics n=row_count;return n;
end $$;
create function private.innova_contacts_before_campaign_delete() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from private.innova_contacts where campaign_id=old.id) then raise exception 'Exporta tus consultas si quieres conservarlas y confirma su borrado en Consultas antes de eliminar la campaña.'; end if;
 return old;
end $$;
create trigger innova_contacts_before_campaign_delete before delete on public.escaparates_campaigns for each row execute function private.innova_contacts_before_campaign_delete();
create function private.innova_purge_expired_contacts() returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 delete from private.innova_contacts where id in(select c.id from private.innova_contacts c where c.access_until<=now() or exists(select 1 from private.innova_contact_deletions d where d.contact_id=c.id) order by c.access_until for update of c skip locked limit 500);
 get diagnostics n=row_count;
 delete from private.innova_contact_receipts where created_at<now()-interval '12 months' and contact_id is null;
 return n;
end $$;
revoke all on function private.innova_contact_capacity(uuid),private.innova_capture_contact(text,uuid,text,text,text,text),private.innova_contacts_account_change(),private.innova_delete_contacts(uuid,uuid,uuid),private.innova_contacts_before_campaign_delete(),private.innova_purge_expired_contacts() from public,anon,authenticated;
grant execute on function private.innova_contact_capacity(uuid),private.innova_capture_contact(text,uuid,text,text,text,text),private.innova_delete_contacts(uuid,uuid,uuid),private.innova_purge_expired_contacts() to innova_mvp_runtime,service_role;

create table private.innova_campaign_retention (
 campaign_id uuid primary key references public.escaparates_campaigns(id) on delete cascade,owner_id uuid not null,
 cycle uuid not null default gen_random_uuid(),archived_at timestamptz not null default now(),delete_after timestamptz not null default now()+interval '12 months',checked_at timestamptz not null default '-infinity'
);
alter table private.innova_campaign_retention enable row level security;
revoke all on private.innova_campaign_retention from public,anon,authenticated;
grant select on private.innova_campaign_retention to innova_mvp_runtime;
grant all on private.innova_campaign_retention to service_role;
create policy runtime_retention_read on private.innova_campaign_retention for select to innova_mvp_runtime using(true);
create index innova_campaign_retention_due on private.innova_campaign_retention(delete_after);
create function private.innova_process_retention() returns jsonb language plpgsql security definer set search_path='' as $$
declare r record; a private.innova_campaign_retention; contacts integer; removed integer:=0;
begin
 contacts:=private.innova_purge_expired_contacts();
 -- Only formerly published campaigns that lost visibility are archived. Drafts and the current FREE web remain.
 for r in select p.campaign_id,p.owner_id from public.escaparates_published p where not private.innova_visible(p.campaign_id)
  and not private.innova_extra_campaign(p.owner_id,p.campaign_id) and not exists(select 1 from private.innova_campaign_retention x where x.campaign_id=p.campaign_id) limit 100 loop
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(r.owner_id::text,813));
  if not private.innova_visible(r.campaign_id) and not private.innova_extra_campaign(r.owner_id,r.campaign_id) then
   insert into private.innova_campaign_retention(campaign_id,owner_id) values(r.campaign_id,r.owner_id) on conflict do nothing;
  end if;
 end loop;
 for a in select * from private.innova_campaign_retention order by checked_at,delete_after limit 100 loop
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(a.owner_id::text,813));
  update private.innova_campaign_retention set checked_at=now() where campaign_id=a.campaign_id;
  if private.innova_visible(a.campaign_id) or private.innova_extra_campaign(a.owner_id,a.campaign_id)
   or (not exists(select 1 from public.escaparates_published where campaign_id=a.campaign_id) and exists(select 1 from private.innova_accounts where owner_id=a.owner_id and plan in ('PRO','BUSINESS') and paid_until>now())) then
   delete from private.innova_contact_notices where dedupe_key in ('archive30:'||a.cycle,'archive7:'||a.cycle) and sent_at is null;
   delete from private.innova_campaign_retention where campaign_id=a.campaign_id;continue;
  end if;
  if now()>=a.delete_after-interval '30 days' then
   insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details) values(a.owner_id,'deletion_warning','archive30:'||a.cycle,jsonb_build_object('campaignId',a.campaign_id,'deleteAfter',a.delete_after,'days',30)) on conflict do nothing;
  end if;
  if now()>=a.delete_after-interval '7 days' then
   insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details) values(a.owner_id,'deletion_warning','archive7:'||a.cycle,jsonb_build_object('campaignId',a.campaign_id,'deleteAfter',a.delete_after,'days',7)) on conflict do nothing;
  end if;
  -- Never count queued mail as delivered. Require the actual 30/7-day notice periods too.
  if now()>=a.delete_after and exists(select 1 from private.innova_contact_notices where dedupe_key='archive30:'||a.cycle and sent_at<=now()-interval '30 days')
   and exists(select 1 from private.innova_contact_notices where dedupe_key='archive7:'||a.cycle and sent_at<=now()-interval '7 days')
   and not exists(select 1 from private.innova_contacts where campaign_id=a.campaign_id) then
   delete from public.escaparates_campaigns where id=a.campaign_id;removed:=removed+1;
  end if;
 end loop;
 return jsonb_build_object('contactsDeleted',contacts,'campaignsDeleted',removed);
end $$;
revoke all on function private.innova_process_retention() from public,anon,authenticated;
grant execute on function private.innova_process_retention() to innova_mvp_runtime,service_role;
commit;
