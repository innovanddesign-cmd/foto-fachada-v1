import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react';

export function InnovaFooter({ onCreate }: { onCreate: () => void }) {
 return <footer className="innova-footer" aria-label="INNOVA AND DESIGN">
  <div className="studio-container !pb-6">
   <div className="innova-footer-invitation">
    <div><p className="studio-eyebrow">EL SIGUIENTE PASO ES TUYO</p><h2>Haz que tu fachada<br/><span>abra nuevas puertas.</span></h2><p className="studio-muted mt-4 max-w-xl">Una web con tu identidad. Un cartel que invita a descubrirla. Todo conectado para acercar tu negocio a más personas.</p></div>
    <div className="flex flex-col gap-3 items-start"><button onClick={onCreate} className="studio-primary">Crear mi escaparate <ArrowRight size={18}/></button><a className="innova-footer-link" href="mailto:innovandesign@gmail.com?subject=Quiero%20mi%20escaparate%20digital">Prefiero hablar con INNOVA <ArrowUpRight size={16}/></a></div>
   </div>
   <div className="innova-footer-columns">
    <div><Link href="/" aria-label="INNOVA · Inicio" className="inline-block"><img src="/brand/innova-logo.png" alt="INNOVA AND DESIGN" width={144} height={144}/></Link><p className="font-semibold text-lg mt-2">Diseño que conecta.</p><p className="studio-muted text-sm mt-3 max-w-xs">Presencia digital, diseño e imprenta, desarrollo web y automatizaciones para dar forma al siguiente paso de tu negocio.</p></div>
    <nav aria-label="Explorar escaparates"><h3>Escaparates digitales</h3><ul><li><Link href="/#ejemplos">Explorar diseños</Link></li><li><Link href="/#precios">Planes y precios</Link></li><li><Link href="/dashboard?seccion=ayuda">Cómo funciona</Link></li><li><button onClick={onCreate}>Crear mi escaparate</button></li></ul></nav>
    <nav aria-label="Tu cuenta y ayuda"><h3>Tu espacio</h3><ul><li><Link href="/dashboard">Mis escaparates</Link></li><li><Link href="/auth/login">Iniciar sesión</Link></li><li><Link href="/auth/signup">Crear una cuenta</Link></li><li><Link href="/dashboard?seccion=ayuda">Ayuda y primeros pasos</Link></li></ul></nav>
    <div><h3>Hablemos de tu negocio</h3><p className="studio-muted text-sm mt-5">Cuéntanos qué necesitas y te ayudamos a encontrar el siguiente paso.</p><a className="innova-footer-email" href="mailto:innovandesign@gmail.com"><Mail size={18} aria-hidden="true"/><span>innovandesign@gmail.com</span></a><p className="text-xs text-slate-400 leading-relaxed mt-5">¿Buscas una web a medida o un proyecto de digitalización? Escríbenos.</p></div>
   </div>
   <div className="innova-footer-bottom"><p>© {new Date().getFullYear()} INNOVA AND DESIGN.<br className="sm:hidden"/> Todos los derechos reservados.</p><nav aria-label="Información legal" className="flex flex-wrap gap-x-6 gap-y-2"><Link href="/legal/privacidad">Privacidad</Link><Link href="/legal/terminos">Términos y condiciones</Link><a href="#app-content">Volver arriba ↑</a></nav></div>
  </div>
 </footer>;
}
