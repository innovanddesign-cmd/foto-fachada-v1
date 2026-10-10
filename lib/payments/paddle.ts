import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { orderPrice, orderSelection, type OrderInput } from '@/lib/commercial/orders';

// Sandbox is deliberately isolated from real account balances and subscriptions.
export function paddleReady() {
  return process.env.PADDLE_ENVIRONMENT === 'sandbox' && Boolean(process.env.PADDLE_API_KEY && process.env.PADDLE_WEBHOOK_SECRET && process.env.PADDLE_CLIENT_TOKEN?.startsWith('test_'));
}
export function paddleSelection(value: unknown) {
  const b = value && typeof value === 'object' ? value as Record<string,unknown> : {};
  const selection = orderSelection({...b, mode:'test'});
  if (!selection) throw Error('INVALID_SELECTION');
  const key = selection.kind === 'plan' ? `${selection.product}_${selection.billing.toUpperCase()}` : `CREDITS_${selection.product.toUpperCase()}`;
  const priceId = process.env[`PADDLE_PRICE_${key}`];
  if (!/^pri_[a-z0-9]{26}$/.test(priceId || '')) throw Error('PRICE_NOT_CONFIGURED');
  return {selection, priceId:priceId!, netCents:orderPrice(selection).netCents};
}
export async function paddleAPI(path:string, body?:unknown) {
  if (!paddleReady()) throw Error('PADDLE_NOT_CONFIGURED');
  const r = await fetch(`https://sandbox-api.paddle.com${path}`, {
    method:body ? 'POST':'GET', headers:{Authorization:`Bearer ${process.env.PADDLE_API_KEY}`, 'Content-Type':'application/json', 'Paddle-Version':'1'},
    ...(body ? {body:JSON.stringify(body)}:{}), signal:AbortSignal.timeout(20000), cache:'no-store',
  });
  if (!r.ok) throw Error('PADDLE_UNAVAILABLE');
  return (await r.json()).data;
}
export function validatePrice(p:any, selection:OrderInput, netCents:number) {
  const cycle=p?.billing_cycle;
  if (p?.status!=='active' || p?.unit_price?.currency_code!=='EUR' || p?.unit_price?.amount!==String(netCents) || p?.tax_mode!=='external'
      || (selection.kind==='plan' ? cycle?.frequency!==1 || cycle?.interval!==(selection.billing==='annual'?'year':'month') : cycle!=null)) throw Error('PRICE_MISMATCH');
}
export function verifyPaddleSignature(raw:string, header:string|null, secret:string, now=Date.now()) {
  if(!secret || !header || header.length>2048)return false;
  const parts=header.split(';').map(x=>x.trim().split('='));
  const times=parts.filter(([k])=>k==='ts');
  if(times.length!==1 || !/^\d{10}$/.test(times[0][1]||''))return false;
  const ts=Number(times[0][1]);
  if(Math.abs(now/1000-ts)>300)return false;
  const expected=createHmac('sha256',secret).update(`${ts}:${raw}`).digest();
  return parts.some(([key,value])=>key==='h1'&&/^[a-f0-9]{64}$/i.test(value||'')&&timingSafeEqual(expected,Buffer.from(value,'hex')));
}
export function validCompletedTransaction(t:any, session:any) {
  return t?.status==='completed' && /^txn_[a-z0-9]{26}$/.test(t.id||'') && (!session.transaction_id || session.transaction_id===t.id)
    && t.custom_data?.innova_session===session.id && t.custom_data?.innova_nonce===session.nonce
    && t.currency_code==='EUR' && Array.isArray(t.items) && t.items.length===1 && t.items[0].quantity===1
    && t.items[0].price?.id===session.price_id && t.items[0].price?.unit_price?.amount===String(session.net_cents)
    && t.discount_id==null && t.details?.totals?.discount==='0' && t.details?.totals?.subtotal===String(session.net_cents);
}
