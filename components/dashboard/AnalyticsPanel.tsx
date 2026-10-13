'use client';
import {useState} from 'react';
type Totals={scans:number;clicks:number};
type Report={plan:string;from:string|null;to:string|null;current:Totals;previous:Totals|null;campaigns:({name:string;slug:string|null}&Totals)[];canExport:boolean};
export function AnalyticsPanel(){
 const [report,setReport]=useState<Report|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [from,setFrom]=useState(()=>new Date(Date.now()-29*86400000).toISOString().slice(0,10)),[to,setTo]=useState(()=>new Date().toISOString().slice(0,10));
 async function load(){setBusy(true);setError('');try{const r=await fetch('/api/analytics?'+new URLSearchParams({from,to}),{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error);setReport(d);}catch(e){setReport(null);setError(e instanceof Error?e.message:'No se pudo cargar el informe.');}finally{setBusy(false);}}
 function downloadURL(){if(!report?.canExport)return '';
  // Quote every cell and neutralize spreadsheet formulas in business names.
  const cell=(v:string|number|null)=>'"'+String(v??'').replace(/^(?:\s*[=+@\-]|[\t\r\n])/,"'$&").replaceAll('"','""')+'"';
  const rows=[['Periodo UTC',report.from,report.to],['Campaña','Aperturas QR','Clics de contacto'],['TOTAL',report.current.scans,report.current.clicks],...report.campaigns.map(c=>[c.name,c.scans,c.clicks]),...(report.previous?[['PERIODO ANTERIOR',report.previous.scans,report.previous.clicks]]:[])];
  return 'data:text/csv;charset=utf-8,'+encodeURIComponent('\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n'));
 }
 return <section className="studio-panel space-y-4" aria-busy={busy}><h2 className="text-xl font-semibold">Resultados de tus campañas</h2><p className="studio-muted">Aperturas de QR y clics de contacto registrados. Incluyen pruebas y visitas repetidas; no equivalen a personas únicas, citas ni ventas. Los clics también pueden proceder de enlaces directos.</p>
 <div className="flex flex-wrap gap-3 items-end">{report?.plan!=='FREE'&&<><label className="studio-field">Desde<input type="date" value={from} onChange={e=>setFrom(e.target.value)} /></label><label className="studio-field">Hasta<input type="date" value={to} onChange={e=>setTo(e.target.value)} /></label></>}<button className="studio-button" disabled={busy} onClick={load}>{busy?'Consultando…':'Consultar resultados'}</button></div>
 {error&&<p role="alert">{error}</p>}{report&&<><p className="studio-muted">{report.from?`${report.from} a ${report.to}, días completos en UTC.`:'Totales históricos · Free.'}</p><dl className="flex flex-wrap gap-8"><div><dt>Aperturas QR</dt><dd className="text-3xl font-semibold">{report.current.scans}</dd></div><div><dt>Clics de contacto</dt><dd className="text-3xl font-semibold">{report.current.clicks}</dd></div></dl>
 {report.previous&&<p>Periodo anterior de igual duración: {report.previous.scans} aperturas QR y {report.previous.clicks} clics. Diferencia: {report.current.scans-report.previous.scans} aperturas y {report.current.clicks-report.previous.clicks} clics.</p>}
 {report.campaigns.length>0&&<div className="overflow-x-auto"><table className="w-full text-left"><caption className="text-left studio-muted py-2">Por campaña de destino. Si cambiaste su dirección, las aperturas del enlace antiguo solo figuran en el total histórico.</caption><thead><tr><th className="p-2">Campaña</th><th className="p-2">QR</th><th className="p-2">Clics</th></tr></thead><tbody>{report.campaigns.map((c,i)=><tr key={i} className="border-t border-white/10"><td className="p-2 break-words">{c.name}</td><td className="p-2">{c.scans}</td><td className="p-2">{c.clicks}</td></tr>)}</tbody></table></div>}
 {report.plan==='FREE'&&<p className="studio-muted">Pro añade periodos y desglose por campaña. Business añade comparación con el periodo anterior y exportación.</p>}{report.canExport&&<a className="studio-button" href={downloadURL()} download={`analitica-${report.from}-${report.to}.csv`}>Descargar informe CSV</a>}</>}
 </section>;
}
