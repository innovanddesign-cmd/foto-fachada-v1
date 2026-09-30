"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Demo, findDemo } from '@/lib/marketing/demos';
export default function DesignDemo(){
 const [selected,setSelected]=useState<Demo|null>(null);
 const [loaded,setLoaded]=useState(false);
 const [format,setFormat]=useState<'web'|'landing'>('web');
 useEffect(()=>{const p=new URLSearchParams(window.location.search);const demo=findDemo(p.get('demo')||'elite-estates')||null;setSelected(demo);setFormat(p.get('format')==='web'?'web':demo?.landingFile?'landing':'web');setLoaded(true)},[]);
 const file=format==='landing'&&selected?.landingFile?selected.landingFile:selected?.file;
 const choose=(value:'web'|'landing')=>{setFormat(value);const u=new URL(window.location.href);u.searchParams.set('format',value);window.history.replaceState(null,'',u)};
 return <main className="studio-shell h-dvh flex flex-col">
 <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-emerald-900">
 <Link href="/#ejemplos" className="studio-button">← Volver a los ejemplos</Link>
 <p className="text-sm">{selected?.name||(loaded?'Ejemplo no disponible':'Cargando ejemplo…')} <span className="studio-muted">· {selected?.realCase?'Caso real':'Propuesta de diseño'}</span></p>
 {selected?.landingFile&&<nav aria-label="Formato del ejemplo" className="flex gap-2">{(['web','landing'] as const).map(value=><button key={value} type="button" className="studio-button min-h-11" aria-pressed={format===value} onClick={()=>choose(value)} style={format===value?{borderColor:'#00e6a8',color:'#00e6a8'}:undefined}>{value==='web'?'Web completa':'Landing QR'}</button>)}</nav>}
 {selected?.realCase&&<a className="studio-button min-h-11" href={selected.landingUrl} target="_blank" rel="noopener noreferrer">Abrir landing original ↗</a>}
 </header>
 {selected?<iframe key={file} title={selected.name+(format==='landing'||selected.realCase?' · Landing QR':' · Web completa')} src={'/design-references/'+file} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="block min-h-0 flex-1 w-full border-0 bg-white"/>:loaded?<p className="studio-container py-12">Este ejemplo no está disponible. Vuelve a la galería para elegir otro diseño.</p>:null}
 </main>;
}
