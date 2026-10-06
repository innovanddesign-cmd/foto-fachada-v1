const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
function load(file,requires={}) {const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in requires)return requires[n];throw Error(n)},console,Date,encodeURIComponent,URL,process});return exports;}
const m=load('lib/marketing/estrategia.ts');
const p=m.sugerirEstrategia({analisisVision:{categoriaSugerida:'Estética'}});
assert.equal(p.objetivo,'CITAS');assert.equal(m.estrategiaConfirmada(p),false);
assert.match(m.validarEstrategia(p),/WhatsApp/);
const confirmed={...p,telefono:'+34 600 123 456',confirmadaEn:'2026-10-06',mensajeWhatsApp:'Hola, información & cita?'};
assert.equal(m.validarEstrategia(confirmed),null);assert.equal(m.estrategiaConfirmada(confirmed),true);
assert.equal(m.estrategiaConfirmada({...confirmed,confirmadaEn:undefined}),false);
assert.ok(m.validarEstrategia({...confirmed,publico:' '}));
assert.ok(m.validarEstrategia({...confirmed,telefono:'javascript:alert(1)'}));
const prior={titularPrincipal:'Texto editado',ofertas:[{titulo:'Servicio real'}],planVisual:'FREE',datosReales:{horario:'Lunes',telefono:'123'}};
const applied=m.aplicarEstrategia(prior,confirmed);
assert.equal(applied.titularPrincipal,prior.titularPrincipal);assert.equal(applied.ofertas,prior.ofertas);assert.equal(applied.planVisual,'FREE');assert.equal(applied.datosReales.horario,'Lunes');assert.equal(applied.datosReales.ctaPrincipal,p.cta);
assert.equal(prior.datosReales.telefono,'123');assert.throws(()=>m.aplicarEstrategia(prior,p));
const publicData=load('lib/supabase/sanitize.ts').sanearPayloadPublico({adnMarca:{estrategiaConversion:confirmed,analisisMarketing:'PRIVATE',publicoObjetivo:'PRIVATE'},datosEscaparate:applied});
assert.equal(publicData.datosEscaparate.datosReales.mensajeWhatsApp,confirmed.mensajeWhatsApp);assert.ok(!JSON.stringify(publicData).includes('PRIVATE'));assert.equal(publicData.adnMarca.estrategiaConversion,undefined);
// Check the real renderer's contact link encoding without network or sending messages.
let source=fs.readFileSync('lib/design/render.js','utf8').replace(/export /g,'');
const context={process,URL,encodeURIComponent};vm.createContext(context);vm.runInContext(source+'\nglobalThis.contactLinksForTest=contactLinks;',context);
const url=context.contactLinksForTest({whatsapp:confirmed.telefono,whatsappMessage:confirmed.mensajeWhatsApp})[0].url;
assert.equal(new URL(url).pathname,'/34600123456');assert.equal(new URL(url).searchParams.get('text'),confirmed.mensajeWhatsApp);
console.log('PASS: required confirmation, phone validation, preserved edits, public field allowlist and encoded WhatsApp message.');
