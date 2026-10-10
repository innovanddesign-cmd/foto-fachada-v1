const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
let state='reserved',finish=true,providerOK=true,providerCalls=0,completed=[],proposal={acento:'#112233',primario:'#123456',secundario:'#654321',fondo:'#ffffff',layout:'heroe-dividido'};
const sql=async(strings,...values)=>{const q=strings.join('?');if(q.includes('innova_reserve'))return[{state}];if(q.includes('innova_finish')){completed.push(q.includes("::uuid,true"));return[{finished:finish}]};return[]};
const exp={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/ai-proposal/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exp,require:n=>n==='@/lib/ai/quota'?{saveAIAttempt:async()=>{}}:n==='next/server'?{NextResponse:Response}:n==='@/lib/ai/access'?{requireAIUser:async()=>({userId:'owner'}),aiRequestId:()=> 'request-id'}:{commercialDB:()=>sql},process:{env:{INNOVA_CREDITS_ENABLED:'true',GEMINI_API_KEY:'test-only',GEMINI_MODEL:'test-only'}},AbortSignal,fetch:async()=>{providerCalls++;return{ok:providerOK,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(proposal)}]}}]})}}});
const req=(extra={})=>new Request('https://example.test/api/ai-proposal',{method:'POST',body:JSON.stringify({operation:'design',name:'Test',brief:'Nuevo diseño',expectedCost:200,...extra})});
(async()=>{
 assert.equal((await exp.POST(req({expectedCost:undefined}))).status,400);assert.equal(providerCalls,0);
 state='quota';assert.equal((await exp.POST(req())).status,429);assert.equal(providerCalls,0);
 state='reserved';let r=await exp.POST(req());assert.equal(r.status,200);assert.equal((await r.json()).proposal.layout,'heroe-dividido');assert.deepEqual(completed,[true]);
 providerOK=false;assert.equal((await exp.POST(req())).status,503);assert.equal(completed.at(-1),false);
 providerOK=true;proposal.acento='red; background:url(https://bad.test)';assert.equal((await exp.POST(req())).status,503);assert.equal(completed.at(-1),false);
 proposal.acento='#112233';finish=false;assert.equal((await exp.POST(req())).status,503,'failed credit finalization must not return a successful proposal');
 console.log('PASS AI proposal: explicit price, no provider on rejected credit, valid design, provider failure refund, malformed color refund, failed debit finalization rejects success.');
})().catch(e=>{console.error(e);process.exit(1)});

