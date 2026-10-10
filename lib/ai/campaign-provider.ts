import 'server-only';
/** No paid fallback. Groq is enabled only after the owner confirms a Free account. */
export function campaignProviderReady(image=false){
 return image ? Boolean(process.env.GROQ_FREE_API_KEY && process.env.GROQ_FREE_TIER_CONFIRMED==='true') : Boolean(process.env.OPENROUTER_FREE_API_KEY && process.env.OPENROUTER_FREE_MODEL?.endsWith(':free'));
}
export async function generateCampaignJSON(prompt:string,image?:{mime:string;data:string}){
 if(!campaignProviderReady(Boolean(image)))throw Error('FREE_PROVIDER_NOT_CONFIGURED');
 const model=image ? 'qwen/qwen3.8-27b' : process.env.OPENROUTER_FREE_MODEL!;
 const response=await fetch(image?'https://api.groq.com/openai/v1/chat/completions':'https://openrouter.ai/api/v1/chat/completions',{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${image?process.env.GROQ_FREE_API_KEY:process.env.OPENROUTER_FREE_API_KEY}`},
  body:JSON.stringify({model,messages:[{role:'user',content:image?[{type:'text',text:prompt},{type:'image_url',image_url:{url:`data:${image.mime};base64,${image.data}`}}]:prompt}],max_tokens:4096,temperature:.2,response_format:{type:'json_object'},...(image?{}:{reasoning:{effort:'none'},provider:{require_parameters:true,data_collection:'deny',zdr:true,max_price:{prompt:0,completion:0,request:0}}})}),signal:AbortSignal.timeout(60000)});
 if(response.status===429)throw Error('FREE_RATE_LIMIT');
 if(!response.ok)throw Error('FREE_PROVIDER_UNAVAILABLE');
 const d=await response.json(),text=d.choices?.[0]?.message?.content;
 if(d.choices?.[0]?.finish_reason!=='stop'||typeof text!=='string'||!text.trim()||(!image&&d.usage?.cost!==0))throw Error('FREE_PROVIDER_INVALID');
 return {text,model:(image?'groq-free:':'openrouter-free:')+model,usage:{promptTokenCount:d.usage?.prompt_tokens,candidatesTokenCount:d.usage?.completion_tokens,thoughtsTokenCount:0,totalTokenCount:d.usage?.total_tokens}};
}
