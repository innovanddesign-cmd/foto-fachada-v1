import {NextResponse} from 'next/server';
import {requireAIUser,aiRequestId} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
import {freeProviderReady,generateFree,type FreeKind} from '@/lib/ai/free-provider';
export async function GET(){return NextResponse.json({text:freeProviderReady('text'),image:freeProviderReady('image'),logo:freeProviderReady('logo')},{headers:{'Cache-Control':'no-store'}});}
export async function POST(req:Request){
 const access=await requireAIUser(req);if(access.response)return access.response;
 const id=aiRequestId(req);if(!id)return NextResponse.json({error:'Solicitud inválida'},{status:400});
 let reserved=false;
 try{
  const raw=await req.text();if(raw.length>8000)return NextResponse.json({error:'Texto demasiado largo'},{status:413});
  const b=JSON.parse(raw);
  if(!['text','image','logo'].includes(b.kind)||typeof b.prompt!=='string'||!b.prompt.trim()||b.prompt.length>4000)return NextResponse.json({error:'Describe el contenido que necesitas'},{status:400});
  if(!freeProviderReady(b.kind))return NextResponse.json({error:'La IA gratuita está preparada, pendiente de conectar y validar el modelo. Puedes seguir editando manualmente.'},{status:503});
  const sql=commercialDB(),op='free_'+b.kind;
  const [r]=await sql`select private.innova_reserve_v2(${access.userId!}::uuid,${id}::uuid,${op},0,null,false) as state`;
  if(r.state!=='reserved')return NextResponse.json({error:'Espera antes de volver a generar. No se han descontado créditos.'},{status:429});
  reserved=true;
  const result=await generateFree(b.kind as FreeKind,b.prompt);
  const [done]=await sql`select private.innova_finish(${access.userId!}::uuid,${id}::uuid,true) as finished`;
  if(!done.finished)throw Error('FINALIZATION');
  return NextResponse.json({...result,cost:0},{headers:{'Cache-Control':'no-store'}});
 }catch{
  if(reserved){try{await commercialDB()`select private.innova_finish(${access.userId!}::uuid,${id}::uuid,false)`;}catch{}}
  return NextResponse.json({error:'El proveedor gratuito no está disponible. No se han descontado créditos. Puedes editar manualmente.'},{status:503});
 }
}
