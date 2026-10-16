import { NextResponse } from 'next/server';
import { requireOperator } from '@/lib/commercial/operator';
import { commercialDB } from '@/lib/commercial/server';
const headers = {'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
const uuid = (v:unknown) => typeof v==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const text = (v:unknown,max:number) => typeof v==='string' && v.trim().length>=3 && v.length<=max;
export async function POST(req:Request) {
 if(process.env.COMMERCIAL_DEMOS_ENABLED!=='true') return NextResponse.json({error:'Demos comerciales desactivadas'},{status:503,headers});
 const access=await requireOperator(req); if(access.response)return access.response;
 let b:any;
 try {
  const raw=await req.text(); if(raw.length>4096)return NextResponse.json({error:'Solicitud demasiado grande'},{status:413,headers});
  b=JSON.parse(raw);
  if(!b || typeof b!=='object' || !['create','version','publish','delivery','expire','read','link'].includes(b.action))throw Error();
  if(b.action==='create') {
   if(!text(b.reference,160)||!uuid(b.campaignId)||!['FREE','PRO','BUSINESS'].includes(b.plan)||b.customerOwnerId!=null&&!uuid(b.customerOwnerId))throw Error();
  }else if(!uuid(b.id))throw Error();
  if(b.action==='link'&&!uuid(b.customerOwnerId))throw Error();
  if(b.action==='version'&&(!uuid(b.campaignId)||!Number.isSafeInteger(b.expectedVersion)||b.expectedVersion<1))throw Error();
  if(b.action==='delivery'&&(!text(b.eventId,160)||!text(b.evidenceRef,500)))throw Error();
 }catch{return NextResponse.json({error:'Datos de demo no válidos'},{status:400,headers});}
 try{
  const sql=commercialDB();
  const [row]=await sql`select private.innova_demo_action(${b.action},${sql.json(b)}::jsonb) as demo`;
  return NextResponse.json({demo:row.demo},{headers});
 }catch{return NextResponse.json({error:'No se pudo completar la operación. Revisa la versión, la publicación y las referencias.'},{status:409,headers});}
}
