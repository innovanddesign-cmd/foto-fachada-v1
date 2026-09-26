"use client";
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { QRPersonalizado } from '@/components/ui/QRPersonalizado';
import { obtenerConfigLayout } from '@/lib/impresion/MotorDisenoImpresion';
import type { FormatoPoster, CampanaCartel } from '@/lib/estado/tipos-estado';
interface Props { formato?:FormatoPoster; campana?:CampanaCartel; configVisual?:{fraseImpacto:string;mostrarIconos:boolean;filtroPapel:boolean}; containerId?:string; }
export function GeneradorCartel({formato='A4',configVisual,containerId='poster-container'}:Props) {
 const s=useTiendaEstado(); const adn=s.adnMarca;
 if(!adn||!s.imagenSubida)return null;
 const dims=obtenerConfigLayout(formato); const unit=dims.anchoPx/794; const square=formato==='SQUARE';
 const name=adn.analisisVision?.nombreSugerido||'Mi negocio';
 const headline=configVisual?.fraseImpacto||'Descubre todo lo que tenemos para ti';
 const origin=typeof window!=='undefined'?window.location.origin:'';
 const url=`${origin}${process.env.NEXT_PUBLIC_BASE_PATH||''}/t/${s.slug||'demo'}`;
 const contact=[s.datosEscaparate?.datosReales?.telefono,s.redesSociales.instagram].filter(Boolean).join(' · ');
 return <div id={containerId} style={{width:dims.anchoPx,height:dims.altoPx,background:'#111b28',color:'#fff',fontFamily:'Inter, sans-serif',padding:36*unit,display:'flex',flexDirection:'column',gap:22*unit,overflow:'hidden'}}>
   <header style={{textAlign:'center',paddingBottom:8*unit}}><p style={{fontSize:13*unit,letterSpacing:3*unit,color:'#d3b47b',textTransform:'uppercase',marginBottom:14*unit}}>{adn.analisisVision?.categoriaSugerida}</p><h2 style={{fontSize:Math.min(46,name.length>38?32:46)*unit,lineHeight:1.1,fontWeight:700,overflowWrap:'anywhere'}}>{name}</h2></header>
   <div style={{display:'grid',gridTemplateColumns:square?'1fr 1fr':'1fr',gridTemplateRows:square?'1fr':'minmax(0,1fr) auto',gap:24*unit,flex:1,minHeight:0}}>
     <img src={s.imagenSubida.urlImagen} alt={`Fachada de ${name}`} style={{width:'100%',height:'100%',minHeight:0,objectFit:'cover',borderRadius:14*unit}} />
     <section style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:18*unit,padding:'4px 8px'}}><h3 style={{fontSize:(square?24:28)*unit,lineHeight:1.3,fontWeight:500,maxWidth:'100%',overflowWrap:'anywhere'}}>{headline}</h3><div style={{padding:14*unit,background:'#fff',borderRadius:12*unit}}><QRPersonalizado url={url} color="#111827" size={Math.round((square?170:184)*unit)} /></div><p style={{fontSize:16*unit,fontWeight:600,color:'#e5ca98'}}>Escanea y descubre nuestro escaparate</p></section>
   </div>
   {contact&&<footer style={{textAlign:'center',fontSize:14*unit,color:'#cbd5e1',borderTop:'1px solid #475569',paddingTop:16*unit,overflowWrap:'anywhere'}}>{contact}</footer>}
 </div>;
}
