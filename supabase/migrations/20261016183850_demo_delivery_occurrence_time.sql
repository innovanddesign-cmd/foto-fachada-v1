begin;
-- Preserve ingestion time for audit; expiry uses the trusted Core receipt time.
alter table private.innova_demo_deliveries add column occurred_at timestamptz;
-- Legacy records retain their historical timing; do not invent earlier evidence.
update private.innova_demo_deliveries set occurred_at=received_at;
alter table private.innova_demo_deliveries alter column occurred_at set not null;
alter table private.innova_demo_deliveries add constraint demo_delivery_time_finite check (isfinite(occurred_at));
create or replace function private.innova_demo_action(p_action text,p_body jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare d private.innova_demos; src public.escaparates_published;
 owner uuid; demo_id uuid; delivery private.innova_demo_deliveries; paid boolean:=false; occurred timestamptz;
begin
 if p_action is null or p_action not in ('create','version','publish','delivery','expire','read','link') then raise exception 'INVALID_ACTION'; end if;
 if p_action='create' then
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_body->>'reference',914));
  select * into d from private.innova_demos where reference=p_body->>'reference';
  if found then
   if d.plan<>p_body->>'plan' or d.customer_owner_id is distinct from nullif(p_body->>'customerOwnerId','')::uuid
    or not exists(select 1 from private.innova_demo_versions v where v.demo_id=d.id and v.version=1 and v.source_campaign_id=(p_body->>'campaignId')::uuid)
    then raise exception 'DEMO_CONFLICT'; end if;
   return to_jsonb(d);
  end if;
  select * into src from public.escaparates_published where campaign_id=(p_body->>'campaignId')::uuid;
  if not found then raise exception 'PUBLISHED_SOURCE_REQUIRED'; end if;
  insert into private.innova_demos(reference,customer_owner_id,plan)
   values(p_body->>'reference',nullif(p_body->>'customerOwnerId','')::uuid,p_body->>'plan') returning * into d;
  insert into private.innova_demo_versions(demo_id,version,source_campaign_id,payload) values(d.id,1,src.campaign_id,src.payload);
  return to_jsonb(d);
 end if;
 demo_id:=(p_body->>'id')::uuid;
 select customer_owner_id into owner from private.innova_demos where id=demo_id;
 if p_action='link' then owner:=(p_body->>'customerOwnerId')::uuid; if owner is null then raise exception 'CUSTOMER_REQUIRED'; end if; end if;
 -- Same lock as paid-contract registration: payment and expiry serialize per customer.
 if owner is not null then perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(owner::text,813)); end if;
 select * into d from private.innova_demos where id=demo_id for update;
 if not found then
  if p_action='read' then return null; end if;
  raise exception 'DEMO_NOT_FOUND';
 end if;
 if p_action<>'link' and d.customer_owner_id is distinct from owner then raise exception 'CUSTOMER_CHANGED_RETRY'; end if;
 if p_action='link' then
  if d.customer_owner_id is not null and d.customer_owner_id<>owner then raise exception 'CUSTOMER_CONFLICT'; end if;
  update private.innova_demos set customer_owner_id=owner where id=d.id returning * into d;
 end if;
 select exists(select 1 from private.innova_contracts c where c.owner_id=owner and c.paid_at<=now() and c.period_start<=now() and c.period_end>now()) into paid;
 if p_action='version' then
  select * into src from public.escaparates_published where campaign_id=(p_body->>'campaignId')::uuid;
  if not found or d.version is distinct from (p_body->>'expectedVersion')::integer then raise exception 'VERSION_CONFLICT'; end if;
  update private.innova_demos set version=version+1 where id=d.id returning * into d;
  insert into private.innova_demo_versions(demo_id,version,source_campaign_id,payload) values(d.id,d.version,src.campaign_id,src.payload);
 elsif p_action='publish' then
  if d.state='expired' then raise exception 'DEMO_EXPIRED'; end if;
  update private.innova_demos set state='published' where id=d.id returning * into d;
 elsif p_action='delivery' then
  if d.state<>'published' and not exists(select 1 from private.innova_demo_deliveries e where e.event_id=p_body->>'eventId' and e.demo_id=d.id and e.evidence_ref=p_body->>'evidenceRef') then raise exception 'DEMO_NOT_PUBLISHED'; end if;
  if nullif(p_body->>'deliveredAt','') is null or (p_body->>'deliveredAt') !~ '(Z|[+-][0-9]{2}:[0-9]{2})$' then
   raise exception 'DELIVERY_TIME_REQUIRED';
  end if;
  occurred:=(p_body->>'deliveredAt')::timestamptz;
  if not pg_catalog.isfinite(occurred) or occurred>clock_timestamp() then raise exception 'INVALID_DELIVERY_TIME'; end if;
  insert into private.innova_demo_deliveries(event_id,demo_id,evidence_ref,occurred_at)
   values(p_body->>'eventId',d.id,p_body->>'evidenceRef',occurred) on conflict(event_id) do nothing;
  select * into delivery from private.innova_demo_deliveries where event_id=p_body->>'eventId';
  if delivery.demo_id<>d.id or delivery.evidence_ref<>p_body->>'evidenceRef' or delivery.occurred_at is distinct from occurred then raise exception 'DELIVERY_CONFLICT'; end if;
  update private.innova_demos set delivered_at=coalesce(delivered_at,delivery.occurred_at),expires_at=coalesce(expires_at,delivery.occurred_at+interval '48 hours') where id=d.id returning * into d;
 elsif p_action='expire' then
  if not paid and d.state='published' and d.expires_at<=now() then
   update private.innova_demos set state='expired' where id=d.id returning * into d;
  end if;
 elsif p_action not in ('read','link') then raise exception 'INVALID_ACTION';
 end if;
 return to_jsonb(d)||jsonb_build_object('purchaseProtected',paid,'effectiveState',
  case when paid and d.state<>'draft' then 'protected' when d.state='published' and d.expires_at<=now() then 'expired' else d.state end,
  'deliveries',(select coalesce(jsonb_agg(jsonb_build_object('eventId',e.event_id,'evidenceRef',e.evidence_ref,'receivedAt',e.received_at,'deliveredAt',e.occurred_at) order by e.received_at),'[]'::jsonb) from private.innova_demo_deliveries e where e.demo_id=d.id),
  'payload',(select payload from private.innova_demo_versions v where v.demo_id=d.id and v.version=d.version),
  'versions',(select jsonb_agg(jsonb_build_object('version',v.version,'createdAt',v.created_at) order by v.version) from private.innova_demo_versions v where v.demo_id=d.id));
end $$;
commit;
