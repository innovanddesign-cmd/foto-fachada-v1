"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Printer, Plus, Copy, Trash2 } from 'lucide-react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { RemoteSyncPanel } from './RemoteSyncPanel';
import type { CampañaUsuario, PasoAplicacion } from '@/lib/estado/tipos-estado';
export function DashboardPrincipal() {
 const s = useTiendaEstado(); const router = useRouter();
 const [remove, setRemove] = useState<string | null>(null);
 const [message, setMessage] = useState('');
 function open(c: CampañaUsuario, step: PasoAplicacion) {
   const draft = c.snapshot;
   if (!draft?.adnMarca || !draft?.datosEscaparate) { setMessage('Este borrador no contiene los datos completos. Abre la copia guardada en tu cuenta o crea un escaparate nuevo.'); return; }
   useTiendaEstado.setState({ adnMarca:draft.adnMarca, datosEscaparate:draft.datosEscaparate, imagenSubida:draft.imagenSubida||null, galeriaActivos:draft.galeriaActivos||[], redesSociales:draft.redesSociales||{}, slug:c.idEscaparate, cartelesGenerados:draft.cartelesGenerados||[], pasoActual:step });
   router.push('/create?paso='+step);
 }
 function create() { s.reiniciar(); router.push('/create?paso=CAPTURA'); }
 return <div className="space-y-8">
   <RemoteSyncPanel />
   <section className="studio-panel"><div className="flex flex-wrap justify-between gap-3 mb-5"><div><h2 className="text-xl font-semibold">Borradores en este dispositivo</h2><p className="studio-muted mt-2">Estas copias se guardan en este navegador. Guárdalas en tu cuenta para abrirlas en la tablet.</p></div><button className="studio-button" onClick={create}><Plus size={18} /> Nuevo escaparate</button></div>
     {message && <p role="status" className="studio-notice mb-4">{message}</p>}
     {!s.campañas.length ? <div className="text-center py-10 rounded-2xl bg-[#111a15]"><h3 className="font-semibold text-lg">Tu próximo escaparate empieza aquí</h3><p className="studio-muted mt-2 mb-5">Foto, contenido, cartel y publicación. Puedes guardar y continuar después.</p><button className="studio-primary" onClick={create}>Crear mi primer escaparate</button></div> : <ul className="space-y-3">{s.campañas.map(c => <li key={c.id} className="p-5 rounded-2xl border border-emerald-900"><div className="flex flex-wrap justify-between gap-4"><div className="min-w-0"><h3 className="font-semibold break-words">{c.nombreCampaña}</h3><p className="studio-muted text-sm mt-1">Copia local · Editada {new Date(c.ultimaActualizacion).toLocaleDateString('es-ES')}</p></div><div className="flex flex-wrap gap-2"><button className="studio-button" onClick={() => open(c, 'CONFIGURACION')}><Pencil size={16} /> Editar</button><button className="studio-button" onClick={() => open(c, 'CARTELERIA')}><Printer size={16} /> Cartel</button><button className="studio-button" aria-label={`Duplicar ${c.nombreCampaña}`} onClick={() => { s.duplicarCampaña(c.id, c.nombreCampaña+' (copia)'); setMessage('Copia creada en este dispositivo.'); }}><Copy size={16} /></button><button className="studio-button" aria-label={`Eliminar copia local de ${c.nombreCampaña}`} onClick={() => setRemove(c.id)}><Trash2 size={16} /></button></div></div>{remove === c.id && <div className="mt-4 studio-notice"><p>¿Eliminar la copia de este dispositivo? La versión de tu cuenta y la web pública no se borrarán.</p><div className="flex gap-3 mt-3"><button className="studio-button" onClick={() => { s.eliminarCampaña(c.id); setRemove(null); }}>Eliminar copia local</button><button className="studio-button" onClick={() => setRemove(null)}>Cancelar</button></div></div>}</li>)}</ul>}
   </section>
 </div>;
}
