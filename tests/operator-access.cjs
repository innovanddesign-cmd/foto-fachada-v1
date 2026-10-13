const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
function load(file,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n]},URL,Date,Number,JSON,Response,console});return exports;}
let user=null,authError=false,updates=0,rows=[];
const auth=load('lib/commercial/operator.ts',{'next/server':{NextResponse:Response},'@/lib/supabase/server':{createClient:async()=>{if(authError)throw Error('offline');return {auth:{getUser:async()=>({data:{user},error:null})}}}}});
const req=(body={},origin='https://local.test')=>new Request('https://local.test/api/operator/credits',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
const sql=async()=>{updates++;return rows};sql.begin=async fn=>fn(sql);
const deps={'@/lib/commercial/credits':load('lib/commercial/credits.ts',{}),'next/server':{NextResponse:Response},'@/lib/commercial/operator':auth,'@/lib/commercial/server':{commercialDB:()=>sql}};
const credits=load('app/api/operator/credits/route.ts',deps);
const cancel=load('app/api/account/cancel/route.ts',{'next/server':{NextResponse:Response},'@/lib/ai/access':{requireAIUser:async()=>({userId:'00000000-0000-4000-8000-000000000001'})},'@/lib/commercial/server':{commercialDB:()=>sql}});
(async()=>{
 assert.equal((await credits.POST(req())).status,403);assert.equal(updates,0);
 user={id:'staff',user_metadata:{innova_operator:true}};assert.equal((await credits.POST(req())).status,403,'client metadata never grants operator access');
 user={id:'staff',is_anonymous:true,app_metadata:{innova_operator:true}};assert.equal((await credits.POST(req())).status,403);
 user={id:'staff',app_metadata:{innova_operator:true}};
 assert.equal((await credits.POST(req({},'https://foreign.test'))).status,403);assert.equal(updates,0);
 const topup={ownerId:'00000000-0000-4000-8000-000000000001',pack:'small',netCents:500,paymentReference:'receipt-1'};
 assert.equal((await credits.POST(req({...topup,netCents:-1}))).status,409);assert.equal(updates,0);
 assert.equal((await credits.POST(req(topup))).status,200);assert.equal(updates,1,'transactional topup function');
 authError=true;assert.equal((await credits.POST(req(topup))).status,503);authError=false;
 rows=[];assert.equal((await cancel.POST(req())).status,409,'missing subscription is not a successful cancellation');
 rows=[{owner_id:topup.ownerId}];assert.equal((await cancel.POST(req())).status,200);
 console.log('PASS operator API: trusted staff only, origin, invalid amount, successful top-up, unavailable auth, cancellation result.');
})().catch(e=>{console.error(e);process.exitCode=1});
