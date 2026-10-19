begin;
create table private.innova_publication_schedule (
 campaign_id uuid primary key references public.escaparates_campaigns(id) on delete cascade,
 owner_id uuid not null references auth.users(id), revision uuid not null default gen_random_uuid(),
 slug text not null check(slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),payload jsonb not null,
 due_at timestamptz not null,timezone text not null,
 state text not null default 'pending' check(state in ('pending','processing','published','failed','cancelled')),
 attempts integer not null default 0, next_attempt_at timestamptz not null,
 result text, published_at timestamptz,updated_at timestamptz not null default now()
);
create table private.innova_publication_notices (
 revision uuid primary key,owner_id uuid not null,campaign_id uuid not null,
 outcome text not null check(outcome in ('published','failed')),reason text not null,
 created_at timestamptz not null default now(),sent_at timestamptz
);
alter table private.innova_publication_schedule enable row level security;
create index innova_schedule_due on private.innova_publication_schedule(next_attempt_at,due_at) where state='pending';
create index innova_schedule_owner on private.innova_publication_schedule(owner_id,due_at desc);
create index innova_publication_notices_pending on private.innova_publication_notices(created_at) where sent_at is null;
alter table private.innova_publication_notices enable row level security;
revoke all on private.innova_publication_schedule,private.innova_publication_notices from public,anon,authenticated;
grant select on private.innova_publication_schedule,private.innova_publication_notices to innova_mvp_runtime;
grant all on private.innova_publication_schedule,private.innova_publication_notices to service_role;
create policy runtime_schedule_read on private.innova_publication_schedule for select to innova_mvp_runtime using(true);
create policy runtime_publication_notices_read on private.innova_publication_notices for select to innova_mvp_runtime using(true);

