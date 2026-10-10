const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
function load(path,deps={},globals={}){const exp={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exp,require:n=>{if(!(n in deps))throw Error(n);return deps[n]},console,URL,crypto:require('node:crypto').webcrypto,process:{env:{GEMINI_API_KEY:'test-only'}},...globals});return exp;}
let user=null,fail=false,providerCalls=0;
const guard=load('lib/ai/access.ts',{'next/server':{NextResponse:Response},'@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>{if(fail)throw Error('offline');return{data:{user},error:null}}}})}});
const req=(origin='https://example.test')=>new Request('https://example.test/api/analizar-fachada',{method:'POST',headers:{origin},body:JSON.stringify({image:'x'.repeat(150)})});
(async()=>{
 assert.equal((await guard.requireAIUser(req())).response.status,401);
 user={id:'u1',is_anonymous:true};assert.equal((await guard.requireAIUser(req())).response.status,401);
 user={id:'u1'};assert.equal((await guard.requireAIUser(req())).userId,'u1');
 assert.equal((await guard.requireAIUser(req('https://other.test'))).response.status,403);
 fail=true;assert.equal((await guard.requireAIUser(req())).response.status,503);fail=false;
 const events=[];
 const usage=load('lib/ai/usage.ts',{}, {console:{info:s=>events.push(JSON.parse(s))}});
 usage.recordAIUsage('u1','r1','model',{promptTokenCount:12,candidatesTokenCount:0,totalTokenCount:15,thoughtsTokenCount:3,secret:'hidden'});
 assert.equal(events[0].promptTokens,12);assert.equal(events[0].outputTokens,0);assert.equal(events[0].cachedTokens,null);assert.equal(events[0].secret,undefined);assert.equal(events[0].cost,null);
 usage.recordAIUsage('u1','r2','model',undefined);assert.equal(events[1].totalTokens,null);
 for(const file of ['app/api/analizar-fachada/route.ts','app/api/analyze/route.ts']){
  const route=load(file,{'next/server':{NextResponse:Response},'@/lib/ai/access':guard,'@/lib/ai/usage':usage,'@/lib/ai/campaign-provider':{campaignProviderReady:()=>false},'@/lib/ai/initial-campaign':load('lib/ai/initial-campaign.ts'),'@/lib/ai/quota':{withAIQuota:()=>{throw Error('must not reach quota without auth')}},'@google/generative-ai':{GoogleGenerativeAI:class{getGenerativeModel(){providerCalls++;throw Error('must not call')}}}},{fetch:async()=>{providerCalls++;throw Error('must not call')}});
  user=null;assert.equal((await route.POST(req())).status,401);
  user={id:'u1',is_anonymous:true};assert.equal((await route.POST(req())).status,401);
  assert.equal(providerCalls,0);
 }
 const ai=load('services/ai.ts',{}, {fetch:async()=>{providerCalls++;return new Response('{}',{status:401})}});
 const manual=ai.identidadManual();assert.equal(manual.confianza,0);assert.equal(providerCalls,0);
 await ai.AIService.generarEscaparate(manual);assert.equal(providerCalls,0,'manual generation must not call provider');
 await assert.rejects(()=>ai.AIService.analizarImagen('test'),ai.AISignInRequired);
 console.log('PASS: both routes deny unauthenticated/anonymous access before provider; origin/auth failure; manual generation no fetch; 401 stays explicit; telemetry distinguishes zero from unknown.');
})().catch(e=>{console.error(e);process.exit(1)});
