begin;
alter table private.innova_email_jobs drop constraint innova_email_jobs_state_check;
alter table private.innova_email_jobs add constraint innova_email_jobs_state_check check(state in ('pending','dispatching','accepted','sent','cancelled','review'));
alter table private.innova_email_jobs add column payload jsonb, add column first_attempt_at timestamptz,
 add column lease uuid, add column lease_until timestamptz, add column attempts integer not null default 0,
 add column provider_id text unique, add column checked_at timestamptz, add column delivered_at timestamptz;
create index innova_email_attempt_window on private.innova_email_jobs(first_attempt_at) where first_attempt_at is not null;
create index innova_email_dispatch_due on private.innova_email_jobs(lease_until) where state='dispatching';
create index innova_email_accepted_due on private.innova_email_jobs(checked_at,sent_at) where state='accepted';

create function private.innova_experience_notice_valid(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.innova_experience_notices n join private.innova_experiences e on e.owner_id=n.owner_id
 where n.id=p_id and n.state='pending' and n.due_at<=now()
 and not exists(select 1 from private.innova_accounts a where a.owner_id=n.owner_id and a.plan<>'FREE' and a.paid_until>now()) and (
 (n.kind='campaign_trial_24h' and e.campaign_started_at+interval '7 days'>now() and not private.innova_extra_campaign(e.owner_id,e.campaign_id))
 or (n.kind='campaign_trial_end' and e.campaign_started_at+interval '7 days'<=now() and e.basic_started_at is null and not e.basic_declined and not private.innova_extra_campaign(e.owner_id,e.campaign_id))
 or (n.kind='basic_trial_start' and private.innova_basic_trial(e.owner_id))
 or (n.kind='basic_trial_end' and e.basic_started_at+interval '48 hours'<=now() and not e.basic_declined)));
$$;
create function private.innova_prepare_experience_emails() returns integer language plpgsql security definer set search_path='' as $$
declare prepared integer;begin
 insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details)
 select n.owner_id,'experience','experience:'||n.id,jsonb_build_object('experienceNoticeId',n.id,'kind',n.kind)
 from private.innova_experience_notices n where private.innova_experience_notice_valid(n.id)
 order by due_at,id limit 500 on conflict do nothing;
 get diagnostics prepared=row_count;return prepared;
end $$;

create function private.innova_prepare_publication_emails() returns integer language plpgsql security definer set search_path='' as $$
declare prepared integer;begin
 insert into private.innova_contact_notices(owner_id,kind,dedupe_key,details)
 select n.owner_id,'publication','publication:'||n.revision,jsonb_build_object('revision',n.revision,'outcome',n.outcome)
 from private.innova_publication_notices n join private.innova_publication_schedule s on s.revision=n.revision and s.owner_id=n.owner_id
 where n.sent_at is null and s.state in ('published','failed') order by n.created_at,n.revision limit 500 on conflict do nothing;
 get diagnostics prepared=row_count;return prepared;
end $$;

-- Only current, owned sources may authorize a send. Never fabricate an orphaned notice.
create function private.innova_email_source_valid(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.innova_contact_notices n where n.id=p_id and (
 (n.kind='contact' and exists(select 1 from private.innova_contacts c where n.dedupe_key='contact:'||c.id and c.owner_id=n.owner_id and c.access_until>now()
   and not exists(select 1 from private.innova_contact_deletions d where d.contact_id=c.id)))
 or (n.kind in ('capacity_80','capacity_full') and exists(select 1 from public.escaparates_campaigns c where c.id::text=n.details->>'campaignId' and c.owner_id=n.owner_id
   and (private.innova_contact_capacity(c.id)->>'limit')::integer>0 and private.innova_visible(c.id)))
 or (n.kind='experience' and exists(select 1 from private.innova_experience_notices x where x.id::text=n.details->>'experienceNoticeId' and x.owner_id=n.owner_id and private.innova_experience_notice_valid(x.id)))
 or (n.kind='publication' and exists(select 1 from private.innova_publication_notices x join private.innova_publication_schedule s on s.revision=x.revision and s.owner_id=x.owner_id
   where x.revision::text=n.details->>'revision' and x.owner_id=n.owner_id and x.sent_at is null and s.state in ('published','failed')))
 or (n.kind='deletion_warning' and exists(select 1 from private.innova_campaign_retention r where r.owner_id=n.owner_id and r.campaign_id::text=n.details->>'campaignId'
   and n.dedupe_key in ('archive30:'||r.cycle,'archive7:'||r.cycle) and not private.innova_visible(r.campaign_id) and not private.innova_extra_campaign(r.owner_id,r.campaign_id)))
 ));
