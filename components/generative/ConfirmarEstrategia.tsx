'use client';
import {campaignBudget,campaignOutline,campaignIssues} from '@/lib/marketing/campaign-plan';
import {SectorBriefForm} from '@/components/captura/SectorBriefForm';
import {sectors} from '@/lib/marketing/sectors';
import { useState } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { AIService } from '@/services/ai';
import { aplicarEstrategia, sugerirEstrategia, validarEstrategia, type EstrategiaConversion } from '@/lib/marketing/estrategia';

export function ConfirmarEstrategia() {
  const s = useTiendaEstado();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!s.adnMarca) return null;
  const savedPlan = s.adnMarca.estrategiaConversion || sugerirEstrategia(s.adnMarca, s.datosEscaparate?.datosReales?.telefono);
  // Shorten only our original stock suggestions; retain all customer-written text.
  const plan = {...savedPlan,
    publico: savedPlan.publico === 'Personas que pasan por el local y quieren conocer nuestros servicios antes de contactar.' ? 'Personas que pasan por delante de mi local.' : savedPlan.publico,
    motivoEscaneo: savedPlan.motivoEscaneo === 'Conocer nuestros servicios y contactar directamente, sin dejar datos para consultar.' ? 'Ver mis servicios y escribirme por WhatsApp.' : savedPlan.motivoEscaneo,
  };
  function update(key: keyof EstrategiaConversion, value: string) {
    s.actualizarAdn({ estrategiaConversion: {...plan, [key]: value, confirmadaEn: undefined} });
    setError('');
  }
  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const issue = (s.adnMarca?.sectorBrief ? campaignIssues(s.adnMarca.sectorBrief)[0] : undefined) || validarEstrategia(plan);
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
    {key:'publico',label:'¿A quién quieres atraer?',max:400},
    {key:'motivoEscaneo',label:'¿Para qué van a escanear el QR?',max:400},
    {key:'textoCartel',label:'¿Qué pondrá en el cartel?',max:160},
    {key:'cta',label:'¿Qué pondrá en el botón de WhatsApp?',max:70},
    {key:'mensajeWhatsApp',label:'¿Qué mensaje le dejamos preparado al cliente?',max:500},
  ];
  const sector=s.adnMarca.sectorBrief?.sector;
  const brief=s.adnMarca.sectorBrief;
  const outline=brief?campaignOutline(brief):undefined;
  const budget=brief?campaignBudget(brief):null;
  const citas = plan.objetivo === 'CITAS';
  const inmobiliaria = /inmob|alquiler|residencial|real estate/i.test(s.adnMarca.analisisVision?.categoriaSugerida || '');
  const alternatives = {
    publico: sector&&sector!=='inmobiliarias' ? [sectors[sector].audience,'Vecinos del barrio.','Clientes que ya conocen el negocio.'] : inmobiliaria ? ['Personas que buscan comprar una vivienda.', 'Personas que buscan alquilar.', 'Propietarios que quieren vender.', 'Personas que pasan por delante de mi agencia.'] : ['Personas que pasan por delante de mi local.', 'Vecinos del barrio.', 'Personas que buscan mis servicios.', 'Clientes que ya me conocen.'],
    motivoEscaneo: ['Ver mis servicios.', 'Escribirme por WhatsApp.', 'Consultar horarios y contacto.', citas ? 'Preguntar por una cita.' : 'Pedir más información.'],
    textoCartel: ['Escanea y descubre cómo podemos ayudarte.', '¿Tienes una pregunta? Escanea y escríbenos.', 'Conócenos mejor. Escanea aquí.', citas ? '¿Quieres una cita? Escanea y consúltanos.' : '¿Quieres más información? Escanea aquí.'],
    cta: citas ? ['Consultar una cita', 'Pedir cita por WhatsApp', 'Preguntar por disponibilidad', 'Hablar por WhatsApp'] : ['Escribir por WhatsApp', 'Pedir información', 'Hacer una consulta', 'Hablar con nosotros'],
    mensajeWhatsApp: citas ? ['Hola, me gustaría pedir una cita.', 'Hola, ¿qué horarios tenéis disponibles?', 'Hol):''}, lista para revisar</h2><p className="studio-muted mt-2">Revisa la propuesta, añade tu WhatsApp y continúa. Puedes ajustar los textos si lo necesitas.</p></div>
    {brief&&outline&&<section className="space-y-4"><h3 className="font-semibold text-xl">Cómo funcionará esta campaña</h3><dl className="space-y-3"><div><dt className="font-semibold">Objetivo del negocio</dt><dd>{brief.focus} · Meta: {brief.target||'pendiente'} consultas o solicitudes</dd></div><div><dt className="font-semibold">Qué frena al cliente</dt><dd>{outline.barrier}</dd></div><div><dt className="font-semibold">Por qué escanear</dt><dd>{plan.motivoEscaneo}</dd></div><div><dt className="font-semibold">Oferta aprobada</dt><dd>{brief.incentiveApproved&&brief.offer?brief.offer:'Sin promoción económica aprobada'}</dd></div><div><dt className="font-semibold">Lugar y fechas</dt><dd>{brief.location||'Zona pendiente'} · {brief.placement||'Ubicación del cartel pendiente'} · {brief.startDate||'Inicio pendiente'} a {brief.endDate||'Fin pendiente'}</dd></div>{budget!==null&&<div><dt className="font-semibold">Coste interno de producto</dt><dd>{budget.toFixed(2)} € para {brief.capacity} unidades. No se publica.</dd></div>}<div><dt className="font-semibold">Qué vamos a medir</dt><dd>Escaneos → clics de contacto → {outline.metric.toLowerCase()}. Los clics no equivalen a ventas: registra las citas y ventas realmente confirmadas.</dd></div></dl><ol className="list-decimal pl-5 space-y-2">{outline.actions.map(a=><li key={a}>{a}</li>)}</ol><details><summary className="cursor-pointer font-semibold py-3">Ajustar fechas, recursos y condiciones</summary><SectorBriefForm/></details></section>}
    <fieldset disabled={busy} className="space-y-5">
      <legend className="sr-only">Propuesta de tu escaparate</legend>
      <label className="studio-field">¿Qué quieres conseguir?<select value={plan.objetivo} onChange={e=>update('objetivo',e.target.value)}><option value="CITAS">{sector==='inmobiliarias'?'Que me consulten una visita':'Que me pidan cita por WhatsApp'}</option><option value="CONSULTAS">Que me escriban por WhatsApp</option></select></label>
      <div className="studio-notice space-y-2"><p><strong>Para:</strong> {plan.publico}</p><p><strong>Cartel:</strong> {plan.textoCartel}</p><p><strong>Botón:</strong> {plan.cta}</p></div><details><summary className="cursor-pointer py-3 font-semibold">Personalizar los textos de la campaña</summary><div className="space-y-5 mt-4">{fields.map(({key,label,max})=><div key={key} className="space-y-2">
        <label className="studio-field">{label}<textarea required rows={key==='cta'?2:3} maxLength={max} value={plan[key]} onChange={e=>update(key,e.target.value)} /></label>
        <p className="studio-muted text-sm">O elige una opción y cámbiala a tu gusto:</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={`Opciones: ${label}`}>
          {alternatives[key].map(text=><button key={text} type="button" className="studio-button text-left whitespace-normal" aria-pressed={plan[key]===text} onClick={()=>update(key,text)}>{text}</button>)}
        </div>
      </div>)}</div></details>
      <label className="studio-field">Tu número de WhatsApp<input required type="tel" autoComplete="tel" value={plan.telefono} placeholder="+34 600 123 456" onChange={e=>update('telefono',e.target.value)} /></label>
    </fieldset>
    <p className="studio-notice">El cliente podrá cambiar el mensaje antes de enviarlo. Las citas las confirmas tú por WhatsApp.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    <button type="submit" className="studio-primary w-full" disabled={busy}>{busy?'Preparando el diseño…':'Guardar y ver diseño'}</button>
  </form>;
}