create function private.innova_schedule_publication(p_owner uuid,p_campaign uuid,p_slug text,p_payload jsonb,p_due timestamptz,p_timezone text) returns uuid
language plpgsql security definer set search_path='' as $$
declare r uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 if not exists(select 1 from public.escaparates_campaigns where id=p_campaign and owner_id=p_owner) then raise exception 'CAMPAIGN_NOT_FOUND'; end if;
 if private.innova_subscription_plan(p_owner) not in ('PRO','BUSINESS') then raise exception 'SCHEDULING_NOT_INCLUDED'; end if;
 if p_due<=now() or p_due is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'INVALID_SCHEDULE_TIME'; end if;
 if jsonb_typeof(p_payload) is distinct from 'object' or jsonb_typeof(p_payload->'datosEscaparate') is distinct from 'object' or length(coalesce(p_payload#>>'{datosEscaparate,titularPrincipal}',''))=0 or octet_length(p_payload::text)>262144 then raise exception 'INVALID_PUBLICATION'; end if;
 if not exists(select 1 from public.escaparates_published where campaign_id=p_campaign) and not private.innova_extra_campaign(p_owner,p_campaign) and
 (select count(*) from public.escaparates_published where owner_id=p_owner and not private.innova_extra_campaign(p_owner,campaign_id))>=private.innova_limit(p_owner) then raise exception 'CAPACITY_REACHED'; end if;
 insert into private.innova_publication_schedule(campaign_id,owner_id,slug,payload,due_at,timezone,next_attempt_at)
 values(p_campaign,p_owner,p_slug,p_payload,p_due,p_timezone,p_due)
 on conflict(campaign_id) do update set revision=gen_random_uuid(),slug=excluded.slug,payload=excluded.payload,due_at=excluded.due_at,timezone=excluded.timezone,next_attempt_at=excluded.next_attempt_at,state='pending',attempts=0,result=null,published_at=null,updated_at=now()
 returning revision into r;
 return r;
end $$;
create function private.innova_cancel_schedule(p_owner uuid,p_campaign uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 update private.innova_publication_schedule set state='cancelled',result='USER_CANCELLED',updated_at=now() where owner_id=p_owner and campaign_id=p_campaign and state='pending';
 return found;
end $$;
create function private.innova_cancel_schedule_on_publish() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update private.innova_publication_schedule set state='cancelled',result='PUBLISHED_NOW',updated_at=now() where campaign_id=new.campaign_id and state='pending';
 return new;
end $$;
create trigger innova_cancel_schedule_on_publish after insert or update on public.escaparates_published for each row execute function private.innova_cancel_schedule_on_publish();

create function private.innova_run_scheduled_publication() returns jsonb language plpgsql security definer set search_path='' as $$
declare job private.innova_publication_schedule; failure text; n integer;
begin
 -- Use the same owner-first order as publish/cancel to avoid cross-lock deadlocks.
 select * into job from private.innova_publication_schedule where state='pending' and next_attempt_at<=now() order by due_at,campaign_id limit 1;
 if not found then return null; end if;
 if not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended(job.owner_id::text,813)) then return null; end if;
 select * into job from private.innova_publication_schedule where campaign_id=job.campaign_id and state='pending' and next_attempt_at<=now() for update skip locked;
 if not found then return null; end if;
 failure:=null;
 if now()>job.due_at+interval '15 minutes' then failure:='MISSED_WINDOW';
 elsif private.innova_subscription_plan(job.owner_id) not in ('PRO','BUSINESS') then failure:='PERMISSION_LOST';
 elsif not exists(select 1 from public.escaparates_campaigns where id=job.campaign_id and owner_id=job.owner_id) then failure:='CAMPAIGN_NOT_FOUND';
 elsif not private.innova_extra_campaign(job.owner_id,job.campaign_id) and not exists(select 1 from public.escaparates_published where campaign_id=job.campaign_id) then
  select count(*) into n from public.escaparates_published where owner_id=job.owner_id and not private.innova_extra_campaign(job.owner_id,campaign_id);
  if n>=private.innova_limit(job.owner_id) then failure:='CAPACITY_REACHED'; end if;
 end if;
 if failure is null then
  update private.innova_publication_schedule set state='processing',attempts=attempts+1 where campaign_id=job.campaign_id;
  begin
   insert into public.escaparates_published(campaign_id,owner_id,slug,payload,plan) values(job.campaign_id,job.owner_id,job.slug,job.payload,'PRO')
   on conflict(campaign_id) do update set slug=excluded.slug,payload=excluded.payload;
   update public.escaparates_campaigns set status='active',slug=job.slug where id=job.campaign_id;
  exception when unique_violation or check_violation or foreign_key_violation or raise_exception then failure:='PUBLICATION_NEEDS_REVIEW';
   when others then failure:='TECHNICAL_FAILURE';
  end;
  if failure='TECHNICAL_FAILURE' and job.attempts<3 and now()+interval '5 minutes'<=job.due_at+interval '15 minutes' then
   update private.innova_publication_schedule set state='pending',result=failure,next_attempt_at=now()+interval '5 minutes',updated_at=now() where campaign_id=job.campaign_id;
   return jsonb_build_object('state','pending','reason',failure);
  end if;
 end if;
 update private.innova_publication_schedule set state=case when failure is null then 'published' else 'failed' end,result=coalesce(failure,'PUBLISHED'),published_at=case when failure is null then now() else null end,updated_at=now() where campaign_id=job.campaign_id;
 insert into private.innova_publication_notices(revision,owner_id,campaign_id,outcome,reason) values(job.revision,job.owner_id,job.campaign_id,case when failure is null then 'published' else 'failed' end,coalesce(failure,'PUBLISHED')) on conflict do nothing;
 return jsonb_build_object('state',case when failure is null then 'published' else 'failed' end,'reason',failure);
end $$;
revoke all on function private.innova_schedule_publication(uuid,uuid,text,jsonb,timestamptz,text),private.innova_cancel_schedule(uuid,uuid),private.innova_cancel_schedule_on_publish(),private.innova_run_scheduled_publication() from public,anon,authenticated;
grant execute on function private.innova_schedule_publication(uuid,uuid,text,jsonb,timestamptz,text),private.innova_cancel_schedule(uuid,uuid),private.innova_run_scheduled_publication() to innova_mvp_runtime,service_role;
commit;
