/** Public rendering contract: only customer-facing content, never private analysis. */
const text=(v:unknown)=>typeof v==='string'?v:'';
const url=(v:unknown)=>typeof v==='string'&&(/^(https?:\/\/)/i.test(v)||/^\/(?!\/)/.test(v))&&!v.includes('/object/sign/')?v:'';
const fields=(v:any)=>Object.fromEntries(['titularPrincipal','subtitulo','descripcionValor','ctaPrincipal','mensajeWhatsApp','telefono','horario','direccion','email'].map(k=>[k,text(v?.[k])]));
export function sanearPayloadPublico(snapshot:Record<string,any>){
 const d=snapshot.datosEscaparate||{},a=snapshot.adnMarca||{};
 const color=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:undefined;
 const layout=['heroe-centrado','heroe-dividido','galeria-cuadricula'].includes(d.disenoSeleccionado)?d.disenoSeleccionado:undefined;
 return {adnMarca:{paletaColores:{primario:color(a.paletaColores?.primario),secundario:color(a.paletaColores?.secundario),acento:color(a.paletaColores?.acento),fondo:color(a.paletaColores?.fondo)},logoExtraido:url(a.logoExtraido),analisisVision:{nombreSugerido:text(a.analisisVision?.nombreSugerido),categoriaSugerida:text(a.analisisVision?.categoriaSugerida)}},
 datosEscaparate:{titularPrincipal:text(d.titularPrincipal),subtitulo:text(d.subtitulo),planVisual:d.planVisual,disenoSeleccionado:layout,datosReales:fields(d.datosReales),datosSugeridos:fields(d.datosSugeridos),ofertas:(Array.isArray(d.ofertas)?d.ofertas:[]).map((o:any)=>({titulo:text(o.titulo),descripcion:text(o.descripcion),precio:text(o.precio)})),secciones:(Array.isArray(d.secciones)?d.secciones:[]).filter((s:any)=>['Info','Promo'].includes(s.tipo)).map((s:any)=>({tipo:s.tipo,contenido:{titulo:text(s.contenido?.titulo),descripcion:text(s.contenido?.descripcion)}}))},
 imagenSubida:{urlImagen:url(snapshot.imagenSubida?.urlImagen)},galeriaActivos:(Array.isArray(snapshot.galeriaActivos)?snapshot.galeriaActivos:[]).filter((a:any)=>a.tipo==='OTRO'&&url(a.url)).map((a:any)=>({tipo:'OTRO',url:url(a.url),nombreArchivo:text(a.nombreArchivo)})),redesSociales:{web:url(snapshot.redesSociales?.web),instagram:text(snapshot.redesSociales?.instagram)}};
}
export type PayloadPublico=ReturnType<typeof sanearPayloadPublico>;
