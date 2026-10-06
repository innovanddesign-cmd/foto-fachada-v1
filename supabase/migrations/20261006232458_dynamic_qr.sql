begin;
create table public.escaparates_qr (
 slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
 owner_id uuid not null references auth.users(id),
 source_campaign_id uuid not null,
 target_campaign_id uuid references public.escaparates_campaigns(id) on delete set null,
 version integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.escaparates_qr enable row level security;
revoke all on public.escaparates_qr from anon, authenticated;
grant select(slug,target_campaign_id,version) on public.escaparates_qr to anon;
grant select,insert on public.escaparates_qr to authenticated;
grant update(target_campaign_id) on public.escaparates_qr to authenticated;
create policy qr_public_resolve on public.escaparates_qr for select to anon using(true);
create policy qr_owner_read on public.escaparates_qr for select to authenticated using(owner_id=(select auth.uid()));
create policy qr_owner_insert on public.escaparates_qr for insert to authenticated with check(
 owner_id=(select auth.uid()) and version=1 and target_campaign_id=source_campaign_id and exists(
 select 1 from public.escaparates_published p where p.campaign_id=source_campaign_id and p.owner_id=(select auth.uid()) and p.slug=escaparates_qr.slug));
create policy qr_owner_update on public.escaparates_qr for update to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(
 select 1 from public.escaparates_published p where p.campaign_id=target_campaign_id and p.owner_id=(select auth.uid())));
create function public.escaparates_qr_version() returns trigger language plpgsql set search_path='' as $$
begin
 if new.target_campaign_id is distinct from old.target_campaign_id then new.version=old.version+1; new.updated_at=now(); end if;
 return new;
end $$;
create trigger qr_version before update on public.escaparates_qr for each row execute function public.escaparates_qr_version();
create function public.escaparates_publish_qr() returns trigger language plpgsql set search_path='' as $$
begin
 insert into public.escaparates_qr(slug,owner_id,source_campaign_id,target_campaign_id)
 values(new.slug,new.owner_id,new.campaign_id,new.campaign_id) on conflict(slug) do nothing;
 if not exists(select 1 from public.escaparates_qr q where q.slug=new.slug and q.owner_id=new.owner_id and q.source_campaign_id=new.campaign_id) then
 raise exception 'Esta dirección está reservada por un QR existente.';
 end if;
 return new;
end $$;
insert into public.escaparates_qr(slug,owner_id,source_campaign_id,target_campaign_id)
 select slug,owner_id,campaign_id,campaign_id from public.escaparates_published;
create trigger publication_qr after insert or update of slug on public.escaparates_published for each row execute function public.escaparates_publish_qr();
grant select(campaign_id) on public.escaparates_published to anon;
create table public.escaparates_qr_scans (
 id uuid primary key default gen_random_uuid(),
 qr_slug text not null references public.escaparates_qr(slug),
 target_slug text not null,
 version integer not null,
 scanned_at timestamptz not null default now()
);
create index qr_scans_history on public.escaparates_qr_scans(qr_slug,scanned_at desc);
alter table public.escaparates_qr_scans enable row level security;
revoke all on public.escaparates_qr_scans from anon,authenticated;
grant insert(qr_slug,target_slug,version) on public.escaparates_qr_scans to anon;
grant select on public.escaparates_qr_scans to authenticated;
create policy qr_scan_insert on public.escaparates_qr_scans for insert to anon with check(exists(
 select 1 from public.escaparates_qr q join public.escaparates_published p on p.campaign_id=q.target_campaign_id
 where q.slug=qr_slug and q.version=escaparates_qr_scans.version and p.slug=target_slug));
create policy qr_scan_owner on public.escaparates_qr_scans for select to authenticated using(exists(
 select 1 from public.escaparates_qr q where q.slug=qr_slug and q.owner_id=(select auth.uid())));
revoke execute on function public.escaparates_qr_version() from public,anon,authenticated;
revoke execute on function public.escaparates_publish_qr() from public,anon,authenticated;
commit;
