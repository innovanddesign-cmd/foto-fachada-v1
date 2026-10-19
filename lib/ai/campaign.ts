'use client';
import {createClient} from '@/lib/supabase/client';
/** Stable across retries and reloads. A server allowance also limits new UUIDs. */
export function aiCampaignId() {
  let id = sessionStorage.getItem('innova-ai-campaign');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) { id=crypto.randomUUID(); sessionStorage.setItem('innova-ai-campaign',id); }
  return id;
}
export async function ensureAICampaign(name='Mi escaparate'){
 const sb=createClient();const {data:{user},error}=await sb.auth.getUser();
 if(error||!user||user.is_anonymous)throw Error('Inicia sesión para preparar la campaña.');
 const previousOwner=sessionStorage.getItem('innova-ai-owner');
 if(previousOwner&&previousOwner!==user.id)sessionStorage.removeItem('innova-ai-campaign');
 sessionStorage.setItem('innova-ai-owner',user.id);
 const id=aiCampaignId();const existing=await sb.from('escaparates_campaigns').select('id').eq('id',id).eq('owner_id',user.id).maybeSingle();
 if(existing.error)throw existing.error;
 if(!existing.data){const result=await sb.from('escaparates_campaigns').insert({id,owner_id:user.id,local_id:id,name:name.trim().slice(0,200)||'Mi escaparate',plan:'FREE',status:'draft'});if(result.error)throw result.error;}
 return id;
}
