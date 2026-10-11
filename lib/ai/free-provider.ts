import 'server-only';
export type FreeKind='text'|'image'|'logo';
/** Explicitly separate credentials: free requests never fall back to the paid Gemini key. */
export function freeProviderReady(kind:FreeKind) {
 return process.env.INNOVA_FREE_AI_ENABLED==='true' && (kind==='text'
  ?(process.env.INNOVA_FREE_TEXT_PROVIDER==='openrouter'?Boolean(process.env.OPENROUTER_FREE_API_KEY&&process.env.OPENROUTER_FREE_MODEL?.endsWith(':free')):Boolean(process.env.GROQ_FREE_API_KEY&&process.env.GROQ_FREE_MODEL))
  :Boolean(process.env.CLOUDFLARE_FREE_API_TOKEN&&/^[a-f0-9]{32}$/i.test(process.env.CLOUDFLARE_ACCOUNT_ID||'')));
}
export async function generateFree(kind:FreeKind,prompt:string):Promise<{text?:string;image?:string;model:string}> {
 if(!freeProviderReady(kind))throw Error('FREE_PROVIDER_NOT_CONFIGURED');
 if(kind==='text'){
  const router=process.env.INNOVA_FREE_TEXT_PROVIDER==='openrouter',model=router?process.env.OPENROUTER_FREE_MODEL:process.env.GROQ_FREE_MODEL;
  const r=await fetch(router?'https://openrouter.ai/api/v1/chat/completions':'https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${router?process.env.OPENROUTER_FREE_API_KEY:process.env.GROQ_FREE_API_KEY}`},body:JSON.stringify({model,max_tokens:4096,temperature:.1,...(router?{reasoning:{effort:'none'},provider:{require_parameters:true,data_collection:'deny',zdr:true,max_price:{prompt:0,completion:0,request:0}}}:{}),messages:[{role:'system',content:'Reescribe en español en menos de 80 palabras. Incluye solo nombre y servicios presentes en los datos. No agregues cualidades: artesanal, personalizado, profesional, calidad, experiencia, tranquilidad ni instalaciones salvo si aparecen literalmente en los datos. No menciones la ausencia de datos. No uses HTML ni Markdown. Nunca inventes precios, horarios, premios ni direcciones.'},{role:'user',content:prompt}]}),signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('FREE_PROVIDER_UNAVAILABLE');
  const d=await r.json(),text=d.choices?.[0]?.message?.content;
  if(d.choices?.[0]?.finish_reason!=='stop'||(router&&d.usage?.cost!==0)||typeof text!=='string'||!text.trim()||text.length>8000)throw Error('FREE_PROVIDER_INVALID');
  return {text,model:model!};
 }
 const model='@cf/stabilityai/stable-diffusion-xl-base-1.0';
 const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.CLOUDFLARE_FREE_API_TOKEN}`},body:JSON.stringify({prompt:kind==='logo'?`Simple brand symbol, no letters, no text. ${prompt}`:prompt,width:768,height:768,num_steps:20}),signal:AbortSignal.timeout(60000)});
 if(!r.ok||!(r.headers.get('content-type')||'').includes('image/png'))throw Error('FREE_PROVIDER_UNAVAILABLE');
 const bytes=Buffer.from(await r.arrayBuffer());
 if(bytes.length>4_000_000||bytes.length<8||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('FREE_PROVIDER_INVALID');
 return {image:`data:image/png;base64,${bytes.toString('base64')}`,model};
}
