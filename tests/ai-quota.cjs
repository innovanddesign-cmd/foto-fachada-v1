const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
let state='reserved',finalize=true,broken=false,ran=0,finished=[],inserts=[];
const sql=async(strings,...values)=>{if(broken)throw Error('database offline');const q=strings.join('?');if(q.includes('ai_reserve'))return[{state}];if(q.includes('ai_finish')){finished.push(values[2]);return[{finished:finalize}]};inserts.push(values);return[]};
function load(env={DATABASE_URL:'postgres://postgres:secret@db.project.supabase.co/postgres',NEXT_PUBLIC_SUPABASE_URL:'https://project.supabase.co'}){
 const exp={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/ai/quota.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exp,require:n=>n==='server-only'?{}:n==='postgres'?{default:()=>sql}:{NextResponse:Response},URL,process:{env},console:{error:()=>{}}});return exp;
}
(async()=>{
 const q=load();const run=async()=>{ran++;return new Response('{}',{status:200})};
 assert.equal((await q.withAIQuota('u','r',run)).status,200);assert.deepEqual(finished,[true]);
 for(const [s,status] of [['quota',429],['rate',429],['duplicate',409]]){state=s;assert.equal((await q.withAIQuota('u','r',run)).status,status)}
 assert.equal(ran,1,'rejected reservation must not call provider');state='reserved';
 await q.withAIQuota('u','r',async()=>new Response('{}',{status:429}));assert.equal(finished.at(-1),false);
 await q.withAIQuota('u','r',async()=>{throw Error('provider fail')});assert.equal(finished.at(-1),false);
 broken=true;assert.equal((await q.withAIQuota('u','r',run)).status,503);assert.equal(ran,1);broken=false;
 finalize=false;assert.equal((await q.withAIQuota('u','r',run)).status,503);finalize=true;
 await q.saveAIAttempt('r',1,'model',200,{promptTokenCount:0,candidatesTokenCount:-1,totalTokenCount:12});
 assert.equal(inserts[0][4],0);assert.equal(inserts[0][5],null);assert.equal(inserts[0][8],12);
 const before=ran;assert.equal((await load({}).withAIQuota('u','r',run)).status,503);
 assert.equal((await load({DATABASE_URL:'postgres://postgres:secret@other.example/postgres',NEXT_PUBLIC_SUPABASE_URL:'https://project.supabase.co'}).withAIQuota('u','r',run)).status,503);assert.equal(ran,before);
 console.log('PASS: fail closed, limits/replay do not call provider, success consumes, failure releases, unknown usage preserved, DB/project configuration guarded.');
})().catch(e=>{console.error(e);process.exit(1)});
