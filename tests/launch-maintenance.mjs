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
const u='00000000-0000-4000-8000-000000000001',v='00000000-0000-4000-8000-000000000002';
await db.query('insert into auth.users(id) values($1),($2)',[u,v]);
const quote=async(owner,plan='PRO',billing='annual')=>(await db.query('select private.innova_plan_quote($1,$2,$3) q',[owner,plan,billing])).rows[0].q;
const contract=async(owner,ref,net=10000,start="now()",end="now()+interval '1 year'",plan='PRO',billing='annual')=>db.query(`insert into private.innova_contracts(owner_id,reference,plan,billing,net_cents,tax_cents,payment_method,paid_at,period_start,period_end,accepted_document_ref,recorded_by) values($1,$2,$4,$5,$3,round($3::integer*.21),'transfer',now(),${start},${end},'accepted-document',$1)`,[owner,ref,net,plan,billing]);
assert.equal((await quote(u)).netCents,10000);
assert.equal((await quote(u,'BASIC')).netCents,6000);
await assert.rejects(contract(u,'wrong-price',1),/PRICE_NOT_APPROVED/);
await contract(u,'paid-first');
await assert.rejects(contract(u,'overpriced-renewal',20000),/RENEWAL_MUST_KEEP_LAUNCH_PRICE/);
assert.equal((await db.query('select count(*)::int n from private.innova_launch_slots')).rows[0].n,1);
await assert.rejects(contract(u,'paid-first'),/LAUNCH_CONTINUITY_LOST|duplicate/);
// Exact adjoining period can be prepaid, without consuming another slot.
await contract(u,'paid-renewal',10000,"(select continuous_until from private.innova_launch_slots where owner_id=$1)","(select continuous_until+interval '1 year' from private.innova_launch_slots where owner_id=$1)");
assert.equal((await db.query('select count(*)::int n from private.innova_launch_slots')).rows[0].n,1);
await assert.rejects(contract(u,'gap',10000,"(select continuous_until+interval '1 day' from private.innova_launch_slots where owner_id=$1)","(select continuous_until+interval '1 year' from private.innova_launch_slots where owner_id=$1)"),/LAUNCH_CONTINUITY_LOST/);
await contract(u,'basic-change',600,"now()","now()+interval '1 month'",'BASIC','monthly');
assert.equal((await quote(u)).netCents,20000);
for(let i=2;i<=100;i++){
 const owner=`10000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
 await db.query('insert into auth.users(id) values($1)',[owner]);await contract(owner,'paid-'+i);
}
assert.equal((await quote(v)).launch,false);
await assert.rejects(contract(v,'customer-101'),/LAUNCH_FULL/);
await contract(v,'normal-price',20000);
assert.equal((await db.query('select count(*)::int n from private.innova_launch_slots')).rows[0].n,100);
await db.exec('set role authenticated');await assert.rejects(db.query('select * from private.innova_launch_slots'),/permission denied/);await db.exec('reset role');

const campaign='20000000-0000-4000-8000-000000000001';
await db.query("insert into public.escaparates_campaigns(id,owner_id,name) values($1,$2,'Delete me')",[campaign,u]);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[u]);
await db.query('select public.innova_delete_campaign($1,false)',[campaign]);
await assert.rejects(db.query("insert into public.escaparates_campaigns(id,owner_id,name) values($1,$2,'Resurrect')",[campaign,u]),/DELETED_CAMPAIGN_ID/);
const claim=async()=>(await db.query('select private.innova_claim_storage_cleanup() j')).rows[0].j;
await db.exec('set role innova_mvp_runtime');
const j=await claim(),j2=await claim();assert.notEqual(j.id,j2.id);assert.equal(await claim(),null,'leased jobs cannot be claimed twice');
assert.equal((await db.query('select private.innova_finish_storage_cleanup($1,$2,true) ok',[j.id,j2.lease])).rows[0].ok,false,'wrong lease cannot acknowledge');
await db.query('select private.innova_finish_storage_cleanup($1,$2,false)',[j.id,j.lease]);assert.equal(await claim(),null,'failure backs off');
await db.query('select private.innova_finish_storage_cleanup($1,$2,true)',[j2.id,j2.lease]);
await db.exec('reset role');
await db.query("update private.innova_storage_cleanup set available_at=now()-interval '1 second' where id=$1",[j.id]);
const retried=await claim();assert.equal(retried.attempts,2);assert.notEqual(retried.lease,j.lease);
await db.query('select private.innova_finish_storage_cleanup($1,$2,true)',[retried.id,retried.lease]);assert.equal(await claim(),null);

const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/commercial/storage-cleanup.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports});
const prefix=u+'/'+campaign,objects=new Set(Array.from({length:230},(_,i)=>prefix+'/image-'+i));objects.add(prefix+'/folder/nested');objects.add(v+'/unrelated');let fail=true;
const storage={from:()=>({list:async p=>({data:[...new Set([...objects].filter(s=>s.startsWith(p+'/')).map(s=>s.slice(p.length+1).split('/')[0]))].slice(0,100).map(name=>({name,id:objects.has(p+'/'+name)?name:null}))}),remove:async paths=>{if(fail){fail=false;return{error:true};}paths.forEach(p=>objects.delete(p));return{};}})};
await assert.rejects(exports.cleanCampaignStorage(storage,{owner_id:u,campaign_id:campaign,bucket:'escaparates-assets'}),/STORAGE_DELETE_FAILED/);
assert.equal(await exports.cleanCampaignStorage(storage,{owner_id:u,campaign_id:campaign,bucket:'escaparates-assets'}),true);
assert.deepEqual([...objects],[v+'/unrelated']);
await assert.rejects(exports.cleanCampaignStorage(storage,{owner_id:'../other',campaign_id:campaign,bucket:'escaparates-assets'}),/INVALID_CLEANUP_SCOPE/);
console.log('PASS launch: 100-slot cap, real contract only, early continuous renewal, lost continuity, normal price, private permissions. PASS cleanup: durable two-bucket jobs, leases, backoff, no ID reuse, paginated/nested storage retry and exact-owner isolation.');
}finally{await db.close();}

