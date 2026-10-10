import { PLANS } from './catalog';
import { CREDIT_POLICY } from './credits';
export type OrderInput = { kind: 'plan' | 'credits'; product: string; billing: 'monthly' | 'annual'; mode: 'test' | 'manual' };
export function orderSelection(input: unknown): OrderInput | null {
  if (!input || typeof input !== 'object') return null;
  const b = input as Record<string, unknown>;
  if (!['test','manual'].includes(String(b.mode)) || !['monthly','annual'].includes(String(b.billing))) return null;
  if (b.kind === 'plan' && ['PRO','BUSINESS'].includes(String(b.product)) || b.kind === 'credits' && CREDIT_POLICY.packs.some(p=>p.id===b.product)) return b as OrderInput;
  return null;
}
export function orderPrice(input: OrderInput) {
  const pack = CREDIT_POLICY.packs.find(p=>p.id===input.product);
  const plan = PLANS[input.product as 'PRO'|'BUSINESS'];
  // Annual launch eligibility is confirmed with the customer before accepting payment.
  const netCents = input.kind === 'credits' ? pack!.netCents : (input.billing === 'annual' ? plan.launchAnnual : plan.monthly) * 100;
  return { netCents, taxCents: Math.round(netCents * .21), credits: pack?.credits || 0 };
}
export const ORDER_STATES: Record<string,string> = { requested:'Solicitud recibida', awaiting_payment:'Pendiente de pago', payment_review:'Pago comunicado · pendiente de verificar', fulfilled:'Activado', cancelled:'Cancelado', test_succeeded:'Prueba completada · sin cobro', test_failed:'Pago de prueba rechazado' };
export type CustomerOrder = OrderInput & { id:string; owner_id?:string; state:string; net_cents:number; tax_cents:number; credits:number; created_at:string; instructions:string; customer_note:string };
