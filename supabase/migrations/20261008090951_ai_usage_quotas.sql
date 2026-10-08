-- No existing campaigns or client plans are modified. Paid entitlements must be
-- explicitly assigned by the operator, never copied from client-editable data.
begin;
create table public.escaparates_ai_accounts (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 plan text not null default 'FREE' check (plan in ('FREE','PRO','ESCAPARATE')),
 updated_at timestamptz not null default now()
);
create table public.escaparates_ai_requests (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade,
 month date not null,
 state text not null default 'reserved' check (state in ('reserved','succeeded','failed')),
 created_at timestamptz not null default now(),
 finished_at timestamptz
);
create index escaparates_ai_requests_owner_month on public.escaparates_ai_requests(owner_id,month,state);
create index escaparates_ai_requests_owner_created on public.escaparates_ai_requests(owner_id,created_at);
create table public.escaparates_ai_attempts (
 request_id uuid not null references public.escaparates_ai_requests(id) on delete cascade,
 attempt integer not null check (attempt between 1 and 4),
 model text not null check (length(model) between 1 and 100),
 http_status integer check (http_status between 100 and 599),
 prompt_tokens bigint check(prompt_tokens>=0), output_tokens bigint check(output_tokens>=0),
 thought_tokens bigint check(thought_tokens>=0), cached_tokens bigint check(cached_tokens>=0),
 total_tokens bigint check(total_tokens>=0),
 cost_usd numeric check(cost_usd>=0),
 pricing_source text,
 created_at timestamptz not null default now(),
 primary key(request_id,attempt)
);
alter table public.escaparates_ai_accounts enable row level security;
alter table public.escaparates_ai_requests enable row level security;
alter table public.escaparates_ai_attempts enable row level security;
revoke all on public.escaparates_ai_accounts,public.escaparates_ai_requests,public.escaparates_ai_attempts from public,anon,authenticated;
grant select,insert,update,delete on public.escaparates_ai_accounts,public.escaparates_ai_requests,public.escaparates_ai_attempts to service_role;

-- Called only by the server. An advisory lock serializes reservations per owner.
create function public.escaparates_ai_reserve(p_owner uuid,p_id uuid) returns text
language plpgsql security invoker set search_path='' as $fn$
declare v_plan text; v_limit integer; v_month date; v_used integer;
begin
 if p_owner is null or p_id is null then raise exception 'Missing identity'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text,813));
 if exists(select 1 from public.escaparates_ai_requests where id=p_id) then return 'duplicate'; end if;
 v_month:=date_trunc('month',now() at time zone 'Europe/Madrid')::date;
 select plan into v_plan from public.escaparates_ai_accounts where owner_id=p_owner;
 v_limit:=case coalesce(v_plan,'FREE') when 'PRO' then 3 when 'ESCAPARATE' then 10 else 1 end;
 select count(*) into v_used from public.escaparates_ai_requests
 where owner_id=p_owner and month=v_month and state in ('reserved','succeeded');
 if v_used>=v_limit then return 'quota'; end if;
 -- Failed generations are not charged, but repeated failures cannot flood the provider.
 if (select count(*) from public.escaparates_ai_requests where owner_id=p_owner and created_at>now()-interval '1 hour')>=10 then return 'rate'; end if;
 insert into public.escaparates_ai_requests(id,owner_id,month) values(p_id,p_owner,v_month);
 return 'reserved';
end $fn$;

create function public.escaparates_ai_finish(p_owner uuid,p_id uuid,p_success boolean) returns boolean
language plpgsql security invoker set search_path='' as $fn$
begin
 update public.escaparates_ai_requests set state=case when p_success then 'succeeded' else 'failed' end,finished_at=now()
 where id=p_id and owner_id=p_owner and state='reserved';
 return found;
end $fn$;
revoke all on function public.escaparates_ai_reserve(uuid,uuid),public.escaparates_ai_finish(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.escaparates_ai_reserve(uuid,uuid),public.escaparates_ai_finish(uuid,uuid,boolean) to service_role;
commit;
