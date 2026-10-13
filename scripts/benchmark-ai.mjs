import fs from 'node:fs';
// Optional local secret file; only the key is read and it is never written to reports.
const envFile=process.argv[2];
const contents=envFile?fs.readFileSync(envFile,'utf8'):'';
const key=process.env.GEMINI_API_KEY || contents.match(/^GOOGLE_API_KEY\s*=\s*["']?([^\r\n"']+)/m)?.[1]?.trim();
const report={date:new Date().toISOString(),kind:'synthetic-business-benchmark',results:[]};
if(!key)throw Error('GEMINI_API_KEY required');
const listed=await fetch('https://generativelanguage.googleapis.com/v1beta/models',{headers:{'x-goog-api-key':key},signal:AbortSignal.timeout(20000)});
if(!listed.ok){console.log(JSON.stringify({status:listed.status,stage:'model-list'}));process.exit(1);}
const available=(await listed.json()).models.map(m=>m.name.replace('models/',''));
const scenarios=[['marketing','Barbería ficticia Faro. Servicios confirmados: corte y barba. Sin precios ni horarios confirmados. Escribe título, descripción y CTA.'],['design','Centro ficticio Brisa: estética, cuidado facial. Paleta sobria, accesible y cálida. Propón colores hex y layout heroe-dividido.'],['text','Reescribe este texto manteniendo únicamente los hechos: En Panadería Ficticia Norte elaboramos pan y bollería. No añadas premios, precios, direcciones ni horarios.']];
for(const model of ['gemini-3.1-flash-lite','gemini-3.8-flash'].filter(x=>available.includes(x))){
 for(const [operation,brief] of scenarios){
  const start=Date.now();
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{parts:[{text:brief+' Devuelve un objeto JSON en español; no inventes hechos.'}]}],generationConfig:{maxOutputTokens:1024,responseMimeType:'application/json'}}),signal:AbortSignal.timeout(45000)});
  const d=await r.json();const output=d.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('');const u=d.usageMetadata;
  const rates=model.includes('lite')?[.25,1.5]:[.75,3.75];
  report.results.push({model,operation,status:r.status,ms:Date.now()-start,usage:u,output:output||null,estimatedStandardUSD:u?((u.promptTokenCount||0)*rates[0]+((u.candidatesTokenCount||0)+(u.thoughtsTokenCount||0))*rates[1])/1e6:null});
 }
}
fs.mkdirSync('.work',{recursive:true});fs.writeFileSync('.work/ai-benchmark.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
