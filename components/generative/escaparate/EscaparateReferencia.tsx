"use client";
import {useEffect,useMemo,useState} from 'react';
import {useTiendaEstado} from '@/store/useTiendaEstado';
import type {EstadoTienda} from '@/lib/estado/tipos-estado';
type Snapshot = Pick<EstadoTienda,'adnMarca'|'datosEscaparate'|'galeriaActivos'|'imagenSubida'|'redesSociales'>;
import {resolverDatoHibrido} from '@/lib/sync/MotorSincroHibrida';
import {buildLandingDocument} from '@/lib/design/render';

/** Reuses the original INNOVA HTML art direction in every customer-facing view. */
export function EscaparateReferencia(){
 const adn=useTiendaEstado(s=>s.adnMarca);const datos=useTiendaEstado(s=>s.datosEscaparate);
 const activos=useTiendaEstado(s=>s.galeriaActivos);const foto=useTiendaEstado(s=>s.imagenSubida);const redes=useTiendaEstado(s=>s.redesSociales);
 return <VistaReferencia snapshot={{adnMarca:adn,datosEscaparate:datos,galeriaActivos:activos,imagenSubida:foto,redesSociales:redes}}/>;
}
export function VistaReferencia({snapshot}:{snapshot:Snapshot}){
 const {adnMarca:adn,datosEscaparate:datos,imagenSubida:foto,redesSociales:redes}=snapshot;const activos=snapshot.galeriaActivos||[];
 const [html,setHTML]=useState('');const [error,setError]=useState(false);const [retry,setRetry]=useState(0);
 const options=useMemo(()=>{
  const category=adn?.analisisVision?.categoriaSugerida||'';
  const name=adn?.analisisVision?.nombreSugerido||datos?.titularPrincipal||'Mi negocio';
  const desc=resolverDatoHibrido(datos,'descripcionValor');
  const services=datos?.ofertas?.map(x=>({title:x.titulo,text:x.descripcion,price:x.precio}))||[];
  const sections=[{type:'text',title:resolverDatoHibrido(datos,'titularPrincipal')||datos?.titularPrincipal||name,text:desc},
   ...(services.length?[{type:'services',title:/gastro|restaur|caf/i.test(category)?'Nuestra carta':'Nuestros servicios',items:services}]:[]),
   ...(datos?.secciones||[]).filter(s=>s.tipo==='Info'||s.tipo==='Promo').map(s=>({type:'text',title:s.contenido.titulo,text:s.contenido.descripcion})),
   ...(datos?.datosReales?.horario?[{type:'hours',title:'Horario',text:datos.datosReales.horario}]:[]),
   {type:'cta',text:resolverDatoHibrido(datos,'ctaPrincipal')||'Descubrir',action:datos?.datosReales?.telefono?'whatsapp':'link'}];
  return {business:{name,category,plan:datos?.planVisual||'PRO',description:desc,phone:datos?.datosReales?.telefono,whatsapp:datos?.datosReales?.telefono,website:redes?.web,instagram:redes?.instagram,logo:adn?.logoExtraido},
   content:{title:name,subtitle:resolverDatoHibrido(datos,'subtitulo')||category,heroImage:foto?.urlImagen,sections,gallery:activos.filter(x=>x.tipo==='OTRO').map(x=>({url:x.url,alt:x.nombreArchivo}))}};
 },[adn,datos,activos,foto,redes]);
 useEffect(()=>{let active=true;setError(false);buildLandingDocument(options).then(doc=>{if(active)setHTML(doc)}).catch(()=>{if(active)setError(true)});return()=>{active=false};},[options,retry]);
 if(error)return <div role="alert" className="p-8 text-center text-white"><p>No se pudo cargar el diseño.</p><button type="button" onClick={()=>setRetry(n=>n+1)} className="mt-4 rounded-lg bg-white px-6 py-3 text-black">Reintentar</button></div>;
 if(!html)return <div role="status" className="p-8 text-center text-white">Preparando tu escaparate…</div>;
 return <iframe title={options.business.name+' — Escaparate digital'} srcDoc={html} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" className="block w-full border-0" style={{height:'100svh',minHeight:640,background:'#101622'}}/>;
}

