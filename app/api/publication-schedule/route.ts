import {NextResponse} from 'next/server';
import {requireAIUser} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
import {sanearPayloadPublico} from '@/lib/supabase/sanitize';
const headers={'Cache-Control':'private, no-store'};
export async function GET(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 try{const sql=commercialDB();const schedules=await sql`select campaign_id,revision,slug,due_at,timezone,state,attempts,result,published_at from private.innova_publication_schedule where owner_id=${a.userId!}::uuid order by due_at desc limit 100`;return NextResponse.json({schedules},{headers});}
 catch{return NextResponse.json({error:'No se pudieron consultar las publicaciones programadas.'},{status:503,headers});}
}
export async function POST(req:Request){
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403,headers});
 try{
  const raw=await req.text();if(raw.length>262144)return NextResponse.json({error:'Versión demasiado grande.'},{status:413,headers});
  const b=JSON.parse(raw),sql=commercialDB();
  if(!/^[0-9a-f-]{36}$/i.test(b.campaignId||''))throw Error();
  if(b.action==='cancel'){const [r]=await sql`select private.innova_cancel_schedule(${a.userId!}::uuid,${b.campaignId}::uuid) as cancelled`;return NextResponse.json(r,{headers});}
  if(process.env.INNOVA_SCHEDULING_ENABLED!=='true')return NextResponse.json({error:'Publicación programada pendiente de activación.'},{status:503,headers});
  // The supplied UTC offset disambiguates repeated local hours at daylight-saving transitions.
  if(b.action!=='schedule'||b.confirmed!==true||typeof b.timezone!=='string'||typeof b.dueAt!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(b.dueAt)||!Number.isFinite(Date.parse(b.dueAt)))throw Error();
  new Intl.DateTimeFormat('es-ES',{timeZone:b.timezone});
  const payload=sanearPayloadPublico(b.payload||{});
  const [r]=await sql`select private.innova_schedule_publication(${a.userId!}::uuid,${b.campaignId}::uuid,${b.slug},${JSON.stringify(payload)}::jsonb,${b.dueAt}::timestamptz,${b.timezone}) as revision`;
  return NextResponse.json(r,{headers});
 }catch{return NextResponse.json({error:'No se pudo programar. Revisa la versión, fecha, zona horaria, permisos y capacidad.'},{status:409,headers});}
}
