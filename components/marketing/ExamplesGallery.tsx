'use client';

import {findDemo} from '@/lib/marketing/demos';
import {sectors,type SectorId} from '@/lib/marketing/sectors';
import {NeonPhone} from './NeonPhone';
import {ExamplesCarousel} from './ExamplesCarousel';
type Example={id:string;sector:SectorId;plan:'PRO'|'BUSINESS';format?:'web'|'landing'};
export const galleryExamples:Example[]=[
 {id:'elite_estates_showcase_v1',sector:'inmobiliarias',plan:'PRO'},
 {id:'minimalist_rentals_v3',sector:'inmobiliarias',plan:'PRO'},
 {id:'elite-estates',sector:'inmobiliarias',plan:'PRO',format:'landing'},
 {id:'elite-estates',sector:'inmobiliarias',plan:'BUSINESS',format:'web'},
 {id:'distrito-homes',sector:'inmobiliarias',plan:'PRO'},
 {id:'familyfirst',sector:'inmobiliarias',plan:'BUSINESS'},
 {id:'belleza-lux',sector:'estetica',plan:'PRO'},
 {id:'dermascience_clinic_v2',sector:'estetica',plan:'PRO'},
 {id:'glossy_chic_nail_spa_v1',sector:'estetica',plan:'PRO'},
 {id:'estetica-demo',sector:'estetica',plan:'PRO'},
 {id:'aura_luxe_aesthetics_v1',sector:'estetica',plan:'BUSINESS'},
 {id:'purezen_aesthetic_v3',sector:'estetica',plan:'BUSINESS'},
 {id:'ecohair_botanical_v4',sector:'peluquerias',plan:'PRO'},
 {id:'vivid_color_studio_v3',sector:'peluquerias',plan:'BUSINESS'},
 {id:'luxe_hair_artistry_v1',sector:'peluquerias',plan:'BUSINESS'},
 {id:'barberia-demo',sector:'barberias',plan:'PRO'},
 {id:'the_urban_barber_v2',sector:'barberias',plan:'BUSINESS'},
];
export function ExamplesGallery({sector,embedded=false}:{sector?:SectorId;embedded?:boolean}){
 const visible=galleryExamples.filter(e=>!sector||e.sector===sector);
 const galleryId=embedded?'ejemplos-'+sector:'ejemplos';
 const returnTo=embedded?'/#'+galleryId:sector?'/'+sector+'#ejemplos':'/#ejemplos';
 const heading=embedded?'Ejemplos para '+sectors[sector!].label.toLowerCase():sector?'Dos formas de presentar tu negocio.':'Todos los estilos. Un escaparate para ti.';
 return <section id={galleryId} className={'examples-gallery'+(embedded?' examples-gallery-embedded':'')} aria-labelledby={galleryId+'-title'}>
 <header>{!embedded&&<p className="studio-eyebrow">INSPÍRATE. IMAGINA TU NEGOCIO AQUÍ.</p>}{embedded?<h3 id={galleryId+'-title'} className="examples-section-title">{heading}</h3>:<h2 id={galleryId+'-title'}>{heading}</h2>}<p><strong>Pro</strong>: una landing con un objetivo. <strong>Business</strong>: una web con una presentación más amplia. Explora los dos estilos a continuación.</p></header>
 <p className="examples-note">Referencias visuales que adaptamos a tus fotografías, servicios y condiciones reales. Las funciones incluidas dependen del plan; las capturas se identifican al abrirlas.</p>
 <ExamplesCarousel id={galleryId+'-carousel'} items={visible.flatMap(e=>{const d=findDemo(e.id);return d?[{key:e.id+'-'+e.plan,name:d.name+' · '+e.plan,content:<div className="examples-item"><span className={'examples-plan-badge '+e.plan.toLowerCase()}>{e.plan==='PRO'?'PRO · LANDING':'BUSINESS · WEB AMPLIADA'}</span><NeonPhone id={e.id} name={d.name} sector={d.sector} format={e.format} returnTo={returnTo} previewOnly/></div>}]:[];})}/>
 </section>;
}