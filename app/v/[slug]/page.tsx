"use client";
import {useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {loadPublishedBySlug} from '@/lib/supabase/persistence';
import {VistaReferencia} from '@/components/generative/escaparate/EscaparateReferencia';
export default function PublicPage(){
 const {slug}=useParams<{slug:string}>();const [result,setResult]=useState<any>(null);const [error,setError]=useState('');
 useEffect(()=>{let active=true;setResult(null);setError('');loadPublishedBySlug(slug).then(r=>{if(!active)return;if(r.error||!r.data)setError(r.error==='NOT_FOUND'?'Este escaparate no está publicado.':'No se pudo cargar el escaparate.');else setResult(r.data);}).catch(()=>{if(active)setError('No se pudo conectar. Vuelve a intentarlo.');});return()=>{active=false};},[slug]);
 if(error)return <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-5 p-8"><h1>{error}</h1><button onClick={()=>window.location.reload()} className="rounded-lg bg-white text-black px-5 py-3">Reintentar</button></main>;
 if(!result)return <main role="status" className="min-h-screen bg-slate-950 text-white p-8">Cargando escaparate…</main>;
 const payload=result.payload;return <VistaReferencia snapshot={{...payload,datosEscaparate:{...payload.datosEscaparate,planVisual:result.plan},galeriaActivos:payload.galeriaActivos||[]}}/>;
}
