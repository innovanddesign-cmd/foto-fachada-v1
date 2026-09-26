"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, LayoutGrid, HelpCircle } from 'lucide-react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { DashboardPrincipal } from '@/components/dashboard/DashboardPrincipal';
export default function PaginaDashboard() {
 const router = useRouter(); const [help, setHelp] = useState(false);
 useEffect(() => { const update = () => setHelp(new URLSearchParams(location.search).get('seccion') === 'ayuda'); update(); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
 function select(next: boolean) { setHelp(next); history.pushState(history.state, '', next ? '/dashboard?seccion=ayuda' : '/dashboard'); }
 return <main className="studio-shell min-h-screen"><div className="studio-container">
   <header className="flex flex-wrap justify-between items-start gap-5 mb-8"><div><p className="studio-eyebrow">INNOVA · TU ESPACIO DE TRABAJO</p><h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3">Mis escaparates</h1><p className="studio-muted mt-3">Crea, revisa y publica la presencia digital de tu negocio.</p></div><button className="studio-primary" onClick={() => { useTiendaEstado.getState().reiniciar(); router.push('/create?paso=CAPTURA'); }}><Plus size={18} /> Crear escaparate</button></header>
   <nav aria-label="Secciones del panel" className="flex gap-3 mb-8"><button aria-current={!help ? 'page' : undefined} className={!help ? 'studio-primary' : 'studio-button'} onClick={() => select(false)}><LayoutGrid size={18} /> Escaparates</button><button aria-current={help ? 'page' : undefined} className={help ? 'studio-primary' : 'studio-button'} onClick={() => select(true)}><HelpCircle size={18} /> Cómo funciona</button></nav>
   {!help ? <DashboardPrincipal /> : <section className="studio-panel max-w-3xl space-y-5"><h2 className="text-2xl font-semibold">De la foto a tu escaparate publicado</h2>{[
     ['1. Prepara la identidad', 'Sube una foto y revisa el nombre y el sector. Si el análisis no está disponible, puedes completar los datos manualmente.'],
     ['2. Revisa el diseño y el contenido', 'Elige la presentación de tu web y edita textos, teléfono, horario y enlaces. Puedes volver a cualquier paso sin empezar de nuevo.'],
     ['3. Guarda en tu cuenta', 'El borrador local está en este navegador. Guardar en tu cuenta permite recuperarlo desde otro dispositivo con la misma sesión.'],
     ['4. Publica y prueba', 'En Publicar, guarda el borrador y pulsa Publicar web. Abre Ver web para revisar lo que verá el cliente. Si editas después, pulsa Actualizar web pública.'],
     ['5. Descarga el cartel', 'Elige A4, A5 o cuadrado. Descarga el PNG o usa Imprimir / PDF. Prueba el QR con otro móvil antes de imprimir: la web debe estar publicada.']
   ].map(([q,a]) => <details key={q} className="border-b border-emerald-900 pb-4"><summary className="font-semibold cursor-pointer py-3">{q}</summary><p className="studio-muted mt-2">{a}</p></details>)}<Link className="studio-button" href="/#precios">Consultar planes y precios</Link></section>}
 </div></main>;
}
