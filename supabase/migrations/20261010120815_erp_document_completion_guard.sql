begin;
create function innova.require_complete_document() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status in ('reviewed','signed') then
  if new.entity_type='plantilla' then raise exception 'DOCUMENT_TEMPLATE_REQUIRES_COPY'; end if;
  if new.content ~ '\{\{[A-Z0-9_]+\}\}' then raise exception 'DOCUMENT_FIELDS_INCOMPLETE'; end if;
 end if;
 return new;
end $$;
revoke all on function innova.require_complete_document() from public,anon,authenticated;
create trigger require_complete_document before insert or update on innova.service_documents for each row execute function innova.require_complete_document();
commit;
