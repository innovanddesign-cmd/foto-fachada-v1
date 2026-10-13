// A visitor is already on the landing: a second scan is never the next step.
function landingCopy(text: string) {
 const verbs: Record<string,string> = {consultar:'Consulta',ver:'Ve',conocer:'Conoce',reservar:'Reserva'};
 return text.replace(/escanea (?:el |este )?(?:código(?: QR)?|QR) para (consultar|ver|conocer|reservar)/gi, (_, verb: string) => verbs[verb.toLowerCase()]);
}

/** Provider output is untrusted. Copy only bounded fields understood by our renderer. */
export function initialCampaign(value: unknown) {
 if(!value||typeof value!=='object')return undefined;
 const b=value as Record<string,unknown>;
 const str=(k:string,max:number)=>typeof b[k]==='string'?(b[k] as string).trim().slice(0,max):'';
 const title=str('titulo',160),description=landingCopy(str('descripcion',800));
 if(!title||!description)return undefined;
 const secciones=Array.isArray(b.secciones)?b.secciones.slice(0,4).filter((x:any)=>x&&typeof x.titulo==='string'&&typeof x.texto==='string').map((x:any)=>({titulo:x.titulo.trim().slice(0,100),texto:landingCopy(x.texto.trim().slice(0,700))})).filter((x:any)=>x.titulo&&x.texto):[];
 return {secciones,titulo:title,descripcion:description,layout:['heroe-centrado','heroe-dividido','galeria-cuadricula'].includes(String(b.layout))?String(b.layout):'heroe-centrado',
  objetivo:b.objetivo==='CITAS'?'CITAS' as const:'CONSULTAS' as const,publico:str('publico',400),motivoEscaneo:str('motivoEscaneo',400),textoCartel:str('textoCartel',160),cta:str('cta',70),mensajeWhatsApp:str('mensajeWhatsApp',500)};
}
