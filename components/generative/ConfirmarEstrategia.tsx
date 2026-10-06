'use client';
import { useState } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { AIService } from '@/services/ai';
import { aplicarEstrategia, sugerirEstrategia, validarEstrategia, type EstrategiaConversion } from '@/lib/marketing/estrategia';

export function ConfirmarEstrategia() {
  const s = useTiendaEstado();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!s.adnMarca) return null;
  const plan = s.adnMarca.estrategiaConversion || sugerirEstrategia(s.adnMarca, s.datosEscaparate?.datosReales?.telefono);
  function update(key: keyof EstrategiaConversion, value: string) {
    s.actualizarAdn({ estrategiaConversion: {...plan, [key]: value, confirmadaEn: undefined} });
    setError('');
  }
  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issue = validarEstrategia(plan);
    if (issue) { setError(issue); return; }
    if (busy) return;
    setBusy(true); setError('');
    try {
      const current = useTiendaEstado.getState();
      const confirmed = {...plan, confirmadaEn: new Date().toISOString()};
      const adn = {...current.adnMarca!, publicoObjetivo: plan.publico.trim(), estrategiaConversion: confirmed,
        estrategiaPrincipal: (plan.objetivo === 'CITAS' ? 'CITA_PREVIA' : 'LEAD_MAGNET') as 'CITA_PREVIA' | 'LEAD_MAGNET'};
      const base = current.datosEscaparate || await AIService.generarEscaparate(adn);
      const datos = aplicarEstrategia(base, confirmed);
      if (current.datosEscaparate) {
        current.actualizarAdn(adn);
        current.regenerarEscaparate(datos);
        current.establecerPaso('ESCAPARATE');
      } else current.completarAnalisis(adn, datos);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la propuesta. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  const fields: {key: 'publico'|'motivoEscaneo'|'textoCartel'|'cta'|'mensajeWhatsApp'; label:string; max:number}[] = [
    {key:'publico',label:'¿A quién te diriges?',max:400},
    {key:'motivoEscaneo',label:'¿Qué obtiene al escanear?',max:400},
    {key:'textoCartel',label:'Texto del cartel',max:160},
    {key:'cta',label:'Texto del botón principal',max:70},
    {key:'mensajeWhatsApp',label:'Mensaje que se prepara en WhatsApp',max:500},
  ];
  return <form onSubmit={confirm} className="studio-panel max-w-2xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-semibold">Del escaneo a una conversación</h2><p className="studio-muted mt-2">Esta es una propuesta editable. Confirma que representa lo que ofreces antes de preparar el diseño.</p></div>
    <fieldset disabled={busy} className="space-y-5">
      <legend className="sr-only">Propuesta de tu escaparate</legend>
      <label className="studio-field">¿Qué quieres conseguir?<select value={plan.objetivo} onChange={e=>update('objetivo',e.target.value)}><option value="CITAS">Solicitudes de cita por WhatsApp</option><option value="CONSULTAS">Consultas por WhatsApp</option></select></label>
      {fields.map(({key,label,max})=><label key={key} className="studio-field">{label}<textarea required rows={key==='cta'?2:3} maxLength={max} value={plan[key]} onChange={e=>update(key,e.target.value)} /></label>)}
      <label className="studio-field">WhatsApp del negocio, con prefijo de país<input required type="tel" autoComplete="tel" value={plan.telefono} placeholder="+34 600 123 456" onChange={e=>update('telefono',e.target.value)} /></label>
    </fieldset>
    <p className="studio-notice">El visitante decide si envía el mensaje. Una solicitud no confirma una cita: la disponibilidad la confirma el negocio. Incluye solo servicios e incentivos reales.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    <button type="submit" className="studio-primary w-full" disabled={busy}>{busy?'Preparando el diseño…':'Confirmar propuesta y ver diseño'}</button>
  </form>;
}
