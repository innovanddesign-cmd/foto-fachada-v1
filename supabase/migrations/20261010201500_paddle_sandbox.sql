begin;
create table private.innova_paddle_sessions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, nonce uuid not null default gen_random_uuid(), environment text not null default 'sandbox' check(environment='sandbox'),
 kind text not null check(kind in ('plan','credits')), product text not null, billing text not null check(billing in ('annual','monthly')),
 price_id text not null, net_cents integer not null check(net_cents>0), transaction_id text unique, subscription_id text,
 state text not null default 'creating' check(state in ('creating','ready','completed','cancelled','review')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,request_id)
);
create index innova_paddle_sessions_owner on private.innova_paddle_sessions(owner_id,created_at desc);
create table private.innova_paddle_events (
 event_id text primary key, event_type text not null, session_id uuid not null references private.innova_paddle_sessions(id),
 occurred_at timestamptz not null, received_at timestamptz not null default now()
);
alter table private.innova_paddle_sessions enable row level security;
alter table private.innova_paddle_events enable row level security;
revoke all on private.innova_paddle_sessions,private.innova_paddle_events from public,anon,authenticated;
grant select,insert,update on private.innova_paddle_sessions,private.innova_paddle_events to innova_mvp_runtime;
create policy runtime_paddle_sessions on private.innova_paddle_sessions to innova_mvp_runtime using(true) with check(true);
create policy runtime_paddle_events on private.innova_paddle_events to innova_mvp_runtime using(true) with check(true);
commit;
