'use client';
import { useState } from 'react';
import { CREDIT_POLICY } from '@/lib/commercial/credits';

export function OperatorTopUp() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/operator/credits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: fields.get('ownerId'), pack: fields.get('pack'), netCents: CREDIT_POLICY.packs.find(p=>p.id===fields.get('pack'))?.netCents, paymentReference: fields.get('paymentReference') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage('Recarga registrada una vez y añadida al historial del cliente.');
      form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo registrar la recarga.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="studio-panel space-y-4 max-w-3xl mt-8">
    <h2 className="text-xl font-semibold">Registrar una recarga ya pagada</h2>
    <p className="studio-notice">Introduce solo los créditos acordados en una propuesta aceptada y cuyo pago hayas comprobado. No se realiza ningún cobro desde aquí.</p>
    <label className="studio-field">Identificador de cuenta del cliente<input name="ownerId" required pattern="[0-9a-fA-F-]{36}" /></label>
    <label className="studio-field">Pack pagado<select name="pack">{CREDIT_POLICY.packs.map(p=><option key={p.id} value={p.id}>{p.credits} créditos · {p.netCents/100} € + IVA</option>)}</select></label>
    <label className="studio-field">Referencia única del justificante<input name="paymentReference" minLength={3} maxLength={160} required /></label>
    <label className="flex gap-3"><input type="checkbox" required />He comprobado la propuesta, el pago recibido y la cuenta del cliente.</label>
    <button className="studio-primary" disabled={busy}>{busy ? 'Registrando…' : 'Registrar recarga verificada'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
