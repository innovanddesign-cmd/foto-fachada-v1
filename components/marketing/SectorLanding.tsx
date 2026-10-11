"use client";
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {sectors,type SectorId} from '@/lib/marketing/sectors';
import {findDemo} from '@/lib/marketing/demos';
import {NeonPhone} from './NeonPhone';
import {PlanPricing} from './PlanPricing';
export function SectorLanding({sector}:{sector:SectorId}) {
 const c=sectors[sector],router=useRouter();
 function start(){router.push('/create?sector='+sector+'&paso=CAPTURA');}
 return <main className="studio-shell"><section className="studio-container"><Link className="studio-button" href="/#sectores">← Elegir otro sector</Link><p className="studio-eyebrow mt-8">INNOVA ESCAPARATES · {c.label}</p><h1 className="text-4xl sm:text-6xl font-semibold max-w-4xl mt-5">{c.title}</h1><p className="studio-muted text-lg max-w-2xl mt-6">{c.description}</p><div className="flex flex-wrap gap-3 mt-8"><button className="studio-primary" onClick={start}>Crear mi escaparate de {c.category.toLowerCase()}</button><a className="studio-button" href="#ejemplos">Ver ejemplos de mi sector</a></div><p className="studio-muted mt-4">Revisa la propuesta antes de publicar. Puedes empezar y editar manualmente.</p></section><section className="studio-container grid md:grid-cols-3 gap-5">{['Presenta tu negocio y el objetivo de tu campaña','Revisa la estrategia, los textos y el diseño','Publica tu web y prepara el cartel con QR'].map((text,i)=><article className="studio-panel" key={text}><h2 className="text-xl font-semibold">{i+1}. {text}</h2></article>)}</section><section id="ejemplos" className="studio-container scroll-mt-24"><h2 className="text-3xl font-semibold">Ejemplos para {c.label.toLowerCase()}</h2><p className="studio-muted mt-3">Referencias de diseño. Tu campaña utilizará tus propios datos y fotografías.</p><div className="innova-phone-gallery">{c.demos.map(id=>{const d=findDemo(id)!;return <NeonPhone key={id} id={id} name={d.name} sector={d.sector} returnTo={'/'+sector+'#ejemplos'}/>})}</div></section><PlanPricing sector={sector} onCreate={start}/><section className="studio-container"><Link href="/legal/terminos" className="studio-button">Condiciones del servicio</Link></section></main>;
}
