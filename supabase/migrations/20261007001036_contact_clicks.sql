begin;
create table public.escaparates_contact_clicks (
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null,
 landing_slug text not null,
 action text not null check(action in ('whatsapp','phone','email','maps','link','instagram')),
 clicked_at timestamptz not null default now()
);
create index contact_clicks_campaign_time on public.escaparates_contact_clicks(campaign_id,clicked_at desc);
alter table public.escaparates_contact_clicks enable row level security;
revoke all on public.escaparates_contact_clicks from anon,authenticated;
grant insert(campaign_id,landing_slug,action) on public.escaparates_contact_clicks to anon;
grant select on public.escaparates_contact_clicks to authenticated;
create policy contact_click_valid_publication on public.escaparates_contact_clicks for insert to anon with check(exists(
 select 1 from public.escaparates_published p where p.campaign_id=escaparates_contact_clicks.campaign_id and p.slug=landing_slug));
-- Immutable QR ownership retains access to history after unpublishing or renaming a page.
create policy contact_click_owner_read on public.escaparates_contact_clicks for select to authenticated using(exists(
 select 1 from public.escaparates_qr q where q.source_campaign_id=campaign_id and q.owner_id=(select auth.uid())));
commit;
