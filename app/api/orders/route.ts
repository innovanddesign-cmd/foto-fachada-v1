import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { commercialDB, accountSummary } from '@/lib/commercial/server';
import { orderSelection, orderPrice } from '@/lib/commercial/orders';
const headers = { 'Cache-Control':'private, no-store' };
export async function GET(req:Request) {
  const a=await requireAIUser(req); if(a.response)return a.response;
  try { const sql=commercialDB(); const orders=await sql`select id,kind,product,billing,mode,state,net_cents,tax_cents,credits,created_at,instructions,customer_note from private.innova_orders where owner_id=${a.userId!}::uuid order by created_at desc limit 50`; return NextResponse.json({orders},{headers}); }
  catch { return NextResponse.json({error:'No se pudieron cargar tus pedidos. Vuelve a intentarlo.'},{status:503,headers}); }
}
export async function POST(req:Request) {
  const a=await requireAIUser(req); if(a.response)return a.response;
  if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403,headers});
  try {
    const raw=await req.text(); if(raw.length>4000)return NextResponse.json({error:'Solicitud demasiado grande'},{status:413,headers});
    const b=JSON.parse(raw), selection=orderSelection(b);
    if(!selection || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId||''))return NextResponse.json({error:'Revisa el plan o recarga seleccionado.'},{status:400,headers});
    if(selection.kind==='credits' && selection.mode==='manual' && !(await accountSummary(a.userId!)).canTopUp)return NextResponse.json({error:'Las recargas requieren un plan de pago vigente, fuera del mes de gracia.'},{status:403,headers});
    const price=orderPrice(selection), sql=commercialDB();
    const order=await sql.begin(async tx=>{
      await tx`select pg_advisory_xact_lock(hashtextextended(${a.userId!}::text,815))`;
      const [prior]=await tx`select * from private.innova_orders where owner_id=${a.userId!}::uuid and request_id=${b.requestId}::uuid`;
      if(prior)return prior;
      const [count]=await tx`select count(*)::int as n from private.innova_orders where owner_id=${a.userId!}::uuid and created_at>now()-interval '1 day'`;
      if(count.n>=20)throw Error('LIMIT');
      const [pending]=await tx`select * from private.innova_orders where owner_id=${a.userId!}::uuid and mode=${selection.mode} and kind=${selection.kind} and product=${selection.product} and billing=${selection.billing} and state in ('requested','awaiting_payment','payment_review')`;
      if(pending)return pending;
      const [created]=await tx`insert into private.innova_orders(owner_id,request_id,kind,product,billing,mode,net_cents,tax_cents,credits) values(${a.userId!}::uuid,${b.requestId}::uuid,${selection.kind},${selection.product},${selection.billing},${selection.mode},${price.netCents},${price.taxCents},${price.credits}) returning *`;
      return created;
    });
    return NextResponse.json({order},{headers});
  } catch(e) { return NextResponse.json({error:e instanceof Error&&e.message==='LIMIT'?'Has alcanzado el límite diario de solicitudes. Consulta tus pedidos abiertos.':'No se pudo registrar el pedido. Puedes reintentar sin duplicarlo.'},{status:409,headers}); }
}
export async function PATCH(req:Request) {
  const a=await requireAIUser(req); if(a.response)return a.response;
  if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403,headers});
  try {
    const raw=await req.text();if(raw.length>4000)throw Error();const b=JSON.parse(raw);
    if(!/^[0-9a-f-]{36}$/i.test(b.id||'')||!['test_success','test_failure','cancel','payment_sent'].includes(b.action))throw Error();
    const sql=commercialDB(); const order=await sql.begin(async tx=>{
      const [o]=await tx`select * from private.innova_orders where id=${b.id}::uuid and owner_id=${a.userId!}::uuid for update`;
      if(!o)throw Error();
      let state:string;
      if(b.action.startsWith('test_') && o.mode==='test' && ['requested','test_failed'].includes(o.state))state=b.action==='test_success'?'test_succeeded':'test_failed';
      else if(b.action==='cancel'&&['requested','awaiting_payment'].includes(o.state))state='cancelled';
      else if(b.action==='payment_sent'&&o.mode==='manual'&&o.state==='awaiting_payment'&&typeof b.note==='string'&&b.note.trim().length>=3&&b.note.length<=500)state='payment_review';
      else throw Error();
      const [updated]=await tx`update private.innova_orders set state=${state},customer_note=${b.action==='payment_sent'?b.note.trim():o.customer_note},updated_at=now() where id=${o.id}::uuid returning *`;return updated;
    });
    // Test payments NEVER create contracts, grant credits, or change paid entitlements.
    return NextResponse.json({order},{headers});
  }catch{return NextResponse.json({error:'No se pudo actualizar este pedido. Actualiza la página y comprueba su estado.'},{status:409,headers});}
}
