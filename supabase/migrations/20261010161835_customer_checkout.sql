begin;
create table private.innova_orders (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null, kind text not null check(kind in ('plan','credits')), product text not null,
 billing text not null check(billing in ('monthly','annual')), mode text not null check(mode in ('test','manual')),
 state text not null default 'requested' check(state in ('requested','awaiting_payment','payment_review','fulfilled','cancelled','test_succeeded','test_failed')),
 net_cents integer not null check(net_cents>=0), tax_cents integer not null check(tax_cents>=0), credits integer not null default 0 check(credits>=0),
 instructions text not null default '' check(length(instructions)<=4000), customer_note text not null default '' check(length(customer_note)<=500),
 fulfillment_reference text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(owner_id,request_id), check(mode<>'test' or state not in ('awaiting_payment','payment_review','fulfilled')),
 check((kind='plan' and product in ('PRO','BUSINESS')) or (kind='credits' and product in ('small','medium','large')))
);
create index innova_orders_owner_created on private.innova_orders(owner_id,created_at desc);
create unique index innova_orders_fulfillment_once on private.innova_orders(fulfillment_reference) where state='fulfilled';
alter table private.innova_orders enable row level security;
revoke all on private.innova_orders from public,anon,authenticated;
grant select,insert,update on private.innova_orders to innova_mvp_runtime;
create policy runtime_orders on private.innova_orders to innova_mvp_runtime using(true) with check(true);
commit;
