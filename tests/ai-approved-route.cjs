const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
let authenticated=true,providerCalls=0,reserves=0,refunds=0,expectedPrice=5,state='reserved',failProvider=false,finishOK=true,refundOK=true;
const db=async(parts,...args)=>{
 const q=parts.join('?');
 if(q.includes('innova_ai_quote'))return [{text_quote:{available:true,cost:5,balance:100},image_quote:{available:true,cost:20,balance:100}}];
 if(q.includes('innova_reserve_v2')){reserves++;assert.equal(args[0],'owner');return [{state:args[3]!==expectedPrice?'price_changed':state}];}
 if(q.includes('innova_finish')){if(q.includes('false')){refunds++;return [{finished:refundOK}];}return [{finished:finishOK}];}
 throw Error('Unexpected query');
};
const mod={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/ai-free/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:mod,require:name=>({
 'next/server':{NextResponse:Response},
 '@/lib/marketing/sectors':{sectorPrompt:()=>''},
 '@/lib/ai/access':{requireAIUser:async()=>authenticated?{userId:'owner'}:{response:Response.json({error:'auth'},{status:401})},aiRequestId:()=> 'request'},
 '@/lib/commercial/server':{commercialDB:()=>db},
 '@/lib/ai/free-provider':{freeProviderReady:()=>true,generateFree:async()=>{providerCalls++;if(failProvider)throw Error();return {text:'Generated'};}}
}[name])});
const req=body=>new Request('https://test.local/api/ai-free',{method:'POST',body:JSON.stringify(body)});
(async()=>{
 authenticated=false;assert.equal((await mod.GET(req({}))).status,401);assert.equal((await mod.POST(req({}))).status,401);assert.equal(reserves,0);
 authenticated=true;const quote=await (await mod.GET(req({}))).json();assert.equal(quote.costs.text,5);assert.equal(quote.costs.image,20);
 assert.equal((await mod.POST(req({kind:'text',prompt:'test'}))).status,409);assert.equal(reserves,0);
 assert.equal((await mod.POST(req({kind:'text',prompt:'test',expectedCost:0}))).status,409);assert.equal(providerCalls,0);
 state='unavailable';assert.equal((await mod.POST(req({kind:'text',prompt:'test',expectedCost:5}))).status,403);assert.equal(providerCalls,0);
 state='reserved';let response=await mod.POST(req({kind:'text',prompt:'test',expectedCost:5}));assert.equal(response.status,200);assert.equal((await response.json()).cost,5);
 failProvider=true;response=await mod.POST(req({kind:'text',prompt:'test',expectedCost:5}));assert.equal(response.status,503);assert.equal(refunds,1);assert.match((await response.json()).error,/devuelto/);
 refundOK=false;response=await mod.POST(req({kind:'text',prompt:'test',expectedCost:5}));assert.match((await response.json()).error,/requiere revisión/);
 console.log('PASS AI credits API: authenticated quotes, explicit price, current rights, no provider on rejected charge, exact refund and uncertain-finalization message.');
})().catch(e=>{console.error(e);process.exit(1)});

