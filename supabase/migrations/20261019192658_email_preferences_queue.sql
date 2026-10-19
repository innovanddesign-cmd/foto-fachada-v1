begin;
create table private.innova_email_preferences (
 owner_id uuid primary key references auth.users(id),contact_mode text not null default 'immediate' check(contact_mode in ('immediate','daily','off')),
 timezone text not null default 'Europe/Madrid',updated_at timestamptz not null default now()
);
create table private.innova_email_jobs (
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),kind text not null,
 scheduled_at timestamptz not null,state text not null default 'pending' check(state in ('pending','sent','cancelled')),
 event_count integer not null default 1,sent_at timestamptz,created_at timestamptz not null default now()
);
create table private.innova_email_sources (
 notice_id uuid primary key references private.innova_contact_notices(id) on delete cascade,
 job_id uuid references private.innova_email_jobs(id),suppressed boolean not null default false
);
alter table private.innova_email_preferences enable row level security;
alter table private.innova_email_jobs enable row level security;
alter table private.innova_email_sources enable row level security;
revoke all on private.innova_email_preferences,private.innova_email_jobs,private.innova_email_sources from public,anon,authenticated;
grant select on private.innova_email_preferences,private.innova_email_jobs,private.innova_email_sources to innova_mvp_runtime;
grant all on private.innova_email_preferences,private.innova_email_jobs,private.innova_email_sources to service_role;
create policy runtime_email_preferences on private.innova_email_preferences for select to innova_mvp_runtime using(true);
create policy runtime_email_jobs on private.innova_email_jobs for select to innova_mvp_runtime using(true);
create policy runtime_email_sources on private.innova_email_sources for select to innova_mvp_runtime using(true);
create index innova_email_jobs_pending on private.innova_email_jobs(scheduled_at) where state='pending';
create index innova_email_jobs_owner on private.innova_email_jobs(owner_id,kind,state);
create index innova_email_sources_job on private.innova_email_sources(job_id);
create function private.innova_set_email_preferences(p_owner uuid,p_mode text,p_timezone text) returns void language plpgsql security definer set search_path='' as $$
declare due timestamptz; last_sent timestamptz;
begin
 if p_mode not in ('immediate','daily','off') or p_mode is null or not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'INVALID_PREFERENCE'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,816));
 insert into private.innova_email_preferences(owner_id,contact_mode,timezone) values(p_owner,p_mode,p_timezone) on conflict(owner_id) do update set contact_mode=excluded.contact_mode,timezone=excluded.timezone,updated_at=now();
 if p_mode='off' then update private.innova_email_jobs set state='cancelled' where owner_id=p_owner and kind='contact' and state='pending';
 else
  if p_mode='daily' then
   due:=((now() at time zone p_timezone)::date+time '09:00') at time zone p_timezone;
   if due<=now() then due:=(((now() at time zone p_timezone)::date+1)+time '09:00') at time zone p_timezone; end if;
  else
   select max(sent_at) into last_sent from private.innova_email_jobs where owner_id=p_owner and kind='contact' and state='sent';due:=greatest(now(),last_sent+interval '15 minutes');
  end if;
  update private.innova_email_jobs set scheduled_at=due where owner_id=p_owner and kind='contact' and state='pending';
 end if;
end $$;
create function private.innova_prepare_contact_emails() returns integer language plpgsql security definer set search_path='' as $$
declare n private.innova_contact_notices; pref private.innova_email_preferences; job uuid; due timestamptz; last_sent timestamptz; prepared integer:=0;
begin
 for n in select x.* from private.innova_contact_notices x where x.sent_at is null and x.not_before<=now() and not exists(select 1 from private.innova_email_sources s where s.notice_id=x.id) order by x.created_at,x.id limit 500 loop
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(n.owner_id::text,816));
  if exists(select 1 from private.innova_email_sources where notice_id=n.id) then continue; end if;
  select * into pref from private.innova_email_preferences where owner_id=n.owner_id;
  if not found then pref.contact_mode:='immediate';pref.timezone:='Europe/Madrid'; end if;
  if n.kind='contact' and (pref.contact_mode='off' or not exists(select 1 from private.innova_contacts c where n.dedupe_key='contact:'||c.id and c.access_until>now())) then
   insert into private.innova_email_sources(notice_id,suppressed) values(n.id,true);continue;
  end if;
  job:=null;due:=now();
  if n.kind='contact' then
   select id into job from private.innova_email_jobs where owner_id=n.owner_id and kind='contact' and state='pending' order by scheduled_at limit 1;
   if pref.contact_mode='daily' then
    due:=((now() at time zone pref.timezone)::date+time '09:00') at time zone pref.timezone;
    if due<=now() then due:=(((now() at time zone pref.timezone)::date+1)+time '09:00') at time zone pref.timezone; end if;
   else
    select max(sent_at) into last_sent from private.innova_email_jobs where owner_id=n.owner_id and kind='contact' and state='sent';
    due:=greatest(now(),last_sent+interval '15 minutes');
   end if;
  end if;
  if job is null then
   insert into private.innova_email_jobs(owner_id,kind,scheduled_at) values(n.owner_id,n.kind,due) returning id into job;
 else update private.innova_email_jobs set event_count=event_count+1,scheduled_at=least(scheduled_at,due) where id=job; end if;
  insert into private.innova_email_sources(notice_id,job_id) values(n.id,job);
  prepared:=prepared+1;
 end loop;
 return prepared;
end $$;
revoke all on function private.innova_set_email_preferences(uuid,text,text),private.innova_prepare_contact_emails() from public,anon,authenticated;
grant execute on function private.innova_set_email_preferences(uuid,text,text),private.innova_prepare_contact_emails() to innova_mvp_runtime,service_role;
commit;
