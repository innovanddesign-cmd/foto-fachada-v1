begin;
create schema if not exists innova;
create table innova.service_documents (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references innova.organizations(id),
 title text not null check(length(title) between 1 and 200), category text not null check(category in ('servicios','clientes','colaboradores','proyectos','facturacion','legal','organizacion')),
 service_code text not null default '' check(length(service_code)<=80), entity_type text not null default '' check(length(entity_type)<=40), entity_id text not null default '' check(length(entity_id)<=100),
 content text not null check(length(content)<=100000), revision integer not null default 1,
 status text not null default 'draft' check(status in ('draft','reviewed','signed')), reviewed_by text,
 created_by text not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 signed_snapshot jsonb, signature_hash text,
 check((status='signed')=(signed_snapshot is not null))
);
create table innova.document_versions (
 id uuid primary key default gen_random_uuid(),document_id uuid not null references innova.service_documents(id),revision integer not null,
 snapshot jsonb not null,actor text not null,created_at timestamptz not null default now(),unique(document_id,revision)
);
create table innova.document_deliveries (
 id uuid primary key default gen_random_uuid(),document_id uuid not null references innova.service_documents(id),recipient text not null,
 state text not null default 'pending' check(state in ('pending','sending','accepted','failed')),attempted_at timestamptz,created_at timestamptz not null default now(),unique(document_id,recipient)
);
alter table innova.service_documents enable row level security;
alter table innova.document_versions enable row level security;
alter table innova.document_deliveries enable row level security;
revoke all on innova.service_documents,innova.document_versions,innova.document_deliveries from public,anon,authenticated;
grant select,insert,update on innova.service_documents,innova.document_deliveries to service_role;
grant select,insert on innova.document_versions to service_role;
create function innova.protect_signed_document() returns trigger language plpgsql set search_path='' as $$
begin
 if old.status='signed' then raise exception 'SIGNED_DOCUMENT_IMMUTABLE'; end if;
 return new;
end $$;
revoke all on function innova.protect_signed_document() from public,anon,authenticated;
create trigger protect_signed_document before update or delete on innova.service_documents for each row execute function innova.protect_signed_document();
create index service_documents_organization on innova.service_documents(organization_id,service_code,category);

create function innova.document_action(p_org uuid,p_actor text,p_action text,p_body jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare d innova.service_documents; snapshot jsonb; recipients jsonb; recipient text; doc_id uuid;
begin
 if not exists(select 1 from innova.organization_memberships where organization_id=p_org and user_email=lower(p_actor) and active and role in ('admin','director')) then raise exception 'DOCUMENT_ACCESS_DENIED'; end if;
 if p_action='create' then
  insert into innova.service_documents(organization_id,title,category,service_code,entity_type,entity_id,content,created_by)
  values(p_org,p_body->>'title',p_body->>'category',coalesce(p_body->>'serviceCode',''),coalesce(p_body->>'entityType',''),coalesce(p_body->>'entityId',''),coalesce(p_body->>'content',''),p_actor) returning * into d;
 else
  doc_id:=(p_body->>'id')::uuid;
  select * into d from innova.service_documents where id=doc_id and organization_id=p_org for update;
  if not found then raise exception 'DOCUMENT_NOT_FOUND'; end if;
  if d.status='signed' then raise exception 'SIGNED_DOCUMENT_IMMUTABLE'; end if;
  if d.revision<>(p_body->>'revision')::integer or p_body->>'revision' is null then raise exception 'DOCUMENT_CONFLICT'; end if;
  if p_action='update' then
   update innova.service_documents set title=p_body->>'title',content=p_body->>'content',status='draft',reviewed_by=null,revision=revision+1,updated_at=now() where id=d.id returning * into d;
  elsif p_action='review' then
   if length(trim(d.content))=0 then raise exception 'DOCUMENT_EMPTY'; end if;
   update innova.service_documents set status='reviewed',reviewed_by=p_actor,revision=revision+1,updated_at=now() where id=d.id returning * into d;
  elsif p_action='sign' then
   if d.status<>'reviewed' or (p_body->>'consent') is distinct from 'true' or length(trim(coalesce(p_body->>'signer','')))<2 or length(p_body->>'signer')>200 then raise exception 'SIGNATURE_NOT_READY'; end if;
   if coalesce(p_body->>'signature','') !~ '^data:image/png;base64,[A-Za-z0-9+/=]+$' or length(p_body->>'signature') not between 150 and 300000 then raise exception 'INVALID_SIGNATURE'; end if;
   recipients:=coalesce(p_body->'recipients','[]'::jsonb);
   if jsonb_typeof(recipients)<>'array' or jsonb_array_length(recipients)>10 then raise exception 'INVALID_RECIPIENTS'; end if;
   snapshot:=jsonb_build_object('documentId',d.id,'organizationId',p_org,'title',d.title,'content',d.content,'revision',d.revision,'signer',p_body->>'signer','signature',p_body->>'signature','consent','He leído y acepto el documento mostrado y autorizo el envío de copias a los correos indicados.','signedAt',now(),'recordedBy',p_actor,'reviewedBy',d.reviewed_by,'recipients',recipients);
   update innova.service_documents set status='signed',signed_snapshot=snapshot,signature_hash=encode(sha256(convert_to(snapshot::text,'UTF8')),'hex'),revision=revision+1,updated_at=now() where id=d.id returning * into d;
   for recipient in select jsonb_array_elements_text(recipients) loop
    if length(recipient)>254 or recipient !~ '^[A-Za-z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' then raise exception 'INVALID_RECIPIENT'; end if;
    insert into innova.document_deliveries(document_id,recipient) values(d.id,lower(recipient)) on conflict do nothing;
   end loop;
  else raise exception 'UNKNOWN_DOCUMENT_ACTION';
  end if;
 end if;
 insert into innova.document_versions(document_id,revision,snapshot,actor) values(d.id,d.revision,to_jsonb(d),p_actor);
 return to_jsonb(d);
end $$;
revoke all on function innova.document_action(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function innova.document_action(uuid,text,text,jsonb) to service_role;
commit;
