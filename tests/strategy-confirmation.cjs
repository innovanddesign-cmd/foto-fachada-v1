const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
function load(file,requires={}) {const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in requires)return requires[n];throw Error(n)},console,Date,encodeURIComponent,URL,process});return exports;}
const sectors=load('lib/marketing/sectors.ts');
const m=load('lib/marketing/estrategia.ts',{'./sectors':sectors,'./campaign-plan':load('lib/marketing/campaign-plan.ts',{'./sectors':sectors})});
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

for(const id of Object.keys(sectors.sectors)) {
 const brief=sectors.cleanBrief({sector:id,name:'TEST',services:'Servicio confirmado',focus:'Objetivo confirmado',location:'Benidorm',offer:'',injected:'ignored'});
 assert.equal(brief.sector,id);assert.equal(brief.injected,undefined);
 const strategy=m.sugerirEstrategia({sectorBrief:brief});assert.equal(strategy.objetivo,id==='inmobiliarias'?'CONSULTAS':'CITAS');
 assert.ok(sectors.sectorPrompt(brief).includes('Servicio confirmado'));
 const publicSnapshot=load('lib/supabase/sanitize.ts').sanearPayloadPublico({adnMarca:{sectorBrief:brief},datosEscaparate:prior});
 assert.equal(publicSnapshot.adnMarca.sectorBrief,undefined);
}
assert.equal(sectors.cleanBrief({sector:'__proto__'}),undefined);
assert.equal(sectors.cleanBrief({sector:'invalid'}),undefined);
assert.equal(sectors.cleanBrief({sector:'estetica',services:'x'.repeat(2000)}).services.length,1200);
console.log('PASS: three sector strategies, bounded provider context, unknown sectors rejected and private brief excluded from public pages.');

const marketing=load('lib/marketing/campaign-plan.ts',{'./sectors':sectors});
assert.equal(marketing.campaignBudget({capacity:'20',unitCost:'0.60'}),12);
assert.equal(marketing.campaignBudget({capacity:'20',unitCost:''}),null);
assert.ok(marketing.campaignIssues({sector:'estetica',location:'',services:'',offer:'Regalo'}).length>0);
assert.ok(marketing.campaignIssues({sector:'estetica',location:'Benidorm',services:'Manicura',audience:'Clientes locales',placement:'Entrada',startDate:'2026-10-20',endDate:'2026-10-10',target:'2',fulfillment:'Equipo',offer:''}).some(x=>x.includes('periodo')));
assert.ok(!sectors.sectorPrompt({sector:'estetica',offer:'REGALO_NO_APROBADO'}).includes('REGALO_NO_APROBADO'));
console.log('PASS marketing: real unit-cost budget, missing data, reversed dates and unapproved offers.');
// Goal selection must survive URL entry and remain distinct in the marketing output.
for(const sector of Object.keys(sectors.sectorObjectives)) {
 for(const objective of sectors.sectorObjectives[sector]) {
  const brief=sectors.requestedCampaign(sector,objective.id);
  assert.equal(brief.focus,objective.focus);
  const strategy=m.sugerirEstrategia({sectorBrief:brief});
  assert.equal(strategy.cta,objective.cta);
  assert.ok(sectors.sectorPrompt(brief).includes(objective.sections));
  assert.ok(sectors.sectorPrompt(brief).includes(objective.metric));
 }
 assert.equal(sectors.requestedCampaign(sector,'<script>').focus,sectors.sectors[sector].focus[0]);
}
assert.notEqual(m.sugerirEstrategia({sectorBrief:sectors.requestedCampaign('inmobiliarias','captar')}).cta,m.sugerirEstrategia({sectorBrief:sectors.requestedCampaign('inmobiliarias','inmueble')}).cta);
const gap=sectors.requestedCampaign('peluquerias','agenda');
assert.ok(marketing.campaignIssues(gap).some(x=>x.includes('franjas')));
assert.ok(!marketing.campaignIssues({...gap,availability:'Martes de 10 a 12'}).some(x=>x.includes('franjas')));
assert.equal(sectors.cleanBrief({...gap,objectiveNotes:'x'.repeat(1500)}).objectiveNotes.length,1000);
console.log('PASS: all sector objectives keep their CTA and AI structure; unknown objectives rejected; actual availability required for agenda campaigns.');

const initial=load('lib/ai/initial-campaign.ts').initialCampaign;
const generated=initial({titulo:'Campaña',descripcion:'Descripción',secciones:[{titulo:'Datos confirmados',texto:'Contenido público',private:'SECRET'},null,{titulo:'x'.repeat(200),texto:'y'.repeat(900)}]});
assert.equal(generated.secciones.length,2);assert.equal(generated.secciones[1].titulo.length,100);assert.equal(generated.secciones[1].texto.length,700);assert.ok(!JSON.stringify(generated).includes('SECRET'));
console.log('PASS: bounded public AI sections strip unrecognized fields.');

assert.equal(initial({titulo:'Cita',descripcion:'Escanea el código para consultar horarios.'}).descripcion,'Consulta horarios.');
