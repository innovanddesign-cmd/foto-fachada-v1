'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';

// Visual reference: https://21st.dev/@starc007/components/cylinder-carousel
// Original implementation using native scrolling so vertical page gestures remain available.
export function ExamplesCarousel({items,id}:{items:{key:string;name:string;content:ReactNode}[];id:string}){
 const track=useRef<HTMLDivElement>(null);
 const drag=useRef<{x:number;left:number}|null>(null);
 const [active,setActive]=useState(0);
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{
  const node=track.current;
  if(!node)return;
  let frame=0;
  const sync=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const center=node.getBoundingClientRect().left+node.clientWidth/2;
    let nearest=0,min=Infinity;
    Array.from(node.children).forEach((child,i)=>{
     const rect=child.getBoundingClientRect();
     const distance=Math.abs(rect.left+rect.width/2-center);
     if(distance<min){min=distance;nearest=i;}
    });
    setActive(nearest);
   });
  };
  node.addEventListener('scroll',sync,{passive:true});
  const observer=new ResizeObserver(sync);observer.observe(node);sync();
  return()=>{node.removeEventListener('scroll',sync);observer.disconnect();cancelAnimationFrame(frame);};
 },[items.length]);
 const go=(index:number)=>{
  const node=track.current;if(!node)return;
  const child=node.children[Math.max(0,Math.min(items.length-1,index))] as HTMLElement|undefined;
  if(!child)return;
  const delta=child.getBoundingClientRect().left+child.offsetWidth/2-(node.getBoundingClientRect().left+node.clientWidth/2);
  node.scrollTo({left:node.scrollLeft+delta,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 const finishDrag=()=>{drag.current=null;setDragging(false);};
 return <div className="examples-carousel" role="region" aria-roledescription="carrusel" aria-label="Diseños de ejemplo">
  <div className="examples-carousel-toolbar"><p id={id+'-help'}>Desliza para descubrir más diseños</p><div className="examples-carousel-arrows"><button type="button" aria-label="Ejemplo anterior" aria-controls={id} disabled={active===0} onClick={()=>go(active-1)}><ArrowLeft size={19}/></button><button type="button" aria-label="Ejemplo siguiente" aria-controls={id} disabled={active===items.length-1} onClick={()=>go(active+1)}><ArrowRight size={19}/></button></div></div>
  <div ref={track} id={id} className={'examples-carousel-track'+(dragging?' is-dragging':'')} tabIndex={0} aria-label="Galería deslizable" aria-describedby={id+'-help'}
   onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();go(event.key==='Home'?0:event.key==='End'?items.length-1:active+(event.key==='ArrowRight'?1:-1));}}}
   onPointerDown={event=>{if(event.pointerType!=='mouse'||event.button!==0||(event.target as Element).closest('a,button'))return;drag.current={x:event.clientX,left:event.currentTarget.scrollLeft};setDragging(true);event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault();}}
   onPointerMove={event=>{if(drag.current)event.currentTarget.scrollLeft=drag.current.left+drag.current.x-event.clientX;}}
   onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={finishDrag}>
   {items.map((item,i)=><div key={item.key} className="examples-carousel-slide" role="group" aria-roledescription="diapositiva" aria-label={(i+1)+' de '+items.length+': '+item.name} data-active={i===active} data-side={i<active?'left':'right'}><div className="examples-carousel-card">{item.content}</div></div>)}
  </div>
  <div className="examples-carousel-footer"><div className="examples-carousel-dots" aria-label="Elegir ejemplo">{items.map((item,i)=><button key={item.key} type="button" aria-label={'Ver ejemplo '+(i+1)+': '+item.name} aria-current={active===i?'true':undefined} onClick={()=>go(i)}><span/></button>)}</div><p aria-live="polite" aria-atomic="true">{active+1} / {items.length}</p></div>
 </div>;
}