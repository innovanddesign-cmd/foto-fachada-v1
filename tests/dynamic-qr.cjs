const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const exportsQR={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/tracking/resolveDynamicQR.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exportsQR});
let qr={target_campaign_id:'a',version:1},published={a:{slug:'landing-a'},b:{slug:'landing-b'}},events=[],fail=false,scanFail=false;
const sb={from(table){let value;return {select(){return this},eq(_,v){value=v;return this},async maybeSingle(){return {data:table==='escaparates_qr'?(value==='qr-impreso'?qr:null):published[value]||null,error:fail?{message:'offline'}:null}},async insert(event){if(scanFail)throw Error('offline');events.push(event);return {error:null}}}}};
(async()=>{
 const resolve=exportsQR.resolveDynamicQR;
 assert.equal((await resolve(sb,'qr-impreso')).destination,'/v/landing-a');
 qr={target_campaign_id:'b',version:2};
 assert.equal((await resolve(sb,'qr-impreso')).destination,'/v/landing-b');
 assert.deepEqual(events.map(e=>[e.target_slug,e.version]),[['landing-a',1],['landing-b',2]]);
 await resolve(sb,'qr-impreso',false);assert.equal(events.length,2,'HEAD must not count');
 scanFail=true;assert.equal((await resolve(sb,'qr-impreso')).status,307);
 delete published.b;assert.equal((await resolve(sb,'qr-impreso')).status,404);
 assert.equal((await resolve(sb,'qr-inexistente')).status,404);
 assert.equal((await resolve(sb,'//evil.example')).status,404);
 fail=true;assert.equal((await resolve(sb,'qr-impreso')).status,503);
 assert.equal(events.length,2,'historical records remain unchanged');
 console.log('PASS: stable printed URL, new destination, destination/version history, HEAD, missing destination, invalid slug and database failures.');
})().catch(e=>{console.error(e);process.exit(1)});
