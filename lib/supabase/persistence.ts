import {createClient} from './client';
import {sanearPayloadPublico} from './sanitize';
type Plan='FREE'|'PRO'|'ESCAPARATE';
export interface RemoteCampaign {id:string;owner_id:string;local_id?:string|null;name:string;slug:string|null;status:'draft'|'active'|'paused';snapshot:Record<string,any>;plan:Plan;created_at:string;updated_at:string;}
export interface PublishedEscaparate {slug:string;payload:Record<string,any>;plan:Plan;published_at:string;updated_at:string;}
export interface PersistResult {success:boolean;error:string|null;data?:any;}
const fail=(e:unknown):PersistResult=>({success:false,error:e instanceof Error?e.message:typeof (e as any)?.message==='string'?(e as any).message:'No se pudo completar la operación.'});
const uuid=(v:unknown)=>typeof v==='string'&&/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(v);
const mimeTypes=['image/jpeg','image/png','image/webp','image/gif'];
async function session(){const sb=createClient();const {data:{user},error}=await sb.auth.getUser();if(error||!user)throw new Error('Inicia sesión para guardar y publicar.');return{sb,user};}
function validateImage(blob:Blob){if(!mimeTypes.includes(blob.type)||blob.size>10485760)throw new Error('Usa imágenes JPG, PNG, WebP o GIF de hasta 10 MB.');}
/** Paths, never expiring URLs, are persisted. Signed URLs are generated only when opening. */
async function assets(snapshot:Record<string,any>,owner:string,id:string,mode:'save'|'open'|'publish'){
 const sb=createClient();const result=JSON.parse(JSON.stringify(snapshot));
 async function image(value:string|undefined,path:string|undefined):Promise<{url:string;path?:string}>{
  if(path&&!path.startsWith(`${owner}/${id}/`))throw new Error('La imagen pertenece a otra campaña.');
  if(!path&&value&&/^(data:|blob:)/.test(value)){
   const response=await fetch(value);if(!response.ok)throw new Error('No se pudo leer la imagen.');const blob=await response.blob();validateImage(blob);
   path=`${owner}/${id}/${crypto.randomUUID()}.${blob.type.split('/')[1]}`;
   const {error}=await sb.storage.from('escaparates-assets').upload(path,blob,{contentType:blob.type});if(error)throw error;
  }
  if(!path)return{url:typeof value==='string'?value:''};
  if(mode==='save')return{url:'',path};
  if(mode==='open'){const{data,error}=await sb.storage.from('escaparates-assets').createSignedUrl(path,3600);if(error||!data)throw error||new Error('No se pudo abrir la imagen.');return{url:data.signedUrl,path};}
  const {data:blob,error:readError}=await sb.storage.from('escaparates-assets').download(path);if(readError||!blob)throw readError||new Error('No se pudo leer la imagen guardada.');
  const {error}=await sb.storage.from('escaparates-public').upload(path,blob,{upsert:true,contentType:blob.type});if(error)throw error;
  return{url:sb.storage.from('escaparates-public').getPublicUrl(path).data.publicUrl,path};
 }
 if(result.imagenSubida){const a=await image(result.imagenSubida.urlImagen,result.imagenSubida.assetPath);result.imagenSubida={...result.imagenSubida,urlImagen:a.url,assetPath:a.path,archivo:undefined};}
 if(result.adnMarca?.logoExtraido||result.adnMarca?.logoAssetPath){const a=await image(result.adnMarca.logoExtraido,result.adnMarca.logoAssetPath);result.adnMarca.logoExtraido=a.url;result.adnMarca.logoAssetPath=a.path;}
 result.galeriaActivos=await Promise.all((result.galeriaActivos||[]).filter((a:any)=>mode!=='publish'||a.tipo==='OTRO').map(async(a:any)=>{const im=await image(a.url,a.assetPath);return{...a,url:im.url,assetPath:im.path,archivo:undefined};}));
 return result;
}
export async function saveCampaignRemote(c:Omit<RemoteCampaign,'id'|'owner_id'|'created_at'|'updated_at'> & {id?:string;localId?:string}):Promise<PersistResult>{
 try{const{sb,user}=await session();let existing:RemoteCampaign|null=null;
  if(uuid(c.id)){const r=await sb.from('escaparates_campaigns').select('*').eq('id',c.id!).eq('owner_id',user.id).maybeSingle();if(r.error)throw r.error;existing=r.data;}
  const localId=c.localId||c.id||crypto.randomUUID();
  if(!existing){const r=await sb.from('escaparates_campaigns').select('*').eq('owner_id',user.id).eq('local_id',localId).maybeSingle();if(r.error)throw r.error;existing=r.data;}
  if(!existing){const r=await sb.from('escaparates_campaigns').upsert({owner_id:user.id,local_id:localId,name:c.name,slug:c.slug,plan:c.plan,status:'draft'},{onConflict:'owner_id,local_id'}).select('*').single();if(r.error)throw r.error;existing=r.data;}
  if(!existing)throw new Error('No se pudo crear la campaña.');
  const snapshot=await assets(c.snapshot,user.id,existing.id,'save');
  const{data,error}=await sb.from('escaparates_campaigns').update({name:c.name,slug:c.slug,plan:c.plan,snapshot}).eq('id',existing.id).eq('owner_id',user.id).select('*').single();if(error)throw error;
  return{success:true,error:null,data};
 }catch(e){return fail(e);}
}
export async function loadCampaignsRemote():Promise<{data:RemoteCampaign[];error:string|null}>{
 try{const{sb,user}=await session();const{data,error}=await sb.from('escaparates_campaigns').select('*').eq('owner_id',user.id).order('updated_at',{ascending:false});if(error)throw error;const rows=await Promise.all((data||[]).map(async c=>({...c,snapshot:await assets(c.snapshot,user.id,c.id,'open')})));return{data:rows,error:null};}catch(e){return{data:[],error:fail(e).error};}
}
export async function publishCampaign(id:string,slug:string):Promise<PersistResult>{
 try{if(!/^[a-z0-9][a-z0-9-]{1,100}$/.test(slug))throw new Error('La dirección necesita entre 2 y 101 letras minúsculas, números o guiones.');
 const{sb,user}=await session();const{data:c,error:read}=await sb.from('escaparates_campaigns').select('*').eq('id',id).eq('owner_id',user.id).single();if(read||!c)throw read||new Error('Campaña no encontrada.');
 if(!c.snapshot?.datosEscaparate)throw new Error('Completa el escaparate antes de publicar.');
 const payload=sanearPayloadPublico(await assets(c.snapshot,user.id,id,'publish'));
 const{error}=await sb.from('escaparates_published').upsert({campaign_id:id,owner_id:user.id,slug,payload,plan:c.plan,published_at:new Date().toISOString()},{onConflict:'campaign_id'});if(error)throw error;
 const update=await sb.from('escaparates_campaigns').update({status:'active',slug}).eq('id',id).eq('owner_id',user.id);if(update.error)throw update.error;
 return{success:true,error:null};}catch(e){return fail(e);}
}
export async function unpublishCampaign(id:string):Promise<PersistResult>{
 try{const{sb,user}=await session();const{error}=await sb.from('escaparates_published').delete().eq('campaign_id',id).eq('owner_id',user.id);if(error)throw error;
 const prefix=`${user.id}/${id}`;const list=await sb.storage.from('escaparates-public').list(prefix,{limit:1000});if(list.error)throw list.error;
 if(list.data.length){const remove=await sb.storage.from('escaparates-public').remove(list.data.map(x=>`${prefix}/${x.name}`));if(remove.error)throw remove.error;}
 const update=await sb.from('escaparates_campaigns').update({status:'draft'}).eq('id',id).eq('owner_id',user.id);if(update.error)throw update.error;return{success:true,error:null};}catch(e){return fail(e);}
}
export async function deleteCampaignRemote(id:string):Promise<PersistResult>{const result=await unpublishCampaign(id);if(!result.success)return result;try{const{sb,user}=await session();const{error}=await sb.from('escaparates_campaigns').delete().eq('id',id).eq('owner_id',user.id);if(error)throw error;return{success:true,error:null};}catch(e){return fail(e);}}
export async function loadPublishedBySlug(slug:string):Promise<{data:PublishedEscaparate|null;error:string|null}>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return{data:null,error:'Supabase no está configurado.'};
 try{const{createClient:publicClient}=await import('@supabase/supabase-js');const sb=publicClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const{data,error}=await sb.from('escaparates_published').select('slug,payload,plan,published_at,updated_at').eq('slug',slug).maybeSingle();if(error)throw error;return{data,error:data?null:'NOT_FOUND'};}catch(e){return{data:null,error:fail(e).error};}
}
