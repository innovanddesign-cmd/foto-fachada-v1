'use client';
import { useState } from 'react';
import { PLANS, LAUNCH_CUSTOMERS } from '@/lib/commercial/catalog';
export function PlanPricing({ onCreate }: { onCreate: () => void }) {
  const [annual, setAnnual] = useState(true);
  return <section id="precios" className="studio-container scroll-mt-24">
    <p className="studio-eyebrow">PLANES PARA TU NEGOCIO</p><h2 className="text-3xl font-semibold mt-3">Elige el alcance que necesitas</h2>
    <p className="studio-muted mt-4">Lanzamiento para los primeros {LAUNCH_CUSTOMERS} clientes de pago. Importes antes de IVA. Sin permanencia; el servicio contratado se mantiene hasta finalizar el periodo pagado.</p>
    <div role="group" aria-label="Periodo de pago" className="flex gap-3 my-6"><button aria-pressed={annual} className={annual ? 'studio-primary' : 'studio-button'} onClick={() => setAnnual(true)}>Anual · lanzamiento</button><button aria-pressed={!annual} className={!annual ? 'studio-primary' : 'studio-button'} onClick={() => setAnnual(false)}>Mensual</button></div>
    <div className="grid md:grid-cols-3 gap-5">{(['BUSINESS','PRO','FREE'] as const).map(id => {
      const p = PLANS[id]; return <article key={id} className="studio-panel flex flex-col gap-4"><h3 className="text-2xl font-semibold">{p.name}</h3><p className="text-3xl font-semibold">{annual ? p.launchAnnual : p.monthly} € <span className="text-sm">{id === 'FREE' ? 'para siempre' : `+ IVA / ${annual ? 'año' : 'mes'}`}</span></p>
      {annual && id !== 'FREE' && <p className="studio-muted">Tarifa anual habitual: {p.annual} € + IVA.</p>}
      <ul className="space-y-3 flex-1"><li>{p.activeCampaigns} {p.activeCampaigns === 1 ? 'campaña activa' : 'campañas activas simultáneamente'}</li><li>Logo, identidad y edición manual</li><li>{id === 'FREE' ? 'Página básica · hasta 4 acciones' : id === 'PRO' ? 'Landing con servicios y botones de contacto' : 'Website con secciones, galería y animaciones'}</li><li>Diseño digital del QR</li>{id !== 'FREE' && <li>Primer cartel físico hasta A3 y acompañamiento</li>}{id === 'BUSINESS' && <li>Dominio .com o .es incluido en la propuesta</li>}</ul>
      {id === 'FREE' ? <button className="studio-button" onClick={onCreate}>Empezar gratis</button> : <a className="studio-primary" href={`mailto:innovandesign@gmail.com?subject=${encodeURIComponent(`Quiero ${p.name} ${annual ? 'anual' : 'mensual'}`)}`}>Solicitar {p.name}</a>}
    </article>})}</div>
    <p className="studio-muted mt-6">Mensual y anual incluyen las mismas prestaciones. Las condiciones de renovación de la promoción, el dominio y el consumo de IA se detallan en la propuesta antes de contratar.</p>
    <p className="studio-muted mt-3">Entrega prevista en 24–48 horas laborables desde el pago recibido, el cartel preparado y la campaña activa. Entrega física inicial en mano.</p>
    <div className="studio-panel mt-6"><h3 className="text-xl font-semibold">Enterprise · varios locales</h3><p className="studio-muted my-3">Una propuesta adaptada al número de sucursales y a su gestión.</p><a className="studio-button" href="mailto:innovandesign@gmail.com?subject=Plan%20Enterprise">Solicitar propuesta</a></div>
  </section>;
}
