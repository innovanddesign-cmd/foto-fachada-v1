const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
let publication={campaign_id:'owned-campaign'},events=[],reads=0;
const sb={from(table){return{select(){return this},eq(){return this},async maybeSingle(){reads++;return{data:publication,error:null}},async insert(event){events.push(event);return{error:null}}}}};
const exportsTest={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/contact-click/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsTest,require:name=>name==='next/server'?{NextResponse:Response}:{createClient:()=>sb},URL,Set,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-test-key'}}});
const request=(body,origin='https://example.test')=>new Request('https://example.test/api/contact-click',{method:'POST',headers:{origin},body:typeof body==='string'?body:JSON.stringify(body)});
(async()=>{
 assert.equal((await exportsTest.POST(request({slug:'landing-a',action:'whatsapp'}))).status,204);
 assert.equal(events.length,1);assert.equal(events[0].campaign_id,'owned-campaign');assert.equal(events[0].action,'whatsapp');assert.equal(Object.keys(events[0]).length,3);
 assert.equal((await exportsTest.POST(request({slug:'landing-a',action:'reserve'}))).status,400);
 assert.equal((await exportsTest.POST(request({slug:'../other',action:'phone'}))).status,400);
 assert.equal((await exportsTest.POST(request({slug:'landing-a',action:'phone'},'https://other.test'))).status,403);
 assert.equal((await exportsTest.POST(request('x'.repeat(513)))).status,413);
 assert.equal(reads,1,'invalid input must not query database');
 publication=null;assert.equal((await exportsTest.POST(request({slug:'missing-page',action:'phone'}))).status,404);
 assert.equal(events.length,1,'unpublished page must not create events');
 console.log('PASS: valid contact event, publication lookup, action/slug/origin/size validation, no extra personal fields, unpublished page rejected.');
})().catch(e=>{console.error(e);process.exit(1)});
