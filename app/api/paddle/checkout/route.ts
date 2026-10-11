import { NextResponse } from 'next/server';
import { requireAIUser } from '@/lib/ai/access';
import { commercialDB } from '@/lib/commercial/server';
import { paddleReady,paddleSelection,paddleAPI,validatePrice } from '@/lib/payments/paddle';
const headers={'Cache-Control':'private, no-store'};
export async function GET(req:Request) {
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(!paddleReady())return NextResponse.json({configured:false,sessions:[]},{headers});
 try {const sql=commercialDB();const sessions=await sql`select id,kind,product,billing,state,transaction_id,created_at from private.innova_paddle_sessions where owner_id=${a.userId!}::uuid order by created_at desc limit 20`;
 return NextResponse.json({configured:true,environment:'sandbox',clientToken:process.env.PADDLE_CLIENT_TOKEN,sessions},{headers});
 }catch{return NextResponse.json({error:'No se pudo consultar Paddle.'},{status:503,headers});}
}
export async function POST(req:Request) {
 const a=await requireAIUser(req);if(a.response)return a.response;
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Origen no permitido'},{status:403,headers});
 if(!paddleReady())return NextResponse.json({error:'Paddle Sandbox está pendiente de configuración.'},{status:503,headers});
 try {
  const raw=await req.text();if(raw.length>4000)throw Error();const b=JSON.parse(raw);
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(b.requestId||''))throw Error();
  const {selection,priceId,netCents}=paddleSelection(b);
  const sql=commercialDB();
  const reserved=await sql.begin(async tx=>{
   await tx`select pg_advisory_xact_lock(hashtextextended(${a.userId!}::text,816))`;
   const [prior]=await tx`select * from private.innova_paddle_sessions where owner_id=${a.userId!}::uuid and request_id=${b.requestId}::uuid`;
   if(prior){if(prior.kind!==selection.kind||prior.product!==selection.product||prior.billing!==selection.billing)throw Error();return {session:prior,created:false};}
   const [count]=await tx`select count(*)::int as n from private.innova_paddle_sessions where owner_id=${a.userId!}::uuid and created_at>now()-interval '1 day'`;
   if(count.n>=10)throw Error();
   const [session]=await tx`insert into private.innova_paddle_sessions(owner_id,request_id,kind,product,billing,price_id,net_cents) values(${a.userId!}::uuid,${b.requestId}::uuid,${selection.kind},${selection.product},${selection.billing},${priceId},${netCents}) returning *`;
   return {session,created:true};
  });
  const s=reserved.session;
  if(!reserved.created){if(s.transaction_id&&s.state==='ready')return NextResponse.json({transactionId:s.transaction_id},{headers});return NextResponse.json({error:'Esta operación está en proceso o ya terminó. Consulta su estado; no se duplicará.'},{status:409,headers});}
  validatePrice(await paddleAPI('/prices/'+priceId),selection,netCents);
  // Reserve before the remote call. An uncertain network outcome is not retried as a new payment.
  const t=await paddleAPI('/transactions',{items:[{price_id:priceId,quantity:1}],currency_code:'EUR',collection_mode:'automatic',custom_data:{innova_session:s.id,innova_nonce:s.nonce}});
  if(!/^txn_[a-z0-9]{26}$/.test(t?.id||''))throw Error();
  await sql`update private.innova_paddle_sessions set transaction_id=${t.id},state=case when state='creating' then 'ready' else state end,updated_at=now() where id=${s.id}::uuid and (transaction_id is null or transaction_id=${t.id})`;
  return NextResponse.json({transactionId:t.id},{headers});
 }catch{return NextResponse.json({error:'No se pudo preparar el pago. Comprueba el estado antes de reintentar. No se ha activado ningún plan.'},{status:409,headers});}
}
