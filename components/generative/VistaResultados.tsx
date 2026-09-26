"use client";
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { AdnMarca } from '@/lib/estado/tipos-estado';
import { EscaparateReferencia } from './escaparate/EscaparateReferencia';
import { ArrowRight, Printer } from 'lucide-react';
export function VistaResultados({ adn, onContinuar, onReiniciar }: { adn: AdnMarca; onContinuar: () => void; onReiniciar: () => void }) {
 const datos = useTiendaEstado(s => s.datosEscaparate);
 const update = useTiendaEstado(s => s.regenerarEscaparate);
 const plan = datos?.planVisual || 'PRO';
 return <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6 items-start">
   <div className="space-y-6"><section className="studio-panel space-y-5"><div><h2 className="text-2xl font-semibold">{adn.analisisVision?.nombreSugerido || 'Tu negocio'}</h2><p className="studio-muted mt-2">{adn.analisisVision?.categoriaSugerida || 'Revisa el sector en Contenido'}</p></div>
   {!adn.analisisVision?.confianzaAnalisis && <p className="studio-notice">Modo manual: revisa los textos y los datos antes de publicar.</p>}
   <fieldset className="space-y-3"><legend className="font-semibold mb-3">Presentación de la web</legend>{(['FREE','PRO','ESCAPARATE'] as const).map(p => <label key={p} className={'flex items-start gap-3 p-4 rounded-xl border cursor-pointer '+(plan === p ? 'border-blue-600 bg-blue-50' : 'border-slate-200')}><input className="mt-1 accent-blue-600" type="radio" name="plan-visual" checked={p === plan} onChange={() => datos && update({...datos,planVisual:p})} /><span><span className="block font-semibold">{p}</span><span className="block text-sm studio-muted mt-1">{p === 'ESCAPARATE' ? 'Presentación completa con secciones y contenido ampliado.' : 'Presentación directa con imagen del negocio y accesos de contacto.'}</span></span></label>)}</fieldset><p className="studio-muted text-sm">Esta selección cambia la vista previa. No contrata ni cobra un plan.</p>
   <button className="studio-primary w-full" onClick={onContinuar}>Editar contenido <ArrowRight size={18}/></button><button className="studio-button w-full" onClick={() => useTiendaEstado.getState().establecerPaso('CARTELERIA')}><Printer size={18}/> Preparar cartel</button></section>
   <details className="studio-panel"><summary className="font-semibold cursor-pointer">Identidad y propuesta del negocio</summary><p className="studio-muted mt-4">{adn.analisisMarketing}</p><div className="flex gap-2 mt-4">{Object.entries(adn.paletaColores).filter(([key])=>key!=='superficieGlass').map(([key,color]) => <div key={key} className="flex-1"><div className="h-10 rounded-lg border border-slate-300" style={{background:color}}/><span className="text-xs studio-muted">{key}</span></div>)}</div><button className="studio-button mt-5" onClick={onReiniciar}>Cambiar foto</button></details></div>
   <section className="studio-panel min-w-0"><h2 className="font-semibold mb-2">Vista previa del cliente</h2><p className="studio-muted text-sm mb-4">Desplázate dentro de la web para revisar sus secciones.</p><div className="rounded-2xl overflow-hidden bg-slate-900"><EscaparateReferencia /></div></section>
 </div>;
}
