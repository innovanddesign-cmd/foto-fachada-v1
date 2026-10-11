begin;
-- Visibility and printed QR fallback are ordered by the first publication.
-- Editing a live page must not rotate its slot after a downgrade. Enforce this
-- in PostgreSQL as older clients still send a fresh published_at on every upsert.
create function private.innova_preserve_publication_order() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  new.published_at:=old.published_at;
 else
  new.published_at:=now();
 end if;
 return new;
end $$;
revoke all on function private.innova_preserve_publication_order() from public,anon,authenticated;
create trigger innova_preserve_publication_order before insert or update on public.escaparates_published
 for each row execute function private.innova_preserve_publication_order();
commit;
