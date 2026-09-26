"use client";
import { useState } from 'react';
import { Download, Printer, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { GeneradorCartel } from './GeneradorCartel';
import { PosterViewport } from './PosterViewport';
import { exportarCartel } from '@/lib/impresion/ExportadorPDF';
import type { FormatoPoster, CartelGenerado } from '@/lib/estado/tipos-estado';

export function BibliotecaCarteles() {
 const s = useTiendaEstado();
 const [format, setFormat] = useState<FormatoPoster>(s.cartelesGenerados[0]?.formato || 'A4');
 const [headline, setHeadline] = useState(s.cartelesGenerados[0]?.configVisual.fraseImpacto || '');
 const [busy, setBusy] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [selected, setSelected] = useState<string | null>(s.cartelesGenerados[0]?.id || null);
 const [pendingDelete, setPendingDelete] = useState<string | null>(null);
 const config = { fraseImpacto: headline, mostrarIconos: true, filtroPapel: false };
 if (!s.adnMarca || !s.imagenSubida) return <div className="studio-panel"><p>Abre un escaparate con foto para preparar su cartel.</p><button className="studio-button mt-4" onClick={() => s.establecerPaso('ESCAPARATE')}>Volver al diseño</button></div>;
 async function download(type: 'PNG' | 'PDF') {
   if (busy) return;
   setBusy(true); setError(''); setMessage('');
   try {
     await exportarCartel('poster-container', { formato: type, papel: format, nombreArchivo: `cartel-${format}`, escala: 3 });
     setMessage(type === 'PNG' ? 'Imagen preparada para descargar.' : 'Ventana de impresión abierta. Elige guardar como PDF o tu impresora.');
   } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo exportar. Inténtalo de nuevo.'); }
   finally { setBusy(false); }
 }
 function save() {
   const prior = s.cartelesGenerados.find(c => c.id === selected);
   const cartel: CartelGenerado = { id: selected || crypto.randomUUID(), formato: format, campana: prior?.campana || { id: crypto.randomUUID(), nombre: `Cartel ${s.cartelesGenerados.length + 1}`, estado: 'BORRADOR', fechaCreacion: new Date().toISOString() }, configVisual: config };
   s.guardarCartel(cartel); setSelected(cartel.id); setMessage('Diseño guardado en este dispositivo.');
 }
 return <section className="grid lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] gap-6 items-start">
   <div className="space-y-6">
     <div className="studio-panel space-y-5">
       <button className="studio-button" onClick={() => s.establecerPaso('CONFIGURACION')}><ArrowLeft size={18} /> Volver al contenido</button>
       <div><h2 className="text-xl font-semibold">Diseña tu cartel</h2><p className="studio-muted mt-2">Elige un formato y una frase breve que invite a escanear.</p></div>
       <fieldset><legend className="font-medium mb-3">Formato</legend><div className="flex flex-wrap gap-2">{(['A4', 'A5', 'SQUARE'] as const).map(f => <button key={f} aria-pressed={format === f} className={format === f ? 'studio-primary' : 'studio-button'} onClick={() => setFormat(f)}>{f === 'SQUARE' ? 'Cuadrado' : f}</button>)}</div></fieldset>
       <label className="studio-field">Frase del cartel<textarea rows={3} maxLength={160} value={headline} placeholder="Descubre todo lo que tenemos para ti" onChange={e => setHeadline(e.target.value)} /></label>
       <div className="flex flex-wrap gap-3"><button className="studio-primary" disabled={busy} onClick={() => download('PNG')}><Download size={18} /> Descargar PNG</button><button className="studio-button" disabled={busy} onClick={() => download('PDF')}><Printer size={18} /> Imprimir / PDF</button></div>
       <button className="studio-button w-full" onClick={save}><Plus size={18} /> {selected ? 'Guardar cambios del cartel' : 'Guardar diseño local'}</button>
       <p className="studio-notice">Publica primero tu escaparate y comprueba el QR antes de imprimir. Guardar un cartel no publica la web.</p>
       {busy && <p role="status">Preparando archivo…</p>}{message && <p role="status" className="text-emerald-300">{message}</p>}{error && <p role="alert" className="text-red-300">{error}</p>}
     </div>
     <div className="studio-panel"><h2 className="font-semibold mb-4">Diseños en este dispositivo ({s.cartelesGenerados.length})</h2>
       {!s.cartelesGenerados.length && <p className="studio-muted">Guarda tu primer diseño para volver a editarlo aquí.</p>}
       <ul className="space-y-3">{s.cartelesGenerados.map(c => <li key={c.id} className="rounded-xl border border-emerald-900 p-3"><div className="flex flex-wrap items-center gap-2"><button className="studio-button flex-1" onClick={() => { setSelected(c.id); setFormat(c.formato); setHeadline(c.configVisual.fraseImpacto); setMessage('Diseño abierto.'); }}>{c.campana.nombre} · {c.formato}</button><button className="studio-button" aria-label={`Eliminar ${c.campana.nombre}`} onClick={() => setPendingDelete(c.id)}><Trash2 size={18} /></button></div>{pendingDelete === c.id && <div className="mt-3 space-y-2"><p>¿Eliminar este diseño local?</p><div className="flex gap-2"><button className="studio-button" onClick={() => { s.eliminarCartel(c.id); if (selected === c.id) setSelected(null); setPendingDelete(null); }}>Eliminar diseño</button><button className="studio-button" onClick={() => setPendingDelete(null)}>Cancelar</button></div></div>}</li>)}</ul>
     </div>
   </div>
   <div className="rounded-3xl bg-[#080b09] p-4 sm:p-8 min-w-0"><p className="text-slate-300 text-sm mb-5 text-center">Vista previa · {format === 'SQUARE' ? 'Cuadrado' : format}</p><PosterViewport formato={format}><GeneradorCartel formato={format} configVisual={config} /></PosterViewport></div>
 </section>;
}
