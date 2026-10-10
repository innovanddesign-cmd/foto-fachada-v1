import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { commercialDB } from '@/lib/commercial/server';
import { isAIOperation } from '@/lib/commercial/credits';
export async function GET(req: Request) {
  const access = await requireAIUser(req); if (access.response) return access.response;
  try {
    const p=new URL(req.url).searchParams,op=p.get('operation')||'analysis',campaign=p.get('campaignId'),initial=p.get('initial')==='true';
    if(!isAIOperation(op)||(campaign&&!/^[0-9a-f-]{36}$/i.test(campaign)))return NextResponse.json({error:'Solicitud inválida'},{status:400});
    const sql=commercialDB();
    let [r]=await sql`select private.innova_ai_quote(${access.userId!}::uuid,${op},${campaign}::uuid,${initial}) as quote`;
    if(initial&&!r.quote.available&&r.quote.initialUsed)[r]=await sql`select private.innova_ai_quote(${access.userId!}::uuid,${op},${campaign}::uuid,false) as quote`;
    if(!r.quote.available)return NextResponse.json({error:'No tienes una generación incluida disponible. Puedes editar manualmente o activar un plan para regenerar.'},{status:403});
    return NextResponse.json(r.quote,{headers:{'Cache-Control':'no-store'}});
  } catch { return NextResponse.json({error:'No se pudo consultar el coste. Puedes continuar sin IA.'}, {status:503}); }
}