$$;

create function private.innova_claim_email(p_from text,p_origin text) returns jsonb language plpgsql security definer set search_path='' as $$
declare j private.innova_email_jobs; recipient text; sources integer; body text; token uuid; notice private.innova_contact_notices; next_contact timestamptz;
begin
 if p_from is null or p_from !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$' or p_origin is null or p_origin !~ '^https://[a-zA-Z0-9.-]+(:[0-9]+)?$' then raise exception 'INVALID_MAIL_CONFIG'; end if;
 perform pg_catalog.pg_advisory_xact_lock(817);
 -- Stop retries before the provider's 24-hour idempotency window expires.
 update private.innova_email_jobs set state='review',lease=null,lease_until=null where state='dispatching' and first_attempt_at<now()-interval '23 hours' and (lease_until is null or lease_until<now());
 for j in select * from private.innova_email_jobs where (state='pending' and scheduled_at<=now()) or (state='dispatching' and lease_until<now() and first_attempt_at>=now()-interval '23 hours')
 order by case when kind='contact' then 1 else 0 end,scheduled_at,id limit 50 for update skip locked loop
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(j.owner_id::text,816));
  select u.email into recipient from auth.users u where u.id=j.owner_id and nullif(to_jsonb(u)->>'email_confirmed_at','') is not null and coalesce(to_jsonb(u)->>'is_anonymous','false')<>'true';
  if recipient is null or recipient !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+\.[^[:space:]<>@]+$' then
   update private.innova_email_jobs set state=case when first_attempt_at is null then 'cancelled' else 'review' end where id=j.id;continue;
  end if;
  select count(*) into sources from private.innova_email_sources s where s.job_id=j.id and not s.suppressed and private.innova_email_source_valid(s.notice_id);
  if sources=0 or (j.kind='contact' and exists(select 1 from private.innova_email_preferences where owner_id=j.owner_id and contact_mode='off'))
   or (j.payload is not null and j.payload->'to'->>0<>recipient) then
   update private.innova_email_jobs set state=case when first_attempt_at is null then 'cancelled' else 'review' end where id=j.id;continue;
  end if;
  if j.first_attempt_at is null then
   if j.kind='contact' then
    select max(first_attempt_at)+interval '15 minutes' into next_contact from private.innova_email_jobs where owner_id=j.owner_id and kind='contact' and id<>j.id;
    if next_contact>now() then update private.innova_email_jobs set scheduled_at=next_contact where id=j.id;continue; end if;
   end if;
   -- Conservative rolling windows; every reservation counts, including uncertain outcomes.
   if (select count(*) from private.innova_email_jobs where first_attempt_at>now()-interval '24 hours')>=100
    or (select count(*) from private.innova_email_jobs where first_attempt_at>now()-interval '31 days')>=3000 then return jsonb_build_object('quotaBlocked',true); end if;
   if j.kind='contact' then body:='Tienes nuevas consultas en INNOVA Escaparates. Puedes consultarlas de forma privada en '||p_origin||'/contacts. Preferencias de avisos en esa misma página.';
   elsif j.kind in ('capacity_80','capacity_full') then body:='Has recibido un aviso de capacidad de consultas. Revisa la capacidad actual y exporta o elimina las consultas que ya no necesites en '||p_origin||'/contacts. Los botones de contacto siguen disponibles.';
   elsif j.kind='experience' then
    select n.* into notice from private.innova_contact_notices n join private.innova_email_sources s on s.notice_id=n.id where s.job_id=j.id and private.innova_email_source_valid(n.id) limit 1;
    body:=case notice.details->>'kind'
     when 'campaign_trial_24h' then 'Tu prueba de campaña está en sus últimas 24 horas. Consulta la fecha exacta, tus opciones y los precios vigentes en tu panel.'
     when 'campaign_trial_end' then 'Tu prueba de campaña ha terminado. Para conservar sus beneficios puedes comprar la campaña o consultar la oferta PRO disponible. También puedes solicitar la prueba BASIC de 48 horas si todavía no la has disfrutado. Tu web FREE y las campañas ya compradas se conservan.'
     when 'basic_trial_start' then 'Tu prueba BASIC de 48 horas está activa. Consulta la hora exacta de finalización en tu panel. Al terminar se mantienen tu web FREE y las campañas compradas.'
     when 'basic_trial_end' then 'Tu prueba BASIC ha terminado. Tu web FREE y las campañas ya compradas se conservan. Consulta las opciones actuales si deseas contratar BASIC.' end||' '||p_origin||'/dashboard';
   elsif j.kind='publication' then
    select n.* into notice from private.innova_contact_notices n join private.innova_email_sources s on s.notice_id=n.id where s.job_id=j.id and private.innova_email_source_valid(n.id) limit 1;
    body:=case when notice.details->>'outcome'='published' then 'La publicación programada se ha completado. Revisa el resultado actual en tu panel.' else 'No se pudo completar la publicación programada. Revisa la campaña, los permisos y la capacidad en tu panel antes de volver a programarla.' end||' '||p_origin||'/dashboard';
   elsif j.kind='deletion_warning' then
    select n.* into notice from private.innova_contact_notices n join private.innova_email_sources s on s.notice_id=n.id where s.job_id=j.id and private.innova_email_source_valid(n.id) limit 1;
    body:='Aviso de conservación: la campaña '||(notice.details->>'campaignId')||' está archivada. Su eliminación no se realizará antes de '||(notice.details->>'days')||' días desde la entrega de este aviso, ni antes del plazo de conservación. Revisa y exporta las consultas en '||p_origin||'/contacts?campaign='||(notice.details->>'campaignId')||'. Recupera el servicio o revisa la campaña desde tu panel si deseas conservarla.';
   else update private.innova_email_jobs set state='review' where id=j.id;continue; end if;
   j.payload:=jsonb_build_object('from',p_from,'to',jsonb_build_array(recipient),'subject',case when j.kind='deletion_warning' then 'INNOVA: aviso antes de eliminar una campaña archivada' else 'INNOVA: novedades de tu escaparate' end,'text',body);
  end if;
  token:=gen_random_uuid();
  update private.innova_email_jobs set state='dispatching',payload=j.payload,first_attempt_at=coalesce(first_attempt_at,now()),lease=token,lease_until=now()+interval '5 minutes',attempts=attempts+1 where id=j.id;
  return jsonb_build_object('id',j.id,'lease',token,'payload',j.payload);
 end loop;
 return null;
