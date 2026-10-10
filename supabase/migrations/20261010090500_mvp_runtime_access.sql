begin;
-- Dedicated application identity. Password is provisioned separately, never committed.
create role innova_mvp_runtime nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
grant usage on schema public,private to innova_mvp_runtime;
grant select,insert,update on private.innova_accounts,private.innova_credit_operations,public.escaparates_ai_requests to innova_mvp_runtime;
grant select,insert on private.innova_ledger,private.innova_contracts,public.escaparates_ai_attempts to innova_mvp_runtime;
grant select on public.escaparates_published,public.escaparates_ai_accounts to innova_mvp_runtime;
create policy mvp_runtime_accounts on private.innova_accounts to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_operations on private.innova_credit_operations to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_ledger on private.innova_ledger to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_contracts on private.innova_contracts to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_requests on public.escaparates_ai_requests to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_attempts on public.escaparates_ai_attempts to innova_mvp_runtime using(true) with check(true);
create policy mvp_runtime_legacy_accounts on public.escaparates_ai_accounts for select to innova_mvp_runtime using(true);
create policy mvp_runtime_publications on public.escaparates_published for select to innova_mvp_runtime using(true);
grant execute on function private.innova_plan(uuid),private.innova_limit(uuid),private.innova_accrue(uuid),private.innova_reserve(uuid,uuid,text,integer),private.innova_finish(uuid,uuid,boolean),private.innova_account_summary(uuid),private.innova_visible(uuid) to innova_mvp_runtime;
commit;
