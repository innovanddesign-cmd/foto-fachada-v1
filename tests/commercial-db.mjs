import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import vm from 'node:vm';
const db=new PGlite();
try {
await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema innova; create table innova.organizations(id uuid primary key); create table innova.organization_memberships(organization_id uuid,user_email text,role text,active boolean);
 create schema auth; create table auth.users(id uuid primary key,email text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role; grant execute on function auth.uid() to public;
 create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
 grant usage on schema public to anon,authenticated,service_role;`);
await db.exec(fs.readFileSync('supabase/escaparates-setup.sql','utf8'));
for(const name of fs.readdirSync('supabase/migrations').filter(n=>n.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
// Execute the route's actual readiness query against SQL, including partial upgrades.
async function healthStatus(){
 const exports={};
 const sql=async(parts,...values)=>{
  let query=parts[0];values.forEach((_,i)=>{query+='$'+(i+1)+parts[i+1]});
  return (await db.query(query,values)).rows;
 };
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/health/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
  {exports,require:n=>n==='next/server'?{NextResponse:Response}:{commercialDB:()=>sql},process:{env:{NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'test'}},Date,console});
 return (await exports.GET()).status;
}
await db.exec('set role innova_mvp_runtime');assert.equal(await healthStatus(),200);await db.exec('reset role');
await db.exec('alter function private.innova_reserve_v2(uuid,uuid,text,integer,uuid,boolean) rename to reserve_v2_missing');
assert.equal(await healthStatus(),503,'legacy reservation alone cannot report the upgraded MVP ready');
await db.exec('alter function private.reserve_v2_missing(uuid,uuid,text,integer,uuid,boolean) rename to innova_reserve_v2');
await db.exec('alter table public.escaparates_ai_attempts rename column estimated_usd_micros to missing_cost_column');
assert.equal(await healthStatus(),503,'missing provider telemetry upgrade is not ready');
await db.exec('alter table public.escaparates_ai_attempts rename column missing_cost_column to estimated_usd_micros');
await db.exec('alter table public.escaparates_published disable trigger innova_preserve_publication_order');
assert.equal(await healthStatus(),503,'unprotected publication order is not ready');
await db.exec('alter table public.escaparates_published enable trigger innova_preserve_publication_order');
const u='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
await db.query('insert into auth.users(id) values($1),($2)',[u,other]);
await db.query(`insert into private.innova_accounts(owner_id,plan,billing,anchor,paid_until,monthly_credits,operation_cost)
 values($1,'PRO','annual',now()-interval '2 months',now()+interval '10 months',1000,200)`,[u]);
const summary=async()=> (await db.query('select private.innova_account_summary($1) as a',[u])).rows[0].a;
assert.equal((await summary()).balance,400);assert.equal((await summary()).balance,400,'monthly accrual idempotent');
const op='10000000-0000-4000-8000-000000000001';
const reserve=async(id,owner=u)=> (await db.query("select private.innova_reserve($1,$2,'free_image',20) as s",[owner,id])).rows[0].s;
assert.equal(await reserve(op),'reserved');assert.equal(await reserve(op),'duplicate');assert.equal((await summary()).balance,380);
assert.equal((await db.query('select private.innova_finish($1,$2,false) as done',[other,op])).rows[0].done,false,'cross-account refund denied');
await db.query('select private.innova_finish($1,$2,false)',[u,op]);assert.equal((await summary()).balance,400);
await db.query('select private.innova_finish($1,$2,false)',[u,op]);assert.equal((await summary()).balance,400,'refund exactly once');
const success='10000000-0000-4000-8000-000000000002';await reserve(success);await db.query('select private.innova_finish($1,$2,true)',[u,success]);await db.query('select private.innova_finish($1,$2,false)',[u,success]);assert.equal((await summary()).balance,380,'successful consumption immutable');
assert.equal(await reserve('10000000-0000-4000-8000-000000000003',other),'unavailable','Free has no paid regenerations');
for(let i=0;i<6;i++)await db.query(`insert into public.escaparates_campaigns(id,owner_id,name,slug) values($1,$2,'test',$3)`,[`20000000-0000-4000-8000-00000000000${i}`,u,'test-'+i]);
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${u}',false);`);
for(let i=0;i<5;i++)await db.query(`insert into public.escaparates_published(campaign_id,owner_id,slug,payload,plan) values($1,$2,$3,'{"datosEscaparate":{}}','ESCAPARATE')`,[`20000000-0000-4000-8000-00000000000${i}`,u,'test-'+i]);
assert.equal((await db.query("select plan from public.escaparates_published limit 1")).rows[0].plan,'PRO','client cannot self-upgrade');
await assert.rejects(db.query(`insert into public.escaparates_published(campaign_id,owner_id,slug,plan) values('20000000-0000-4000-8000-000000000005',$1,'test-5','PRO')`,[u]),/límite/);
await assert.rejects(db.query('update private.innova_accounts set balance=100000'),/permission denied/);
await db.exec('reset role;');
await db.query("update private.innova_accounts set paid_until=now()-interval '1 second',cancel_at_end=true where owner_id=$1",[u]);
await db.exec("set role anon; select set_config('request.jwt.claim.sub','',false);");
assert.equal((await db.query('select slug from public.escaparates_published')).rows.length,1,'expired account exposes only Free entitlement');
const publicPage=(await db.query("select public.innova_public_page('test-0') as p")).rows[0].p;
assert.equal(publicPage.plan,'FREE');assert.equal((await db.query("select public.innova_public_page('test-4') as p")).rows[0].p,null);
assert.equal((await db.query("select public.innova_resolve_qr('test-4',false) as q")).rows[0].q.slug,'test-0','printed QR falls back to active Free page');
await assert.rejects(db.query('select * from private.innova_ledger'),/permission denied/);
await db.exec('reset role;');
assert.equal((await db.query('select count(*)::int as c from public.escaparates_campaigns')).rows[0].c,6,'downgrade preserves content');
// Existing visible Free publication can still be updated with excess retained pages.
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${u}',false);`);
await db.query("update public.escaparates_published set payload=payload where slug='test-0'");
const publishedBefore=(await db.query("select published_at from public.escaparates_published where slug='test-0'")).rows[0].published_at;
// The client republishes with a fresh timestamp; this must not rotate the Free slot.
await db.query("update public.escaparates_published set published_at=now()+interval '1 day',payload=payload where slug='test-0'");
assert.equal((await db.query("select published_at from public.escaparates_published where slug='test-0'")).rows[0].published_at.getTime(),publishedBefore.getTime(),'republishing preserves first publication order');
assert.equal((await db.query("select public.innova_public_page('test-0') as p")).rows[0].p.plan,'FREE','edited Free campaign remains visible');
assert.equal((await db.query("select public.innova_resolve_qr('test-4',false) as q")).rows[0].q.slug,'test-0','republishing preserves printed QR fallback');
await assert.rejects(db.query("update public.escaparates_published set payload=payload where slug='test-4'"),/límite/);
await db.exec('reset role;');
await db.query("update private.innova_accounts set plan='BUSINESS',paid_until=now()+interval '1 year',operation_cost=100 where owner_id=$1",[u]);
for(let i=6;i<11;i++) await db.query(`insert into public.escaparates_campaigns(id,owner_id,name,slug) values($1,$2,'Business test',$3)`,[`30000000-0000-4000-8000-${String(i).padStart(12,'0')}`,u,'business-'+i]);
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${u}',false);`);
for(let i=6;i<11;i++) await db.query(`insert into public.escaparates_published(campaign_id,owner_id,slug,plan) values($1,$2,$3,'FREE')`,[`30000000-0000-4000-8000-${String(i).padStart(12,'0')}`,u,'business-'+i]);
await assert.rejects(db.query(`insert into public.escaparates_published(campaign_id,owner_id,slug,plan) values('20000000-0000-4000-8000-000000000005',$1,'test-5','FREE')`,[u]),/límite/);
await db.exec('reset role;');
assert.equal((await summary()).active,10);
assert.equal((await db.query("select private.innova_reserve($1,'40000000-0000-4000-8000-000000000001','free_image',200) as s",[u])).rows[0].s,'price_changed');
await db.query('update private.innova_accounts set balance=10,included_balance=0 where owner_id=$1',[u]);
assert.equal(await reserve('40000000-0000-4000-8000-000000000002'),'quota','insufficient credits rejected');
await db.exec('set role innova_mvp_runtime;');
assert.equal((await summary()).balance,10,'dedicated runtime can read its commercial accounts');
assert.equal(await reserve('50000000-0000-4000-8000-000000000001'),'quota');
await assert.rejects(db.query('select * from auth.users'),/permission denied/);
await assert.rejects(db.query('delete from private.innova_ledger'),/permission denied/);
await assert.rejects(db.query('update public.escaparates_published set payload=payload'),/permission denied/);
await db.exec('reset role;');
// Legacy initial generation is blocked until the approved trial entitlement is integrated.
const first='60000000-0000-4000-8000-000000000001',campaign='70000000-0000-4000-8000-000000000001';
const initial=async(id,c=campaign)=>(await db.query("select private.innova_reserve_v2($1,$2,'analysis',0,$3,true) as s",[other,id,c])).rows[0].s;
assert.equal(await initial(first),'unavailable');
assert.equal(await initial('60000000-0000-4000-8000-000000000002'),'unavailable');
await db.query('select private.innova_finish($1,$2,false)',[other,first]);
const retry='60000000-0000-4000-8000-000000000003';assert.equal(await initial(retry),'unavailable');
await db.query('select private.innova_finish($1,$2,true)',[other,retry]);
assert.equal(await initial('60000000-0000-4000-8000-000000000004','70000000-0000-4000-8000-000000000002'),'unavailable');
assert.equal((await db.query('select balance from private.innova_accounts where owner_id=$1',[other])).rows[0].balance,0);
// Grace does not grant additional credits or spending rights.
await db.query("update private.innova_accounts set anchor=now()-interval '1 month',credited_period=0,paid_until=now()-interval '1 second',grace_until=now()+interval '1 month',cancel_at_end=false,balance=1000 where owner_id=$1",[u]);
assert.equal((await summary()).balance,1000); // No grant at a boundary after paid access ends.
assert.equal((await summary()).canTopUp,false);
await assert.rejects(db.query("select private.innova_topup($1,'small','test-topup',$1)",[u]),/TOPUPS_DISABLED/);
assert.equal(await reserve('80000000-0000-4000-8000-000000000001'),'unavailable');
await db.query("update private.innova_accounts set grace_until=paid_until where owner_id=$1",[u]);
assert.equal((await summary()).balanceFrozen,true);assert.equal(await reserve('80000000-0000-4000-8000-000000000002'),'unavailable');
await db.query("update private.innova_accounts set paid_until=now()+interval '1 month',grace_until=null where owner_id=$1",[u]);
const beforeTopup=(await summary()).balance;
await assert.rejects(db.query("select private.innova_topup($1,'small','test-topup',$1)",[u]),/TOPUPS_DISABLED/);assert.equal((await summary()).balance,beforeTopup);
await assert.rejects(db.query("select private.innova_topup($1,'small','test-topup',$1)",[u]),/TOPUPS_DISABLED/);
await db.exec('update private.innova_ai_budget set limit_micros=committed_micros');
assert.equal((await db.query("select private.innova_reserve_v2($1,'80000000-0000-4000-8000-000000000003','metrics_analysis',20,null,false) as s",[u])).rows[0].s,'budget');
// Document isolation, optimistic concurrency, explicit consent, immutable signing and atomic mail queue.
const org='90000000-0000-4000-8000-000000000001';
await db.query('insert into innova.organizations(id) values($1)',[org]);
await db.query("insert into innova.organization_memberships values($1,'test@example.test','admin',true)",[org]);
const action=async(a,b,actor='test@example.test')=>(await db.query('select innova.document_action($1,$2,$3,$4::jsonb) as d',[org,actor,a,JSON.stringify(b)])).rows[0].d;
await assert.rejects(action('create',{title:'Test',category:'legal',content:'Solo una prueba'},'other@example.test'),/ACCESS_DENIED/);
let doc=await action('create',{title:'Test',category:'legal',content:'Solo una prueba'});
const incomplete=await action('create',{title:'Incomplete',category:'legal',content:'Cliente {{CLIENTE_NOMBRE}}'});
await assert.rejects(action('review',{id:incomplete.id,revision:incomplete.revision}),/FIELDS_INCOMPLETE/);
const template=await action('create',{title:'Template',category:'legal',entityType:'plantilla',content:'Texto completo'});
await assert.rejects(action('review',{id:template.id,revision:template.revision}),/TEMPLATE_REQUIRES_COPY/);
await assert.rejects(action('update',{id:doc.id,revision:99,title:'No',content:'No'}),/CONFLICT/);
doc=await action('review',{id:doc.id,revision:doc.revision});
await assert.rejects(action('sign',{id:doc.id,revision:doc.revision,consent:false,signer:'Test'}),/SIGNATURE_NOT_READY/);
doc=await action('sign',{id:doc.id,revision:doc.revision,consent:true,signer:'Test ficticio',signature:'data:image/png;base64,'+'A'.repeat(200),recipients:['test@example.test','test@example.test']});
assert.equal(doc.status,'signed');assert.match(doc.signature_hash,/^[a-f0-9]{64}$/);
await assert.rejects(action('update',{id:doc.id,revision:doc.revision,title:'Changed',content:'Changed'}),/IMMUTABLE/);
assert.equal((await db.query('select count(*)::integer as n from innova.document_deliveries')).rows[0].n,1);
await db.exec('set role authenticated');await assert.rejects(db.query('select * from innova.service_documents'),/permission denied/);await db.exec('reset role');
console.log('PASS commercial and ERP SQL: 1/5/10, accrual, replay/refund, blocked legacy initial allowance, grace freeze, frozen balance, disabled topups, budget, document permissions, stale versions, consent, immutable signatures and unique mail queue.');
} finally {await db.close();}
