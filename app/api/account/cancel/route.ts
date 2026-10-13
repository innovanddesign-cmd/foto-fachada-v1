import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { commercialDB } from '@/lib/commercial/server';
export async function POST(req: Request) {
  const access=await requireAIUser(req); if(access.response)return access.response;
  if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403});
  try {const sql=commercialDB();const rows=await sql`update private.innova_accounts set cancel_at_end=true,launch_eligible=false,updated_at=now() where owner_id=${access.userId!}::uuid and plan<>'FREE' and paid_until>now() returning owner_id`;if(!rows.length)return NextResponse.json({error:'No tienes una suscripción de pago vigente que dar de baja.'},{status:409});return NextResponse.json({success:true,message:'Baja programada al terminar el periodo pagado. Después conservarás Free.'});}
  catch{return NextResponse.json({error:'No se pudo registrar la baja. Contacta con INNOVA.'},{status:503});}
}
