import ts from 'typescript';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
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

const u='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
await db.query('insert into auth.users(id) values($1),($2)',[u,other]);
let owner=u,operator=false;
const sql=async(parts,...values)=>{let query=parts[0];values.forEach((_,i)=>{query+='$'+(i+1)+parts[i+1]});return (await db.query(query,values)).rows;};
sql.begin=async(fn)=>{await db.exec('begin');try{const r=await fn(sql);await db.exec('commit');return r;}catch(e){await db.exec('rollback');throw e;}};
function load(file,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n]},URL,Response,Buffer,AbortSignal,process:{env},fetch:providerFetch,crypto:crypto.webcrypto,console});return exports;}

const env={PADDLE_ENVIRONMENT:'sandbox',PADDLE_API_KEY:'test-key',PADDLE_WEBHOOK_SECRET:'test-secret',PADDLE_CLIENT_TOKEN:'test_token',PADDLE_PRICE_PRO_MONTHLY:'pri_'+ 'a'.repeat(26)};
let providerCalls=0,canonical=null;
async function providerFetch(url,options){providerCalls++;if(url.includes('/prices/'))return Response.json({data:{status:'active',unit_price:{currency_code:'EUR',amount:'2000'},tax_mode:'external',billing_cycle:{frequency:1,interval:'month'}}});if(options.method==='POST'){const body=JSON.parse(options.body);canonical={id:'txn_'+'b'.repeat(26),status:'completed',custom_data:body.custom_data,currency_code:'EUR',items:[{quantity:1,price:{id:env.PADDLE_PRICE_PRO_MONTHLY,unit_price:{amount:'2000'}}}],discount_id:null,details:{totals:{discount:'0',subtotal:'2000'}}};return Response.json({data:{id:canonical.id}});}return Response.json({data:canonical});}
const credits=load('lib/commercial/credits.ts',{}),catalog=load('lib/commercial/catalog.ts',{});
const orders=load('lib/commercial/orders.ts',{'./catalog':catalog,'./credits':credits});
const paddle=load('lib/payments/paddle.ts',{'server-only':{},'node:crypto':crypto,'@/lib/commercial/orders':orders});
const deps={'next/server':{NextResponse:Response},'@/lib/ai/access':{requireAIUser:async()=>owner?{userId:owner}:{response:Response.json({error:'auth'},{status:401})}},'@/lib/commercial/server':{commercialDB:()=>sql},'@/lib/payments/paddle':paddle};
const route=load('app/api/paddle/checkout/route.ts',deps),webhook=load('app/api/paddle/webhook/route.ts',deps);
const req=(b,origin='https://example.test')=>new Request('https://example.test/api/paddle/checkout',{method:'POST',headers:{origin},body:JSON.stringify(b)});
const input={kind:'plan',product:'PRO',billing:'monthly',requestId:crypto.randomUUID(),priceId:'forged',netCents:1};
owner=null;assert.equal((await route.POST(req(input))).status,401);owner=u;
assert.equal((await route.POST(req(input,'https://evil.test'))).status,403);
env.PADDLE_ENVIRONMENT='production';assert.equal((await route.POST(req(input))).status,503);env.PADDLE_ENVIRONMENT='sandbox';
let r=await route.POST(req(input));assert.equal(r.status,200);const transaction=(await r.json()).transactionId;assert.equal(transaction,canonical.id);
const calls=providerCalls;assert.equal((await route.POST(req(input))).status,200);assert.equal(providerCalls,calls,'idempotent retry makes no extra Paddle transaction');
assert.equal((await route.POST(req({...input,billing:'annual'}))).status,409);
owner=other;assert.equal((await (await route.GET(req({}))).json()).sessions.length,0);owner=u;
const event={event_id:'evt_'+'c'.repeat(26),event_type:'transaction.completed',occurred_at:new Date().toISOString(),data:{id:transaction}};
function signed(e,ts=Math.floor(Date.now()/1000),tamper=false){const raw=JSON.stringify(e);const h=crypto.createHmac('sha256',env.PADDLE_WEBHOOK_SECRET).update(ts+':'+raw).digest('hex');return new Request('https://example.test/api/paddle/webhook',{method:'POST',headers:{'paddle-signature':'ts='+ts+';h1='+h},body:tamper?raw+' ':raw});}
assert.equal((await webhook.POST(signed(event,Math.floor(Date.now()/1000)-600))).status,401);
assert.equal((await webhook.POST(signed(event,Math.floor(Date.now()/1000),true))).status,401);
canonical.items[0].quantity=2;assert.equal((await webhook.POST(signed(event))).status,503);canonical.items[0].quantity=1;
assert.equal((await webhook.POST(signed(event))).status,200);
assert.equal((await webhook.POST(signed(event))).status,200);
assert.equal((await db.query('select count(*)::int n from private.innova_paddle_events')).rows[0].n,1);
assert.equal((await db.query('select state from private.innova_paddle_sessions')).rows[0].state,'completed');
assert.equal((await db.query('select count(*)::int n from private.innova_contracts')).rows[0].n,0,'sandbox never creates paid contracts');
assert.equal((await db.query('select count(*)::int n from private.innova_ledger')).rows[0].n,0,'sandbox never grants live credits');
await db.exec('set role authenticated');await assert.rejects(db.query('select * from private.innova_paddle_sessions'),/permission denied/);await db.exec('reset role');
console.log('PASS Paddle: auth, CSRF, sandbox-only, trusted price, transaction idempotency, owner isolation, signature tampering/expiry, quantity validation, webhook replay and no live grants.');
}finally{await db.close();}
