begin;
create table public.escaparates_campaigns (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 local_id text, name text not null, slug text,
 status text not null default 'draft' check(status in ('draft','active','paused')),
 snapshot jsonb not null default '{}',
 plan text not null default 'FREE' check(plan in ('FREE','PRO','ESCAPARATE')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(owner_id,local_id), unique(id,owner_id)
);
alter table public.escaparates_campaigns enable row level security;
create policy escaparates_campaign_owner on public.escaparates_campaigns for all to authenticated
 using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
revoke all on public.escaparates_campaigns from anon,authenticated;
grant select,insert,update,delete on public.escaparates_campaigns to authenticated;
create table public.escaparates_published (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null unique, owner_id uuid not null,
 slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{1,100}$'),
 payload jsonb not null default '{}',
 plan text not null check(plan in ('FREE','PRO','ESCAPARATE')),
 published_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 foreign key(campaign_id,owner_id) references public.escaparates_campaigns(id,owner_id) on delete cascade
);
create index escaparates_published_owner on public.escaparates_published(owner_id);
alter table public.escaparates_published enable row level security;
create policy escaparates_published_read on public.escaparates_published for select to anon,authenticated using(true);
create policy escaparates_published_insert on public.escaparates_published for insert to authenticated with check((select auth.uid())=owner_id);
create policy escaparates_published_update on public.escaparates_published for update to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy escaparates_published_delete on public.escaparates_published for delete to authenticated using((select auth.uid())=owner_id);
revoke all on public.escaparates_published from anon,authenticated;
grant select(slug,payload,plan,published_at,updated_at) on public.escaparates_published to anon;
grant select,insert,update,delete on public.escaparates_published to authenticated;
create function public.escaparates_set_updated_at() returns trigger language plpgsql set search_path='' as $fn$
begin new.updated_at=now(); return new; end $fn$;
create trigger escaparates_campaign_timestamp before update on public.escaparates_campaigns for each row execute function public.escaparates_set_updated_at();
create trigger escaparates_published_timestamp before update on public.escaparates_published for each row execute function public.escaparates_set_updated_at();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('escaparates-assets','escaparates-assets',false,10485760,array['image/jpeg','image/png','image/webp','image/gif']),
 ('escaparates-public','escaparates-public',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']);
create policy escaparates_storage_owner on storage.objects for all to authenticated
 using(bucket_id in ('escaparates-assets','escaparates-public') and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id in ('escaparates-assets','escaparates-public') and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.escaparates_campaigns c where c.id::text=(storage.foldername(name))[2] and c.owner_id=(select auth.uid())));
commit;
