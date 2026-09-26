"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
const examples: Record<string, { name: string; file: string }> = {
 salamandra:{name:'La Salamandra',file:'salamandra.html'},sofia:{name:'Sofia Lopardo',file:'sofia.html'},mango:{name:'Mango Manía',file:'mango.html'},quinchuqui:{name:'Quinchuqui',file:'quinchuqui.html'},belleza:{name:'Belleza Lux',file:'belleza.html'},detail:{name:'Elite Detail Pro',file:'detail-demo.html'},clinic:{name:'Dermascience Clinic',file:'clinic-demo.html'},dining:{name:'Pure Modern Dining',file:'dining-demo.html'}
};
export default function DesignDemo(){
 const [selected,setSelected]=useState<{name:string;file:string}|null>(null);
 useEffect(()=>{setSelected(examples[new URLSearchParams(window.location.search).get('demo')||'dining']||examples.dining)},[]);
 return <main className="studio-shell h-dvh flex flex-col"><header className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-emerald-900"><Link href="/#ejemplos" className="studio-button">← Volver a los ejemplos</Link><p className="text-sm">{selected?.name||'Cargando ejemplo…'} <span className="studio-muted">· Demo de diseño</span></p></header>{selected&&<iframe title={selected.name+' · diseño original'} src={'/design-references/'+selected.file} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="block min-h-0 flex-1 w-full border-0 bg-black"/>}</main>;
}
