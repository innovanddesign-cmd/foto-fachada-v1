/** Provider output is untrusted. Copy only bounded fields understood by our renderer. */
export function initialCampaign(value: unknown) {
 if(!value||typeof value!=='object')return undefined;
 const b=value as Record<string,unknown>;
 const str=(k:string,max:number)=>typeof b[k]==='string'?(b[k] as string).trim().slice(0,max):'';
 const title=str('titulo',160),description=str('descripcion',800);
 if(!title||!description)return undefined;
 return {titulo:title,descripcion:description,layout:['heroe-centrado','heroe-dividido','galeria-cuadricula'].includes(String(b.layout))?String(b.layout):'heroe-centrado',
  objetivo:b.objetivo==='CITAS'?'CITAS' as const:'CONSULTAS' as const,publico:str('publico',400),motivoEscaneo:str('motivoEscaneo',400),textoCartel:str('textoCartel',160),cta:str('cta',70),mensajeWhatsApp:str('mensajeWhatsApp',500)};
}
