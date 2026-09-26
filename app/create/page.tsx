"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Save, LayoutDashboard } from 'lucide-react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { PasoAplicacion } from '@/lib/estado/tipos-estado';
import { guardarCampañaEnStore } from '@/lib/campañas/GestionCampañas';
import CapturaFachada from '@/components/captura/CapturaFachada';
import { AnalizadorADN } from '@/components/generative/AnalizadorADN';
import { VistaResultados } from '@/components/generative/VistaResultados';
import { BibliotecaCarteles } from '@/components/generative/impresion/BibliotecaCarteles';
import { EditorNegocio } from '@/components/generative/EditorNegocio';
import { EscaparateReferencia } from '@/components/generative/escaparate/EscaparateReferencia';
import { RemoteSyncPanel } from '@/components/dashboard/RemoteSyncPanel';

const steps: { id: PasoAplicacion; label: string; title: string; description: string }[] = [
 { id: 'CAPTURA', label: 'Foto', title: 'Empecemos por tu negocio', description: 'Sube una foto de tu fachada para preparar tu escaparate.' },
 { id: 'ANALISIS', label: 'Identidad', title: 'Revisa la identidad de tu negocio', description: 'Confirma el nombre y el sector antes de continuar.' },
 { id: 'ESCAPARATE', label: 'Diseño', title: 'Elige cómo quieres presentarte', description: 'Revisa la propuesta y elige el diseño de tu web.' },
 { id: 'CONFIGURACION', label: 'Contenido', title: 'Hazlo tuyo', description: 'Revisa tus textos, tus horarios y las formas de contacto.' },
 { id: 'CARTELERIA', label: 'Cartel', title: 'Del escaparate a tu web', description: 'Prepara el cartel y su QR. Puedes volver a editar en cualquier momento.' },
 { id: 'DESPLIEGUE', label: 'Publicar', title: 'Revisa, guarda y publica', description: 'Guardar conserva un borrador privado. Publicar activa la web y el enlace de tu QR.' },
];
function normalized(step: PasoAplicacion) { return step === 'BIBLIOTECA_CARTELERIA' ? 'CARTELERIA' : step === 'DASHBOARD' ? 'DESPLIEGUE' : step; }
export default function PaginaCrear() {
 const s = useTiendaEstado();
 const ready = Boolean(s.adnMarca && s.datosEscaparate);
 const step = normalized(s.pasoActual);
 const index = Math.max(0, steps.findIndex(x => x.id === step));
 const info = steps[index];
 const [message, setMessage] = useState('');
 const initialized = useRef(false);
 const fromHistory = useRef(false);
 const skipInitialSync = useRef(false);
 const title = useRef<HTMLHeadingElement>(null);
 // Each editor step has browser history; Back restores a step rather than abandoning the editor.
 useEffect(() => {
   function restore() {
     const requested = new URLSearchParams(location.search).get('paso') as PasoAplicacion;
     const state = useTiendaEstado.getState();
     if (steps.some(x => x.id === requested) && (requested === 'CAPTURA' || (requested === 'ANALISIS' ? state.imagenSubida : state.adnMarca && state.datosEscaparate))) {
       if (!initialized.current && normalized(state.pasoActual) !== requested) skipInitialSync.current = true;
       fromHistory.current = true;
       state.establecerPaso(requested);
     }
   }
   restore();
   initialized.current = true;
   window.addEventListener('popstate', restore);
   return () => window.removeEventListener('popstate', restore);
 }, []);
 useEffect(() => {
   if (!initialized.current) return;
   if (skipInitialSync.current) { skipInitialSync.current = false; return; }
   const url = new URL(location.href);
   if (url.searchParams.get('paso') !== step) {
     url.searchParams.set('paso', step);
     if (fromHistory.current || !location.search.includes('paso=')) history.replaceState(history.state, '', url);
     else history.pushState(history.state, '', url);
   }
   fromHistory.current = false;
   setMessage('');
   window.scrollTo({ top: 0, behavior: 'instant' });
   title.current?.focus({ preventScroll: true });
 }, [step]);
 function save() {
   const result = guardarCampañaEnStore();
   setMessage(result ? 'Borrador guardado en este dispositivo. Usa Publicar para guardarlo en tu cuenta.' : 'Completa la identidad de tu negocio antes de guardar.');
 }
 function go(next: PasoAplicacion) { if (ready) guardarCampañaEnStore(); s.establecerPaso(next); }
 return <main className="studio-shell min-h-screen">
   <div className="studio-container">
     <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
       <Link className="studio-button" href="/dashboard" onClick={() => { if (ready) guardarCampañaEnStore(); }}><LayoutDashboard size={18} /> Mis escaparates</Link>
       {ready && <button className="studio-button" onClick={save}><Save size={18} /> Guardar borrador local</button>}
     </div>
     <header className="mb-8"><p className="studio-eyebrow">CREADOR DE ESCAPARATES · PASO {index + 1} DE {steps.length}</p><h1 ref={title} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold tracking-tight mt-3 outline-none">{info.title}</h1><p className="studio-muted mt-3 max-w-2xl">{info.description}</p></header>
     <nav aria-label="Pasos de creación" className="studio-steps mb-8">{steps.map((item, i) => <button key={item.id} aria-current={item.id === step ? 'step' : undefined} disabled={i > 0 && (i === 1 ? !s.imagenSubida : !ready)} onClick={() => go(item.id)}><span>{i + 1}</span>{item.label}</button>)}</nav>
     {message && <p role="status" className="studio-notice mb-6">{message}</p>}
     {step === 'CAPTURA' && <div className="studio-legacy rounded-3xl p-4 sm:p-8"><CapturaFachada /></div>}
     {step === 'ANALISIS' && (ready ? <EditorNegocio /> : s.imagenSubida ? <div className="studio-legacy rounded-3xl p-4 sm:p-8"><AnalizadorADN /></div> : <p className="studio-notice">Necesitas una foto. Vuelve al paso Foto para comenzar.</p>)}
     {step === 'ESCAPARATE' && ready && <div><VistaResultados adn={s.adnMarca!} onContinuar={() => go('CONFIGURACION')} onReiniciar={() => go('CAPTURA')} /></div>}
     {step === 'CONFIGURACION' && ready && <div className="grid lg:grid-cols-2 gap-6 items-start"><EditorNegocio /><section className="studio-panel lg:sticky lg:top-24"><h2 className="font-semibold mb-4">Vista previa de tu web</h2><div className="overflow-hidden rounded-2xl bg-slate-900"><EscaparateReferencia /></div></section></div>}
     {step === 'CARTELERIA' && ready && <BibliotecaCarteles />}
     {step === 'DESPLIEGUE' && ready && <RemoteSyncPanel />}
     {!ready && !['CAPTURA', 'ANALISIS'].includes(step) && <div className="studio-panel"><h2 className="font-semibold">No hay un borrador abierto</h2><p className="studio-muted my-4">Abre un escaparate desde tu panel o empieza con una foto.</p><button className="studio-primary" onClick={() => go('CAPTURA')}>Empezar con una foto</button></div>}
     <footer className="flex flex-wrap justify-between gap-3 mt-8 pt-6 border-t border-slate-200">
       {index > 0 ? <button className="studio-button" onClick={() => go(steps[index - 1].id)}><ArrowLeft size={18} /> Volver a {steps[index - 1].label.toLowerCase()}</button> : <Link href="/dashboard" className="studio-button">Volver al panel</Link>}
       {ready && index >= 1 && index < steps.length - 1 && <button className="studio-primary" onClick={() => go(steps[index + 1].id)}>Continuar a {steps[index + 1].label.toLowerCase()}<ArrowRight size={18} /></button>}
     </footer>
   </div>
 </main>;
}
