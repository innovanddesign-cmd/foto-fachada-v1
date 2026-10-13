import { NextResponse } from 'next/server';
import { commercialDB } from '@/lib/commercial/server';
import { paddleReady,paddleAPI,verifyPaddleSignature,validCompletedTransaction } from '@/lib/payments/paddle';
export const runtime='nodejs';
export async function POST(req:Request) {
 if(!paddleReady())return NextResponse.json({error:'Unavailable'},{status:503});
 const raw=await req.text();
 if(raw.length>262144)return NextResponse.json({error:'Too large'},{status:413});
 if(!verifyPaddleSignature(raw,req.headers.get('paddle-signature'),process.env.PADDLE_WEBHOOK_SECRET!))return NextResponse.json({error:'Invalid signature'},{status:401});
 try {
  const e=JSON.parse(raw);
  if(!/^evt_[a-z0-9]{26}$/.test(e.event_id||'')||!Number.isFinite(Date.parse(e.occurred_at)))return NextResponse.json({error:'Invalid event'},{status:400});
  if(e.event_type!=='transaction.completed')return NextResponse.json({received:true,ignored:true});
  const id=e.data?.id;if(!/^txn_[a-z0-9]{26}$/.test(id||''))throw Error();
  const sql=commercialDB();const prior=await sql`select event_id from private.innova_paddle_events where event_id=${e.event_id}`;
  if(prior.length)return NextResponse.json({received:true});
  const t=await paddleAPI('/transactions/'+id),sessionId=t?.custom_data?.innova_session;
  if(!/^[a-f0-9-]{36}$/i.test(sessionId||''))return NextResponse.json({received:true,ignored:true});
  await sql.begin(async tx=>{
   const [s]=await tx`select * from private.innova_paddle_sessions where id=${sessionId}::uuid for update`;
   if(!s||!validCompletedTransaction(t,s))throw Error();
   await tx`insert into private.innova_paddle_events(event_id,event_type,session_id,occurred_at) values(${e.event_id},${e.event_type},${s.id}::uuid,${e.occurred_at}::timestamptz) on conflict(event_id) do nothing`;
   await tx`update private.innova_paddle_sessions set transaction_id=${id},subscription_id=${t.subscription_id||null},state='completed',updated_at=now() where id=${s.id}::uuid`;
   // No production grants: sandbox transactions cannot mutate real contracts or credits.
  });
  return NextResponse.json({received:true});
 }catch{return NextResponse.json({error:'Processing failed; retry delivery'},{status:503});}
}
