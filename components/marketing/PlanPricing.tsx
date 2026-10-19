'use client';
import { useState } from 'react';
import { PLANS, LAUNCH_CUSTOMERS } from '@/lib/commercial/catalog';
export function PlanPricing({ onCreate, sector }: { onCreate: () => void; sector?: string }) {
  const [annual, setAnnual] = useState(true);
  return <section id="precios" className="studio-container scroll-mt-24">
    <p className="studio-eyebrow">PLANES PARA TU NEGOCIO</p><h2 className="text-3xl font-semibold mt-3">Elige el alcance que necesitas</h2>
    <p className="studio-muted mt-4">Lanzamiento para los primeros {LAUNCH_CUSTOMERS} clientes de pago. Importes antes de IVA. Sin permanencia; el servicio contratado se mantiene hasta finalizar el periodo pagado.</p>
    <div role="group" aria-label="Periodo de pago" className="flex gap-3 my-6"><button aria-pressed={annual} className={annual ? 'studio-primary' : 'studio-button'} onClick={() => setAnnual(true)}>Anual · lanzamiento</button><button aria-pressed={!annual} className={!annual ? 'studio-primary' : 'studio-button'} onClick={() => setAnnual(false)}>Mensual</button></div>
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">{(['BUSINESS','PRO','BASIC','FREE'] as const).map(id => {
      const p = PLANS[id]; return <article key={id} className="studio-panel flex flex-col gap-4"><h3 className="text-2xl font-semibold">{p.name}</h3><p className="text-3xl font-semibold">{annual ? p.launchAnnual : p.monthly} € <span className="text-sm">{id === 'FREE' ? 'para siempre' : `+ IVA / ${annual ? 'año' : 'mes'}`}</span></p>
      {annual && id !== 'FREE' && <p className="studio-muted">Tarifa anual habitual: {p.annual} € + IVA.</p>}
      <ul className="space-y-3 flex-1"><li>{id==='FREE'||id==='BASIC'?'Web de cuatro botones':p.activeCampaigns+' campañas activas simultáneamente'}</li><li>Logo, identidad y edición manual</li><li>{id === 'FREE'||id==='BASIC' ? 'Edición manual, enlaces, logo y fondo' : id === 'PRO' ? 'Landing con servicios y botones de contacto' : 'Website con secciones, galería y animaciones'}</li><li>Diseño digital del QR</li><li>{id==='FREE'?'Sin créditos mensuales de IA':id==='BASIC'?'100 créditos IA al mes · máximo acumulado 200':id==='PRO'?'200 créditos IA al mes · máximo acumulado 400':'400 créditos IA al mes · máximo acumulado 800'}</li><li>{id==='FREE'?'Con marca de INNOVA':'Sin marca de INNOVA'}</li></ul>
      {id === 'FREE' ? <button className="studio-button" onClick={onCreate}>Empezar gratis</button> : <a className="studio-primary" href={`/checkout?plan=${id}&billing=${annual ? 'annual' : 'monthly'}${sector ? '&sector='+sector : ''}`}>Contratar {p.name}</a>}
    </article>})}</div>
    <p className="studio-muted mt-6">Mensual y anual incluyen las mismas prestaciones. Las condiciones de renovación de la promoción, el dominio y el consumo de IA se detallan en la propuesta antes de contratar.</p>
    <p className="studio-muted mt-3">El diseño digital del cartel está separado de la impresión física. Cualquier servicio humano o impresión se acuerda por separado.</p>
    <div className="studio-panel mt-6"><h3 className="text-xl font-semibold">Enterprise · varios locales</h3><p className="studio-muted my-3">Una propuesta adaptada al número de sucursales y a su gestión.</p><a className="studio-button" href="mailto:innovandesign@gmail.com?subject=Plan%20Enterprise">Solicitar propuesta</a></div>
  </section>;
}
