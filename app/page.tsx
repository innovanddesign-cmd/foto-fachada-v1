"use client";
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
 <div><p className="studio-eyebrow">INNOVA AND DESIGN · ESCAPARATES DIGITALES</p><h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.08] mt-5">Tu inmobiliaria merece<br/><span className="text-[#00ff9d]">que entren a conocerlo.</span></h1><p className="studio-muted text-lg mt-6 max-w-xl">Conecta el escaparate de tu agencia con su web: presenta tus propiedades y servicios, facilita el contacto y lleva a compradores y propietarios del cartel al móvil.</p><div className="flex flex-wrap gap-3 mt-8"><button className="studio-primary" onClick={manejarInicio}>Crear mi escaparate <ArrowRight size={18}/></button><Link className="studio-button" href="/dashboard">Entrar a mi panel</Link></div><p className="studio-muted text-sm mt-4">Prueba el creador. Inicia sesión cuando quieras guardar en tu cuenta y publicar.</p></div>
 <HeroPhone3D/>
 </section>
 <section className="studio-container"><div className="flex flex-wrap justify-between gap-4 mb-8"><h2 className="text-3xl font-semibold">De tu fachada a la pantalla</h2><Link className="studio-button" href="/dashboard?seccion=ayuda">Ver cómo funciona</Link></div><div className="grid md:grid-cols-3 gap-5">{[{Icon:Camera,title:'1. Presenta tu agencia',text:'Sube una foto y confirma tu identidad. Puedes completar los datos manualmente.'},{Icon:Pencil,title:'2. Dale tu voz',text:'Elige el diseño y edita los textos, servicios y formas de contacto.'},{Icon:QrCode,title:'3. Conecta y comparte',text:'Publica tu web, descarga el cartel y comprueba el QR antes de imprimir.'}].map(({Icon,title,text})=><article key={title} className="studio-panel"><Icon className="text-[#00ff9d] mb-5" size={28}/><h3 className="font-semibold text-lg">{title}</h3><p className="studio-muted mt-3">{text}</p></article>)}</div></section>
 <section id="ejemplos" className="studio-container scroll-mt-24"><p className="studio-eyebrow mb-3">UNA SELECCIÓN PARA TU SECTOR</p><h2 className="text-3xl font-semibold mb-3">Diseños para inmobiliarias</h2><p className="studio-muted mb-8 max-w-3xl">Una primera impresión con identidad propia. Explora Elite Estates, Distrito Homes y FamilyFirst: tres enfoques para presentar una agencia, sus propiedades y sus formas de contacto.</p><div className="innova-phone-gallery">{featuredDemos.map(demo=><NeonPhone key={demo.id} id={demo.id} name={demo.name} sector={demo.sector}/>)}</div><p className="studio-muted text-sm mt-8">Distrito Homes es un caso real. Elite Estates y FamilyFirst son ejemplos visuales: sus propiedades, precios y datos de contacto son de demostración.</p></section>
 <DistritoCaseStudy/>
 <div className="studio-legacy">            <section id="precios" className="px-6 py-24 max-w-6xl mx-auto scroll-mt-24">
                <div className="text-center mb-16">
                    <span className="text-[#00ff9d] text-xs font-bold uppercase tracking-widest">Precios</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">Planes para tu inmobiliaria</h2>
                    <p className="text-white/50 mt-3">Oferta de lanzamiento: primeros 100 clientes de pago.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-3xl bg-white/4 border border-white/8 flex flex-col">
                        <h3 className="text-white font-bold text-lg">FREE</h3>
                        <p className="text-white/50 text-sm mb-4">Empieza sin coste</p>
                        <div className="text-3xl font-black text-white mb-4">0€<span className="text-sm font-medium text-white/40"> /siempre</span></div>
                        <ul className="space-y-2 text-sm text-white/60 flex-1 mb-6">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Página personalizada</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Máx. 4 acciones</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> 1 campaña</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> 1 regeneración IA/mes</li>
                        </ul>
                        <button type="button" onClick={manejarInicio} className="w-full py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-white font-bold text-sm">
                            Empezar gratis
                        </button>
                    </div>
                    <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col relative shadow-[0_0_30px_-10px_rgba(0,255,157,0.15)]">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff9d] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Recomendado</span>
                        <h3 className="text-white font-bold text-lg">PRO</h3>
                        <p className="text-white/50 text-sm mb-4">Escaparate completo con estrategia</p>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-white/30 line-through text-sm font-bold">200€</span>
                            <span className="text-3xl font-black text-[#00ff9d]">100€<span className="text-sm font-medium text-white/40"> /año</span></span>
                        </div>
                        <ul className="space-y-2 text-sm text-white/60 flex-1 mb-6">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Todo FREE +</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Landing completa + CTA</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> 3 campañas</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> 3 regeneraciones IA/mes</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Primer cartel físico</li>
                        </ul>
                        <a href="mailto:innovandesign@gmail.com?subject=Quiero%20el%20plan%20PRO" className="block w-full py-3 rounded-2xl bg-[#00ff9d] hover:bg-emerald-300 transition-colors text-black font-bold text-sm text-center">
                            Elegir PRO
                        </a>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/4 border border-white/8 flex flex-col">
                        <h3 className="text-white font-bold text-lg">ESCAPARATE</h3>
                        <p className="text-white/50 text-sm mb-4">Máxima experiencia visual</p>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-white/30 line-through text-sm font-bold">400€</span>
                            <span className="text-3xl font-black text-white">200€<span className="text-sm font-medium text-white/40"> /año</span></span>
                        </div>
                        <ul className="space-y-2 text-sm text-white/60 flex-1 mb-6">
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Todo PRO +</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Motion avanzado</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> 10 campañas</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> 10 regeneraciones IA/mes</li>
                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#00ff9d] shrink-0" /> Analítica avanzada</li>
                        </ul>
                        <a href="mailto:innovandesign@gmail.com?subject=Quiero%20el%20plan%20ESCAPARATE" className="block w-full py-3 rounded-2xl bg-white text-black hover:bg-gray-100 transition-colors font-bold text-sm text-center">
                            Elegir ESCAPARATE
                        </a>
                    </div>
                </div>
            </section><p className="text-center text-slate-300 max-w-2xl mx-auto pb-12 px-6">La analítica avanzada y las cuotas de IA requieren activación del servicio. Consulta su disponibilidad antes de contratar.</p></div>
 <InnovaFooter onCreate={manejarInicio}/>
 </main>;
}
