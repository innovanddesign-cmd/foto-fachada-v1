'use client';
import {useEffect,useState} from 'react';
import {useTiendaEstado} from '@/store/useTiendaEstado';
export function FreeRegeneration(){
 const [kind,setKind]=useState('text'),[prompt,setPrompt]=useState(''),[available,setAvailable]=useState<Record<string,boolean>>({}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<{text?:string;image?:string}|null>(null);
 useEffect(()=>{fetch('/api/ai-free').then(r=>r.json()).then(setAvailable).catch(()=>setAvailable({}));},[]);
 async function generate(){setBusy(true);setError('');setResult(null);try{const r=await fetch('/api/ai-free',{method:'POST',headers:{'Content-Type':'application/json','x-request-id':crypto.randomUUID()},body:JSON.stringify({kind,prompt})});const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d);}catch(e){setError(e instanceof Error?e.message:'No se pudo generar.');}finally{setBusy(false);}}
 function apply(){if(!result)return;const s=useTiendaEstado.getState();if(!s.datosEscaparate)return;
  if(result.text)s.regenerarEscaparate({...s.datosEscaparate,datosReales:{...s.datosEscaparate.datosReales,descripcionValor:result.text}});
  if(result.image&&kind==='logo')s.actualizarAdn({logoExtraido:result.image});
  setResult(null);setError('Aplicado al borrador. Revisa antes de publicar.');
 }
 return <section className="studio-panel space-y-4"><h2 className="text-xl font-semibold">Regeneración gratuita</h2><p>No consume créditos. Sujeta a disponibilidad y límites de uso del proveedor.</p><label className="studio-field">Contenido<select value={kind} disabled={busy} onChange={e=>{setKind(e.target.value);setResult(null);}}><option value="text">Texto de presentación</option><option value="image">Imagen para descargar</option><option value="logo">Símbolo para el logo</option></select></label><label className="studio-field">Datos e instrucciones<textarea value={prompt} maxLength={4000} onChange={e=>setPrompt(e.target.value)}/></label>{!available[kind]&&<p role="status">Pendiente de conectar y validar el modelo gratuito. La edición manual sigue disponible.</p>}<button className="studio-button" disabled={busy||!available[kind]||!prompt.trim()} onClick={generate}>{busy?'Generando…':'Generar gratis · 0 créditos'}</button>{error&&<p role="status">{error}</p>}{result&&<div>{result.text&&<p className="whitespace-pre-wrap">{result.text}</p>}{result.image&&<><img src={result.image} alt="Propuesta generada" className="max-w-sm"/><a href={result.image} download="propuesta-innova.png">Descargar imagen</a></>}{kind!=='image'&&<button className="studio-button" onClick={apply}>Aplicar al borrador</button>}<button className="studio-button" onClick={()=>setResult(null)}>Descartar</button></div>}</section>;
}
