const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,requireMock,extras={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:requireMock,Request,Response,URL,Buffer,...extras});return exports;}
(async()=>{
 const env={INNOVA_WORKER_SECRET:'x'.repeat(40),INNOVA_MAINTENANCE_ENABLED:'true',INNOVA_SCHEDULING_ENABLED:'true'};
 const auth=load('lib/commercial/worker-auth.ts',require,{process:{env}});
 const request=(token='x'.repeat(40))=>new Request('https://innova.test/api/internal/maintenance',{method:'POST',headers:{authorization:'Bearer '+token}});
 assert.equal(auth.workerAuthorized(request()),true);assert.equal(auth.workerAuthorized(request('bad')),false);env.INNOVA_WORKER_SECRET='short';assert.equal(auth.workerAuthorized(request('short')),false);env.INNOVA_WORKER_SECRET='x'.repeat(40);
 let calls=[],busy=false,failRetention=false,emailRuns=0;
 const sql=async(parts,...values)=>{const query=parts.join('?');calls.push(query);if(query.includes('innova_claim_worker'))return [{lease:busy?null:'worker-lease'}];if(query.includes('innova_process_retention')&&failRetention)throw Error('Private DB error');return [{result:{ok:true},prepared:1}];};
 const route=load('app/api/internal/maintenance/route.ts',name=>({
  'next/server':{NextResponse:Response},'@supabase/supabase-js':{createClient:()=>{throw Error('Not expected without storage configuration');}},
  '@/lib/commercial/server':{commercialDB:()=>sql},'@/lib/commercial/worker-auth':auth,
  '@/lib/commercial/storage-cleanup':{cleanCampaignStorage:()=>{}},'@/lib/commercial/email-delivery':{deliverEmail:async()=>{emailRuns++;return {processed:0};},checkEmailDelivery:async()=>({checked:0})}
 }[name]),{process:{env}});
 assert.equal((await route.POST(request('bad'))).status,401);assert.equal(calls.length,0);
 env.INNOVA_MAINTENANCE_ENABLED='false';assert.equal((await route.POST(request())).status,503);assert.equal(calls.length,0);env.INNOVA_MAINTENANCE_ENABLED='true';
 busy=true;assert.equal((await route.POST(request())).status,202);assert.equal(calls.length,1);busy=false;calls=[];
 failRetention=true;let response=await route.POST(request());let result=await response.json();assert.equal(response.status,200);assert.equal(result.results.retention.error,true);assert.equal(emailRuns,1,'Failure in retention does not prevent independent email task');assert.ok(calls.some(q=>q.includes('innova_prepare_experience_emails')));assert.ok(calls.some(q=>q.includes('innova_finish_worker')),'Always release worker lease');assert.ok(!JSON.stringify(result).includes('Private DB error'));
 env.INNOVA_SCHEDULING_ENABLED='false';calls=[];await route.POST(request());assert.ok(!calls.some(q=>q.includes('innova_run_scheduled_publication')));
 console.log('PASS automatic worker: constant-time secret check, disabled/auth guards before database, shared lease, feature gates, independent task failure and guaranteed release without private errors.');
})().catch(error=>{console.error(error);process.exitCode=1;});
