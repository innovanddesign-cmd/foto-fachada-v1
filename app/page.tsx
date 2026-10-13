import Image from 'next/image';
import {ExamplesGallery} from '@/components/marketing/ExamplesGallery';
import Link from 'next/link';
import {ArrowUpRight, Camera, Sparkles, QrCode} from 'lucide-react';
import type {SectorId} from '@/lib/marketing/sectors';

const entrances: {sector:SectorId;image:string;name:string;detail:string;cta:string;goals:string[]}[] = [
 {sector:'inmobiliarias',image:'inmobiliaria',name:'Inmobiliaria',detail:'Cada campaña empieza con una prioridad: captar propietarios, dar visibilidad a un inmueble o dar a conocer tu agencia.',cta:'Preparar la campaña de mi inmobiliaria',goals:['Captar propiedades','Promocionar inmuebles','Dar a conocer mi agencia']},
 {sector:'estetica',image:'estetica',name:'Estética',detail:'Ayuda a que descubran tus tratamientos y den el primer paso para consultarte. Una campaña adaptada a tu centro y a su agenda.',cta:'Preparar la campaña de mi centro',goals:['Dar a conocer tratamientos','Cubrir huecos de agenda','Fomentar próximas visitas']},
 {sector:'peluquerias',image:'peluqueria',name:'Peluquería',detail:'Muestra lo que hace especial a tu salón. Convierte tus trabajos, servicios y disponibilidad en un motivo para pedir cita.',cta:'Preparar la campaña de mi peluquería',goals:['Atraer nuevos clientes','Mostrar mi especialidad','Dar salida a horas tranquilas']},
 {sector:'barberias',image:'barberia',name:'Barbería',detail:'Tu estilo merece verse antes de entrar. Presenta tus cortes, arreglos de barba y forma de atender con una campaña que tenga tu personalidad.',cta:'Preparar la campaña de mi barbería',goals:['Dar a conocer mi estilo','Comunicar disponibilidad','Conseguir próximas visitas']},
];

export default function Home() {
 return <main className="sector-home">
  <header className="sector-home-intro">
   <p className="studio-eyebrow">INNOVA · ESCAPARATES DIGITALES</p>
   <h1>Tu escaparate.<br/><span>El comienzo de algo más.</span></h1>
   <p>Descubre lo que podemos crear para tu negocio.<br className="hidden sm:block"/> Cada sector, sus objetivos y sus ejemplos. Todo en un mismo recorrido.</p>
   <a className="studio-button mt-6" href="#sectores">Descubrir mi sector <ArrowUpRight size={18}/></a>
  </header>
  <div id="sectores" className="home-sector-directory">
   <div id="ejemplos">
    {entrances.map((entry,i)=><section key={entry.sector} className="home-sector-block" aria-labelledby={'title-'+entry.sector}>
     <div className="home-sector-intro">
      <Link href={'/'+entry.sector} className="home-sector-building sector-building-card" aria-label={'Descubrir escaparates para '+entry.name.toLowerCase()}>
       <div className="sector-building-art"><Image src={'/sector-buildings/'+entry.image+'.png'} alt={'Edificio 3D de '+entry.name.toLowerCase()} width={1280} height={1280} sizes="(max-width: 700px) 90vw, 540px" priority={i===0}/></div>
      </Link>
      <div className="home-sector-copy">
       <p className="studio-eyebrow">0{i+1} · TU NEGOCIO, TU OBJETIVO</p>
       <h2 id={'title-'+entry.sector}>{entry.name}{entry.sector==='estetica'&&<span>y estética avanzada</span>}</h2>
       <p className="home-sector-description">{entry.detail}</p>
       <ul>{entry.goals.map(goal=><li key={goal}>{goal}</li>)}</ul>
       <Link className="studio-button home-sector-cta" href={'/'+entry.sector+'#objetivos'}>{entry.cta}<ArrowUpRight size={19}/></Link>
      </div>
     </div>
     <ExamplesGallery sector={entry.sector} embedded/>
    </section>)}
   </div>
  </div>
  <section className="sector-home-how" aria-label="Cómo funciona">
   <div><Camera size={20}/><p><strong>Tu negocio</strong><span>Una foto y tu objetivo.</span></p></div>
   <div><Sparkles size={20}/><p><strong>Tu campaña</strong><span>Web y cartel con un mismo mensaje.</span></p></div>
   <div><QrCode size={20}/><p><strong>Tu próxima oportunidad</strong><span>Un escaneo que facilita el contacto.</span></p></div>
  </section>
  <footer className="sector-home-footer"><span>INNOVA AND DESIGN</span><div><Link href="/dashboard">Ya tengo un escaparate</Link><Link href="/legal/terminos">Condiciones</Link><Link href="/legal/privacidad">Privacidad</Link></div></footer>
 </main>;
}