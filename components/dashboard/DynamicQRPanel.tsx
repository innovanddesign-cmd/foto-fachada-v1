"use client";
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
type QR = { slug: string; target_campaign_id: string | null; version: number };
type Destination = { campaign_id: string; slug: string };
export function DynamicQRPanel() {
 const [rows, setRows] = useState<QR[]>([]), [destinations, setDestinations] = useState<Destination[]>([]);
 const [choices, setChoices] = useState<Record<string, string>>({});
 const [loaded, setLoaded] = useState(false), [busy, setBusy] = useState(false);
 const [message, setMessage] = useState(''), [error, setError] = useState('');
 const [history, setHistory] = useState<{qr_slug:string;target_slug:string;version:number;scanned_at:string}[]>([]);
 const [clicks,setClicks]=useState<{action:string;landing_slug:string;clicked_at:string}[]>([]);
 const [clickSummary,setClickSummary]=useState('');
 const actionNames:Record<string,string>={whatsapp:'WhatsApp',phone:'Llamar',email:'Correo',maps:'Cómo llegar',link:'Web',instagram:'Instagram'};
 async function contactClicks(destination:Destination){
  const {data,error,count}=await createClient().from('escaparates_contact_clicks').select('action,landing_slug,clicked_at',{count:'exact'}).eq('campaign_id',destination.campaign_id).order('clicked_at',{ascending:false}).limit(20);
  if(error)throw error;
  setClicks(data||[]);setClickSummary(`${destination.slug}: ${count??0} clics de contacto registrados. Mostramos los últimos 20. Un clic no confirma que se haya enviado un mensaje ni reservado una cita.`);
 }
 async function run(action: () => Promise<void>) {
  setBusy(true); setError(''); setMessage('');
  try { await action(); } catch (e: any) { setError(e?.message || 'No se pudo completar la operación.'); } finally { setBusy(false); }
 }
 async function load() {
  const sb=createClient(); const {data:{user},error:authError}=await sb.auth.getUser();
  if(authError || !user) throw new Error('Inicia sesión para gestionar tus QR.');
  const [qr,targets]=await Promise.all([
   sb.from('escaparates_qr').select('slug,target_campaign_id,version').eq('owner_id',user.id).order('slug'),
   sb.from('escaparates_published').select('campaign_id,slug').eq('owner_id',user.id).order('slug')
  ]);
  if(qr.error || targets.error) throw qr.error || targets.error;
  setRows(qr.data||[]);setDestinations(targets.data||[]);setChoices({});setHistory([]);setClicks([]);setClickSummary('');setLoaded(true);
 }
 async function save(q:QR) {
  const target=choices[q.slug]; if(!target) return;
  const {data,error}=await createClient().from('escaparates_qr').update({target_campaign_id:target}).eq('slug',q.slug).eq('version',q.version).select('slug,target_campaign_id,version').single();
  if(error || !data) throw new Error('No se pudo cambiar el destino. Actualiza la lista: puede haber cambiado en otro dispositivo o haberse retirado la publicación.');
  setRows(old=>old.map(row=>row.slug===q.slug?data:row));setMessage('Destino actualizado. El QR impreso sigue siendo el mismo.');
 }
 async function scans(q:QR) {
  const {data,error}=await createClient().from('escaparates_qr_scans').select('qr_slug,target_slug,version,scanned_at').eq('qr_slug',q.slug).order('scanned_at',{ascending:false}).limit(20);
  if(error) throw error;setHistory(data||[]);setMessage(`Últimas ${data?.length||0} aperturas registradas de /t/${q.slug}. Son solicitudes de acceso, no personas únicas ni citas.`);
 }
 return <section className="studio-panel space-y-5" aria-busy={busy}>
  <h2 className="text-xl font-semibold">Tus QR reutilizables</h2>
  <p className="studio-muted">Conserva el cartel impreso y elige otra web publicada de tu cuenta. Los QR se crean al publicar; cambiar el destino conserva el histórico.</p>
  <button className="studio-button" disabled={busy} onClick={()=>void run(load)}>{busy?'Espera un momento…':loaded?'Actualizar mis QR':'Ver mis QR'}</button>
  {loaded && !rows.length && <p>No tienes QR publicados todavía.</p>}
  {rows.map(q=><div key={q.slug} className="border border-emerald-900 rounded-2xl p-5 space-y-3">
   <p className="font-semibold break-all">QR impreso: /t/{q.slug}</p>
   <p className="studio-muted">Destino actual: {destinations.find(d=>d.campaign_id===q.target_campaign_id)?.slug || 'Sin publicación disponible'}</p>
   <label className="studio-field">Nuevo destino de /t/{q.slug}
    <select disabled={busy} value={choices[q.slug]??q.target_campaign_id??''} onChange={e=>setChoices({...choices,[q.slug]:e.target.value})}>
     <option value="">Elige un escaparate publicado</option>
     {destinations.map(d=><option key={d.campaign_id} value={d.campaign_id}>{d.slug}</option>)}
    </select>
   </label>
   <div className="flex flex-wrap gap-3">
    <button className="studio-primary" disabled={busy||!choices[q.slug]||choices[q.slug]===q.target_campaign_id} onClick={()=>void run(()=>save(q))}>Guardar destino</button>
    <a className="studio-button" href={`${process.env.NEXT_PUBLIC_BASE_PATH||''}/t/${encodeURIComponent(q.slug)}`} target="_blank" rel="noreferrer">Probar QR</a>
    <button className="studio-button" disabled={busy} onClick={()=>void run(()=>scans(q))}>Ver últimas aperturas</button>
   </div>
  </div>)}
  {loaded&&destinations.length>0&&<div className="space-y-3"><h3 className="font-semibold">Clics de contacto en tus webs</h3><p className="studio-muted">Incluyen las visitas desde QR y desde enlaces directos. No contamos clics en la vista previa del editor.</p><div className="flex flex-wrap gap-2">{destinations.map(d=><button key={d.campaign_id} className="studio-button" disabled={busy} onClick={()=>void run(()=>contactClicks(d))}>Ver clics de {d.slug}</button>)}</div></div>}
  {clickSummary&&<p role="status" className="studio-notice">{clickSummary}</p>}
  {clicks.length>0&&<ul className="studio-muted space-y-2">{clicks.map((click,i)=><li key={i}>{new Date(click.clicked_at).toLocaleString('es-ES')} · {actionNames[click.action]||click.action} · {click.landing_slug}</li>)}</ul>}
  {error && <p role="alert" className="studio-notice">{error}</p>}
  {message && <p role="status" className="studio-notice">{message}</p>}
  {history.length>0 && <ul className="studio-muted space-y-2">{history.map((scan,i)=><li key={i}>{new Date(scan.scanned_at).toLocaleString('es-ES')} → {scan.target_slug} · versión {scan.version}</li>)}</ul>}
 </section>;
}
