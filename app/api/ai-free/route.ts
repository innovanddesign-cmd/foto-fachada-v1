import {sectorPrompt} from '@/lib/marketing/sectors';
import {NextResponse} from 'next/server';
import {requireAIUser,aiRequestId} from '@/lib/ai/access';
import {commercialDB} from '@/lib/commercial/server';
import {freeProviderReady,generateFree,type FreeKind} from '@/lib/ai/free-provider';
const headers={'Cache-Control':'no-store'};
export async function GET(req:Request){
 const access=await requireAIUser(req);if(access.response)return access.response;
 try{
  const sql=commercialDB();
  const [row]=await sql`select private.innova_ai_quote(${access.userId!}::uuid,'free_text',null,false) as text_quote, private.innova_ai_quote(${access.userId!}::uuid,'free_image',null,false) as image_quote`;
  return NextResponse.json({text:freeProviderReady('text')&&row.text_quote.available,image:freeProviderReady('image')&&row.image_quote.available,logo:freeProviderReady('logo')&&row.image_quote.available,costs:{text:row.text_quote.cost,image:row.image_quote.cost,logo:row.image_quote.cost},balance:row.text_quote.balance},{headers});
 }catch{return NextResponse.json({error:'No se pudo consultar tu saldo y permisos.'},{status:503,headers});}
}
export async function POST(req:Request){
 const access=await requireAIUser(req);if(access.response)return access.response;
 const id=aiRequestId(req);if(!id)return NextResponse.json({error:'Solicitud inválida'},{status:400,headers});
 let reserved=false;
 try{
  const raw=await req.text();if(raw.length>8000)return NextResponse.json({error:'Texto demasiado largo'},{status:413,headers});
  let b;try{b=JSON.parse(raw);}catch{return NextResponse.json({error:'Solicitud inválida'},{status:400,headers});}
  if(!b||!['text','image','logo'].includes(b.kind)||typeof b.prompt!=='string'||!b.prompt.trim()||b.prompt.length>4000)return NextResponse.json({error:'Describe el contenido que necesitas'},{status:400,headers});
  if(!Number.isSafeInteger(b.expectedCost)||b.expectedCost<0)return NextResponse.json({error:'Consulta y confirma el coste antes de generar.'},{status:409,headers});
  if(!freeProviderReady(b.kind))return NextResponse.json({error:'Esta herramienta no está disponible. Puedes seguir editando manualmente.'},{status:503,headers});
  const sql=commercialDB(),op='free_'+b.kind;
  const [r]=await sql`select private.innova_reserve_v2(${access.userId!}::uuid,${id}::uuid,${op},${b.expectedCost},null,false) as state`;
  if(r.state!=='reserved'){
   const error=r.state==='price_changed'?'El coste ha cambiado. Recarga y confirma la tarifa.':r.state==='unavailable'?'Tu plan actual no permite esta operación.':r.state==='quota'?'No tienes créditos suficientes. Puedes seguir editando manualmente.':'Espera antes de volver a generar. No se ha creado otro cargo.';
   return NextResponse.json({error},{status:r.state==='unavailable'?403:r.state==='price_changed'||r.state==='duplicate'?409:429,headers});
  }
  reserved=true;
  const result=await generateFree(b.kind as FreeKind,sectorPrompt(b.sectorBrief)+'\n'+b.prompt);
  const [done]=await sql`select private.innova_finish(${access.userId!}::uuid,${id}::uuid,true) as finished`;
  if(!done.finished)throw Error('FINALIZATION');
  return NextResponse.json({...result,cost:b.expectedCost},{headers});
 }catch{
  let refunded=false;
  if(reserved){try{const [done]=await commercialDB()`select private.innova_finish(${access.userId!}::uuid,${id}::uuid,false)`;refunded=done.finished===true;}catch{}}
  return NextResponse.json({error:reserved&&!refunded?'No se pudo confirmar el resultado. La operación requiere revisión; conserva la referencia.':refunded?'La generación ha fallado y se han devuelto tus créditos.':'No se pudo generar. No se ha confirmado ningún cargo.',requestId:id},{status:503,headers});
 }
}
