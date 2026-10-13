import {NextResponse} from 'next/server';
import {requireOperator} from '@/lib/commercial/operator';
import {commercialDB} from '@/lib/commercial/server';
const headers={'Cache-Control':'private, no-store'};
export async function POST(req:Request){
 const a=await requireOperator(req);if(a.response)return a.response;
 try{const raw=await req.text();if(raw.length>6000)throw Error();const b=JSON.parse(raw),sql=commercialDB();
 if(b.action==='list'){const orders=await sql`select * from private.innova_orders order by created_at desc limit 100`;return NextResponse.json({orders},{headers});}
 if(!/^[0-9a-f-]{36}$/i.test(b.id||''))throw Error();
 await sql.begin(async tx=>{
  const [o]=await tx`select * from private.innova_orders where id=${b.id}::uuid for update`;
  if(!o||o.mode!=='manual'||!['requested','awaiting_payment','payment_review'].includes(o.state))throw Error();
  if(b.action==='instructions'&&typeof b.instructions==='string'&&b.instructions.trim().length>=10&&b.instructions.length<=4000){
   await tx`update private.innova_orders set instructions=${b.instructions.trim()},state=case when state='payment_review' then state else 'awaiting_payment' end,updated_at=now() where id=${o.id}::uuid`;
  }else if(b.action==='fulfill'&&typeof b.reference==='string'&&b.reference.length>=3&&b.reference.length<=160){
   // A status change alone must never manufacture a payment or entitlement.
   const proof=o.kind==='plan'?await tx`select reference from private.innova_contracts where owner_id=${o.owner_id}::uuid and reference=${b.reference} and plan=${o.product} and billing=${o.billing} and period_end>now()` :await tx`select reference from private.innova_ledger where owner_id=${o.owner_id}::uuid and reference=${'topup:'+b.reference} and amount=${o.credits}`;
   if(!proof.length)throw Error();
   const duplicate=await tx`select id from private.innova_orders where mode='manual' and fulfillment_reference=${b.reference} and state='fulfilled'`;
   if(duplicate.length)throw Error();
   await tx`update private.innova_orders set state='fulfilled',fulfillment_reference=${b.reference},updated_at=now() where id=${o.id}::uuid`;
  }else if(b.action==='cancel'&&o.state!=='payment_review'){await tx`update private.innova_orders set state='cancelled',updated_at=now() where id=${o.id}::uuid`;}
  else throw Error();
 });return NextResponse.json({success:true},{headers});
 }catch{return NextResponse.json({error:'No se pudo actualizar. Para completar un pedido, registra primero el contrato o recarga pagados con el mismo justificante y cliente.'},{status:409,headers});}
}
