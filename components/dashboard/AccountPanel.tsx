'use client';
import { useEffect, useRef, useState } from 'react';
import { CREDIT_POLICY } from '@/lib/commercial/credits';
import { createClient } from '@/lib/supabase/client';
type Account = { plan: string; activeLimit: number; active: number; locked: number; cancelAtEnd: boolean; canTopUp:boolean; balanceFrozen:boolean; balance: number; monthlyCredits: number | null; operationCost: number | null; paidUntil: string | null; nextCreditAt: string | null; status: string; history: { amount: number; reason: string; created_at: string }[] };
export function AccountPanel() {
  const [account, setAccount] = useState<Account | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return;
    const tracker = generation;
    const { data } = createClient().auth.onAuthStateChange(() => { generation.current++; setAccount(null); setConfirmCancel(false); });
    return () => { tracker.current++; data.subscription.unsubscribe(); };
  }, []);
  async function cancel() {
    setBusy(true); setError('');
    try { const r = await fetch('/api/account/cancel', { method: 'POST' }); const a = await r.json(); if (!r.ok) throw new Error(a.error); setConfirmCancel(false); await load(); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo registrar la baja.'); } finally { setBusy(false); }
  }
  async function load() {
    setBusy(true); setError(''); const version = generation.current;
    try { const r = await fetch('/api/account', { cache: 'no-store' }); const a = await r.json(); if (!r.ok) throw new Error(a.error); if (version === generation.current) setAccount(a); }
    catch(e) { setError(e instanceof Error ? e.message : 'No se pudo conectar.'); } finally { setBusy(false); }
  }
  return <section className="studio-panel space-y-4"><h2 className="text-xl font-semibold">Tu plan y créditos IA</h2><p className="studio-muted">Las campañas activas y los créditos son límites distintos. La generación inicial incluida y la edición manual no consumen créditos. Los créditos se usan para regenerar.</p><button className="studio-button" disabled={busy} onClick={load}>{busy ? 'Consultando…' : 'Consultar mi saldo'}</button>{error && <p role="alert" className="studio-notice">{error}</p>}{account && <>
    <dl className="grid sm:grid-cols-3 gap-4"><div><dt>Plan</dt><dd className="text-2xl">{account.plan}</dd></div><div><dt>Campañas publicadas</dt><dd className="text-2xl">{account.active} / {account.activeLimit}</dd></div><div><dt>Créditos disponibles</dt><dd className="text-2xl">{account.balance}</dd></div></dl>
    {account.locked > 0 && <p className="studio-notice">🔒 {account.locked} publicaciones conservadas están bloqueadas por el límite actual. Solicita ampliar el plan para recuperarlas.</p>}
    {account.cancelAtEnd ? <p role="status">Baja programada al finalizar el periodo pagado.</p> : account.plan !== 'FREE' && <div><button className="studio-button" onClick={() => setConfirmCancel(true)}>Dar de baja la renovación</button>{confirmCancel && <div className="studio-notice"><p>Conservarás el servicio hasta terminar el periodo pagado. Después pasarás a Free y perderás la promoción de continuidad.</p><button className="studio-button" disabled={busy} onClick={cancel}>Confirmar baja al finalizar el periodo</button><button className="studio-button" onClick={() => setConfirmCancel(false)}>Volver</button></div>}</div>}
    {account.paidUntil && <p>Periodo pagado hasta {new Date(account.paidUntil).toLocaleDateString('es-ES')}.</p>}
    <p>{account.monthlyCredits === null ? 'Asignación de créditos pendiente de configurar en tu propuesta.' : `${account.monthlyCredits} créditos por mes de suscripción. El saldo se acumula.`}</p>
    {account.nextCreditAt && <p>Próxima asignación: {new Date(account.nextCreditAt).toLocaleDateString('es-ES')}.</p>}
    {account.balanceFrozen&&<p className="studio-notice">El saldo está congelado hasta reactivar un plan de pago.</p>}
    {account.canTopUp?<div><h3>Recargas · precios más IVA</h3><ul>{CREDIT_POLICY.packs.map(p=><li key={p.id}>{p.credits} créditos · {(p.netCents/100).toLocaleString('es-ES')} €</li>)}</ul><a className="studio-button" href="mailto:conta@innovandesign.com?subject=Solicitar%20recarga">Solicitar recarga</a></div>:<p>No se pueden comprar recargas en Free ni durante el mes de gracia.</p>}
    <p className="studio-muted text-sm">Las recargas se activan tras confirmar su precio y recibir el pago. Solicitar información no genera un cargo.</p>
    {account.history.length > 0 && <details><summary>Movimientos de créditos</summary><ul className="space-y-2 mt-3">{account.history.map((h,i) => <li key={i}>{new Date(h.created_at).toLocaleString('es-ES')} · {h.amount > 0 ? '+' : ''}{h.amount} · {h.reason}</li>)}</ul></details>}
  </>}</section>;
}
