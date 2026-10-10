"use client";
import { PlanPricing } from '@/components/marketing/PlanPricing';
import Link from 'next/link';
import { featuredDemos } from '@/lib/marketing/demos';
import { InnovaFooter } from '@/components/marketing/InnovaFooter';
import { DistritoCaseStudy } from '@/components/marketing/DistritoCaseStudy';
import { NeonPhone } from '@/components/marketing/NeonPhone';
import { HeroPhone3D } from '@/components/marketing/HeroPhone3D';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Camera, Pencil, QrCode } from 'lucide-react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
export default function Home() {
 const router=useRouter();
 function manejarInicio(){useTiendaEstado.getState().reiniciar();router.push('/create?paso=CAPTURA');}
 return <main className="studio-shell">
 <section className="studio-container grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
 <div><p className="studio-eyebrow">INNOVA AND DESIGN · ESCAPARATES DIGITALES</p><h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.08] mt-5">Tu negocio merece<br/><span className="text-[#00ff9d]">que entren a conocerlo.</span></h1><p className="studio-muted text-lg mt-6 max-w-xl">Para inmobiliarias, centros de estética y barberías. Conecta tu local con su web: presenta tus servicios y promociones, facilita el contacto y lleva a tus clientes del cartel al móvil.</p><div className="flex flex-wrap gap-3 mt-8"><button className="studio-primary" onClick={manejarInicio}>Crear mi escaparate <ArrowRight size={18}/></button><Link className="studio-button" href="/dashboard">Entrar a mi panel</Link></div><p className="studio-muted text-sm mt-4">Prueba el creador. Inicia sesión cuando quieras guardar en tu cuenta y publicar.</p></div>
 <HeroPhone3D/>
 </section>
 <section className="studio-container"><div className="flex flex-wrap justify-between gap-4 mb-8"><h2 className="text-3xl font-semibold">De tu fachada a la pantalla</h2><Link className="studio-button" href="/dashboard?seccion=ayuda">Ver cómo funciona</Link></div><div className="grid md:grid-cols-3 gap-5">{[{Icon:Camera,title:'1. Presenta tu negocio',text:'Sube una foto y confirma tu identidad. Puedes completar los datos manualmente.'},{Icon:Pencil,title:'2. Dale tu voz',text:'Elige el diseño y edita los textos, servicios y formas de contacto.'},{Icon:QrCode,title:'3. Conecta y comparte',text:'Publica tu web, descarga el cartel y comprueba el QR antes de imprimir.'}].map(({Icon,title,text})=><article key={title} className="studio-panel"><Icon className="text-[#00ff9d] mb-5" size={28}/><h3 className="font-semibold text-lg">{title}</h3><p className="studio-muted mt-3">{text}</p></article>)}</div></section>
 <section id="ejemplos" className="studio-container scroll-mt-24"><p className="studio-eyebrow mb-3">UNA SELECCIÓN PARA TU SECTOR</p><h2 className="text-3xl font-semibold mb-3">Diseños para tu sector</h2><p className="studio-muted mb-8 max-w-3xl">Explora propuestas para inmobiliarias, centros de estética y barberías. Cada ejemplo muestra una forma de presentar tus servicios y facilitar consultas.</p><div className="innova-phone-gallery">{featuredDemos.map(demo=><NeonPhone key={demo.id} id={demo.id} name={demo.name} sector={demo.sector}/>)}</div><p className="studio-muted text-sm mt-8">Distrito Homes es un caso real. Los demás diseños son ejemplos visuales: sus servicios, precios y datos de contacto son de demostración.</p></section>
 <DistritoCaseStudy/>
 <PlanPricing onCreate={manejarInicio}/>
 <InnovaFooter onCreate={manejarInicio}/>
 </main>;
}
