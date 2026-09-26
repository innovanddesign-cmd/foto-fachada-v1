"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, RefreshCw, ExternalLink, Save } from 'lucide-react';
import { useRemoteSync } from '@/lib/hooks/useRemoteSync';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { RemoteCampaign } from '@/lib/supabase/persistence';
export function RemoteSyncPanel() {
 const api = useRemoteSync(); const router = useRouter();
 const [message, setMessage] = useState(''); const [failure, setFailure] = useState('');
 const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null);
 const current = useTiendaEstado(s => s.datosEscaparate);
 const slug = useTiendaEstado(s => s.slug);
 const locals = useTiendaEstado(s => s.campañas.length);
 async function act(fn: () => Promise<{success:boolean;error:string|null}>, success: string) {
   setMessage(''); setFailure('');
   try { const r = await fn(); if (r.success) setMessage(success); else setFailure(r.error || 'No se pudo completar la operación.'); }
   catch { setFailure('No se pudo conectar. Tus cambios locales se conservan.'); }
 }
 function open(c: RemoteCampaign) {
   const s = c.snapshot;
   useTiendaEstado.setState({ adnMarca:s.adnMarca||null, datosEscaparate:s.datosEscaparate||null, imagenSubida:s.imagenSubida||null, galeriaActivos:s.galeriaActivos||[], redesSociales:s.redesSociales||{}, slug:c.slug, pasoActual:'CONFIGURACION', cartelesGenerados:s.cartelesGenerados||[] });
   useTiendaEstado.getState().guardarCampaña({ id:c.id, nombreCampaña:c.name, idEscaparate:c.slug||c.id, idCartel:null, estado:c.status==='active'?'EN_LINEA':'BORRADOR', fechaCreacion:c.created_at, ultimaActualizacion:c.updated_at, snapshot:s, urlPublica:c.slug?'/v/'+c.slug:undefined, metricas:{visitas:0,conversiones:0,escaneos:0,ratioConversion:0,puntajeSaludMarca:0,tendencia:'ESTABLE'} });
   router.push('/create?paso=CONFIGURACION');
 }
 async function publish(c: RemoteCampaign) {
   // Include the open editor's latest values before updating its public page.
   if (current && c.slug === slug) { const saved = await api.saveCurrent(); if (!saved.success) return saved; }
   return api.publish(c.id, c.slug!);
 }
 return <section className="studio-panel space-y-5" aria-busy={api.syncing || api.loading}>
   <div className="flex flex-wrap gap-3 items-start justify-between"><div><h2 className="text-xl font-semibold flex items-center gap-2"><Cloud size={22} /> Escaparates en tu cuenta</h2><p className="studio-muted mt-2">Accede a tus borradores desde otros dispositivos y gestiona su publicación.</p></div>{api.user && <button className="studio-button" disabled={api.loading || api.syncing} onClick={() => api.loadRemote()}><RefreshCw size={16} /> Actualizar</button>}</div>
   {!api.user ? <p className="studio-notice">Para guardar en tu cuenta y publicar, <a className="underline font-semibold" href="/auth/login">inicia sesión</a> o <a className="underline font-semibold" href="/auth/signup">crea una cuenta</a>. Tus borradores locales se conservan.</p> : <>
     <div className="flex flex-wrap gap-3">{current && <button className="studio-primary" disabled={api.syncing} onClick={() => act(api.saveCurrent, 'Borrador guardado en tu cuenta. Ya puedes publicarlo en la lista inferior.')}><Save size={18} /> Guardar borrador en mi cuenta</button>}{locals > 0 && <button className="studio-button" disabled={api.syncing} onClick={() => act(api.migrateLocalToRemote, 'Borradores locales guardados en tu cuenta.')}>Guardar todos los borradores locales</button>}</div>
     {api.loading && <p role="status">Cargando tus escaparates…</p>}
     {!api.loading && !api.error && api.remoteCampaigns.length === 0 && <div className="rounded-xl bg-[#111a15] p-5"><h3 className="font-semibold">Tu cuenta todavía no tiene escaparates guardados</h3><p className="studio-muted mt-1">{current ? 'Guarda el borrador actual con el botón superior. Después aparecerá la opción Publicar.' : 'Crea un escaparate o guarda uno de tus borradores locales.'}</p></div>}
     <div className="space-y-3">{api.remoteCampaigns.map(c => <article key={c.id} className="border border-emerald-900 rounded-2xl p-5">
       <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-lg break-words">{c.name}</h3><p className="studio-muted text-sm mt-1">{c.plan} · Guardado {new Date(c.updated_at).toLocaleDateString('es-ES')}</p></div><span className={c.status === 'active' ? 'text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full text-sm' : 'text-slate-200 bg-[#19281f] px-3 py-1 rounded-full text-sm'}>{c.status === 'active' ? 'Web publicada' : 'Borrador privado'}</span></div>
       <div className="flex flex-wrap gap-2 mt-4"><button className="studio-button" disabled={api.syncing} onClick={() => open(c)}>Editar contenido</button><button className="studio-primary" disabled={api.syncing || !c.slug} onClick={() => act(() => publish(c), 'Web publicada. Abre «Ver web» y comprueba sus enlaces antes de compartirla.')}>{c.status === 'active' ? 'Actualizar web pública' : 'Publicar web'}</button>{c.status === 'active' && <><a className="studio-button" href={'/v/'+encodeURIComponent(c.slug!)} target="_blank" rel="noreferrer">Ver web <ExternalLink size={16} /></a><button className="studio-button" disabled={api.syncing} onClick={() => setConfirmWithdraw(c.id)}>Retirar publicación</button></>}</div>
       {confirmWithdraw === c.id && <div className="studio-notice mt-4"><p>La web y el QR dejarán de estar disponibles al público. El borrador seguirá en tu cuenta.</p><div className="flex flex-wrap gap-2 mt-3"><button className="studio-button" disabled={api.syncing} onClick={() => { setConfirmWithdraw(null); void act(() => api.unpublish(c.id), 'Publicación retirada. Conservas el borrador en tu cuenta.'); }}>Confirmar retirada</button><button className="studio-button" onClick={() => setConfirmWithdraw(null)}>Cancelar</button></div></div>}
     </article>)}</div>
   </>}
   {api.syncing && <p role="status" className="studio-notice">Guardando cambios, espera un momento…</p>}
   {(failure || api.error) && <p role="alert" className="text-red-300 bg-red-950 p-4 rounded-xl">{failure || api.error}</p>}
   {message && <p role="status" className="text-emerald-300 bg-emerald-950 p-4 rounded-xl">{message}</p>}
 </section>;
}
