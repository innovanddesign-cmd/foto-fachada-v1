"use client";
import Link from 'next/link';
import { findDemo } from '@/lib/marketing/demos';
import { useEffect, useRef, useState } from 'react';

const outline = 'M 450 0 L 756 0 A 144 144 0 0 1 900 144 L 900 1756 A 144 144 0 0 1 756 1900 L 144 1900 A 144 144 0 0 1 0 1756 L 0 144 A 144 144 0 0 1 144 0 Z';
export function NeonPhone({ id, name, sector, priority = false }: { id: string; name: string; sector: string; priority?: boolean }) {
 const screen = useRef<HTMLDivElement>(null);
 const [width, setWidth] = useState(260);
 useEffect(() => {
  if (!screen.current) return;
  const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
  observer.observe(screen.current);
  return () => observer.disconnect();
 }, []);
 const demo = findDemo(id);
 if (!demo) return null;
 const file = demo.landingFile || demo.file;
 return <article className="innova-phone-example">
  <div className="innova-phone-heading"><h3>{sector}</h3><p>{name}</p></div>
  <Link href={'/test-mockup?demo=' + id + (demo.landingFile ? '&format=landing' : '')} aria-label={'Explorar diseño de ' + name} className="innova-phone">
   <svg className="innova-phone-neon" viewBox="0 0 900 1900" preserveAspectRatio="none" aria-hidden="true"><path d={outline} className="innova-phone-base"/><path d={outline} pathLength="100" className="innova-phone-blue"/><path d={outline} pathLength="100" className="innova-phone-green"/></svg>
   <div ref={screen} className="innova-phone-screen"><iframe title={'Vista previa de ' + name} src={'/design-references/' + file} loading={priority ? 'eager' : 'lazy'} tabIndex={-1} aria-hidden="true" scrolling="no" sandbox="" style={{width:390,height:Math.round(390 * 1900 / 900 * .92),top:width * 1900 / 900 * .08,transform:`scale(${width / 390})`}}/></div>
   <span className="innova-phone-camera" aria-hidden="true"/>
  </Link>
  <Link href={'/test-mockup?demo=' + id + (demo.landingFile ? '&format=landing' : '')} className="innova-phone-open">Explorar diseño <span aria-hidden="true">↗</span></Link>
 </article>;
}
