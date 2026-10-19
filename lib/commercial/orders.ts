import { PLANS } from './catalog';
import { CREDIT_POLICY } from './credits';
export type OrderInput = { kind: 'plan' | 'credits' | 'campaign'; product: string; billing: 'monthly' | 'annual' | 'once'; mode: 'test' | 'manual' };
export function orderSelection(input: unknown): OrderInput | null {
  if (!input || typeof input !== 'object') return null;
  const b = input as Record<string, unknown>;
  if (!['test','manual'].includes(String(b.mode))) return null;
  if (b.kind==='campaign' && b.billing==='once' && typeof b.product==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.product)) return b as OrderInput;
  if (!['monthly','annual'].includes(String(b.billing))) return null;
  if (b.kind === 'plan' && ['BASIC','PRO','BUSINESS'].includes(String(b.product)) || b.kind === 'credits' && CREDIT_POLICY.packs.some(p=>p.id===b.product)) return b as OrderInput;
  return null;
}
export function orderPrice(input: OrderInput) {
  if(input.kind==='campaign')return {netCents:4000,taxCents:840,credits:0};
  const pack = CREDIT_POLICY.packs.find(p=>p.id===input.product);
  const plan = PLANS[input.product as 'BASIC'|'PRO'|'BUSINESS'];
  // Public fallback is the normal price. Only the server can quote a launch concession.
  const netCents = input.kind === 'credits' ? pack!.netCents : (input.billing === 'annual' ? plan.annual : plan.monthly) * 100;
  return { netCents, taxCents: Math.round(netCents * .21), credits: pack?.credits || 0 };
}
export const ORDER_STATES: Record<string,string> = { requested:'Solicitud recibida', awaiting_payment:'Pendiente de pago', payment_review:'Pago comunicado · pendiente de verificar', fulfilled:'Activado', cancelled:'Cancelado', test_succeeded:'Prueba completada · sin cobro', test_failed:'Pago de prueba rechazado' };
export type CustomerOrder = OrderInput & { id:string; owner_id?:string; state:string; net_cents:number; tax_cents:number; credits:number; created_at:string; instructions:string; customer_note:string };