end $$;

create function private.innova_finish_email(p_id uuid,p_lease uuid,p_provider text,p_retry boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update private.innova_email_jobs set state=case when p_provider is not null then 'accepted' when p_retry then 'dispatching' else 'review' end,
 provider_id=p_provider,lease=null,lease_until=case when p_provider is null and p_retry then now()+interval '5 minutes' else null end,
 sent_at=case when p_provider is not null then now() else null end
 where id=p_id and lease=p_lease and state='dispatching';
 return found;
end $$;

-- Provider acceptance is not delivery. Only a server-to-server status check can set notice sent_at.
create function private.innova_record_email_delivery(p_id uuid,p_provider text,p_delivered boolean,p_failed boolean) returns boolean language plpgsql security definer set search_path='' as $$
begin
 update private.innova_email_jobs set checked_at=now(),state=case when p_delivered then 'sent' when p_failed then 'review' else state end,
 delivered_at=case when p_delivered then now() else delivered_at end where id=p_id and provider_id=p_provider and state='accepted';
 if not found then return false; end if;
 if p_delivered then
  update private.innova_contact_notices n set sent_at=now() where n.sent_at is null and exists(select 1 from private.innova_email_sources s where s.notice_id=n.id and s.job_id=p_id and not s.suppressed) and private.innova_email_source_valid(n.id);
  update private.innova_experience_notices x set state='sent' where private.innova_experience_notice_valid(x.id) and exists(
   select 1 from private.innova_contact_notices n join private.innova_email_sources s on s.notice_id=n.id
   where s.job_id=p_id and n.sent_at is not null and n.kind='experience' and n.details->>'experienceNoticeId'=x.id::text);
  update private.innova_publication_notices x set sent_at=now() where x.sent_at is null and exists(
   select 1 from private.innova_contact_notices n join private.innova_email_sources s on s.notice_id=n.id
   where s.job_id=p_id and n.sent_at is not null and n.kind='publication' and n.details->>'revision'=x.revision::text);
 end if;
 return true;
end $$;
revoke all on function private.innova_email_source_valid(uuid),private.innova_claim_email(text,text),private.innova_finish_email(uuid,uuid,text,boolean),private.innova_record_email_delivery(uuid,text,boolean,boolean) from public,anon,authenticated;
grant execute on function private.innova_email_source_valid(uuid),private.innova_claim_email(text,text),private.innova_finish_email(uuid,uuid,text,boolean),private.innova_record_email_delivery(uuid,text,boolean,boolean) to innova_mvp_runtime,service_role;
revoke all on function private.innova_experience_notice_valid(uuid),private.innova_prepare_experience_emails(),private.innova_prepare_publication_emails() from public,anon,authenticated;
grant execute on function private.innova_experience_notice_valid(uuid),private.innova_prepare_experience_emails(),private.innova_prepare_publication_emails() to innova_mvp_runtime,service_role;

create table private.innova_worker_lock(id boolean primary key default true check(id),lease uuid,lease_until timestamptz,last_started_at timestamptz);
insert into private.innova_worker_lock(id) values(true);
alter table private.innova_worker_lock enable row level security;
revoke all on private.innova_worker_lock from public,anon,authenticated;
grant all on private.innova_worker_lock to service_role;
create function private.innova_claim_worker() returns uuid language plpgsql security definer set search_path='' as $$
declare token uuid:=gen_random_uuid();begin
 update private.innova_worker_lock set lease=token,lease_until=now()+interval '5 minutes',last_started_at=now()
 where id and (lease_until is null or lease_until<now()) and (last_started_at is null or last_started_at<=now()-interval '55 seconds');
 if found then return token; end if;return null;
end $$;
create function private.innova_finish_worker(p_lease uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin update private.innova_worker_lock set lease=null,lease_until=null where id and lease=p_lease;return found;end $$;
revoke all on function private.innova_claim_worker(),private.innova_finish_worker(uuid) from public,anon,authenticated;
grant execute on function private.innova_claim_worker(),private.innova_finish_worker(uuid) to innova_mvp_runtime,service_role;

create function private.innova_email_status() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('dailyReserved',d,'dailyLimit',100,'monthlyReserved',m,'monthlyLimit',3000,
 'quotaLevel',case when d>=100 or m>=3000 then 100 when d>=90 or m>=2700 then 90 when d>=80 or m>=2400 then 80 else 0 end,
 'pending',p,'review',r,'acceptedAwaitingDelivery',a)
 from (select count(*) filter(where first_attempt_at>now()-interval '24 hours') d,
 count(*) filter(where first_attempt_at>now()-interval '31 days') m,
 count(*) filter(where state='pending') p,count(*) filter(where state='review') r,count(*) filter(where state='accepted') a
 from private.innova_email_jobs) counts;
$$;
revoke all on function private.innova_email_status() from public,anon,authenticated;
grant execute on function private.innova_email_status() to innova_mvp_runtime,service_role;
commit;
