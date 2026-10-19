'use client';
import {useEffect,useRef,useState} from 'react';
import {createClient} from '@/lib/supabase/client';
export function EmailPreferences(){
 const [mode,setMode]=useState('immediate'),[zone,setZone]=useState('Europe/Madrid'),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');const generation=useRef(0);
 useEffect(()=>{if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return;const tracker=generation;
  const refresh=()=>{const version=++tracker.current;setReady(false);setMessage('');void fetch('/api/email-preferences',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(p=>{if(version===tracker.current){setMode(p.contact_mode);setZone(p.timezone);setReady(true);}}).catch(()=>{});};
  refresh();const {data}=createClient().auth.onAuthStateChange(()=>{setTimeout(refresh,0);});return()=>{tracker.current++;data.subscription.unsubscribe();};
 },[]);
 async function save(){const version=generation.current;setBusy(true);setMessage('');try{const r=await fetch('/api/email-preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,timezone:zone})});if(!r.ok)throw Error('No se guardaron las preferencias. Revisa la zona horaria.');if(version===generation.current)setMessage('Preferencias guardadas.');}catch(e){if(version===generation.current)setMessage(e instanceof Error?e.message:'No se pudo guardar.');}finally{setBusy(false);}}
 if(!ready)return null;
 return <section className="studio-panel space-y-3"><h2 className="text-xl font-semibold">Avisos de nuevas consultas</h2><label className="studio-field">Frecuencia<select disabled={busy} value={mode} onChange={e=>setMode(e.target.value)}><option value="immediate">Primer aviso inmediato; siguientes agrupados cada 15 minutos</option><option value="daily">Resumen diario a las 09:00</option><option value="off">Sin avisos de consultas</option></select></label><label className="studio-field">Zona horaria del negocio<input disabled={busy} value={zone} maxLength={100} onChange={e=>setZone(e.target.value)}/></label><p>Las consultas permanecen en el panel aunque desactives sus avisos. Los avisos esenciales se mantienen.</p><button className="studio-button" disabled={busy} onClick={save}>Guardar preferencias</button>{message&&<p role="status">{message}</p>}</section>;
}
