"use client";
import { useEffect, useState } from 'react';
import { buildLandingDocument } from '@/lib/design/render';

const examples: Record<string, {name:string;category:string;template:string;plan:string}> = {
 dining: {name:'Pure Modern Dining',category:'Restaurante mediterráneo',template:'dining',plan:'ESCAPARATE'},
 sofia: {name:'Sofia Lopardo',category:'Moda y estilo',template:'sofia',plan:'PRO'},
 salamandra: {name:'La Salamandra',category:'Parrilla y brasas',template:'salamandra',plan:'FREE'},
 belleza: {name:'Belleza Lux',category:'Belleza y bienestar',template:'belleza',plan:'PRO'},
 detail: {name:'Elite Detail Pro',category:'Cuidado del automóvil',template:'detail',plan:'ESCAPARATE'},
};
export default function DesignDemo() {
 const [html,setHtml]=useState(''); const [error,setError]=useState(false);
 useEffect(()=>{
  let active=true;
  const selected=examples[new URLSearchParams(window.location.search).get('demo')||'dining']||examples.dining;
  buildLandingDocument({business:{name:selected.name,category:selected.category,plan:selected.plan},content:{templateId:selected.template,title:selected.name,subtitle:selected.category,sections:[{type:'text',title:'Una experiencia con personalidad',text:'Diseño de referencia para visualizar la identidad de tu negocio.'},{type:'cta',text:'Conocer el negocio',url:'#contacto'}]},preview:true}).then(value=>{if(active)setHtml(value)}).catch(()=>{if(active)setError(true)});
  return()=>{active=false};
 },[]);
 if(error)return <main className="p-8 text-white">No se ha podido cargar el diseño. <button onClick={()=>window.location.reload()}>Reintentar</button></main>;
 return <main className="min-h-screen bg-slate-950">{html?<iframe title="Ejemplo de escaparate INNOVA" srcDoc={html} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="block h-screen w-full border-0"/>:<p className="p-8 text-white" role="status">Cargando diseño…</p>}</main>;
}
