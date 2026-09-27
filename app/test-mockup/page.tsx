"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Demo, findDemo } from '@/lib/marketing/demos';
export default function DesignDemo(){
 const [selected,setSelected]=useState<Demo|null>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{setSelected(findDemo(new URLSearchParams(window.location.search).get('demo')||'elite-estates')||null);setLoaded(true)},[]);
 return <main className="studio-shell h-dvh flex flex-col"><header className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-emerald-900"><Link href="/#ejemplos" className="studio-button">← Volver a los ejemplos</Link><p className="text-sm">{selected?.name||(loaded?'Ejemplo no disponible':'Cargando ejemplo…')} <span className="studio-muted">· Demo de diseño</span></p></header>{selected?<iframe title={selected.name+' · ejemplo adaptable'} src={'/design-references/'+selected.file} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="block min-h-0 flex-1 w-full border-0 bg-black"/>:loaded?<p className="studio-container py-12">Este ejemplo no está disponible. Vuelve a la galería para elegir otro diseño.</p>:null}</main>;
}
