'use client';
import { AIProposal } from './AIProposal';
import { FreeRegeneration } from './FreeRegeneration';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { DatosEscaparateBase } from '@/lib/estado/tipos-estado';

/** Direct, revisitable editing: no hidden conversational steps or shared progress index. */
export function EditorNegocio() {
  const s = useTiendaEstado();
  const datos = s.datosEscaparate;
  if (!datos || !s.adnMarca) return <p>Completa primero la información del negocio.</p>;
  function update(key: keyof DatosEscaparateBase, value: string) {
    const current = useTiendaEstado.getState().datosEscaparate;
    if (!current) return;
    s.regenerarEscaparate({ ...current, ...(key === 'titularPrincipal' || key === 'subtitulo' ? { [key]: value } : {}), datosReales: { ...current.datosReales, [key]: value } });
  }
  return <div className="studio-panel space-y-6">
    <div><h2 className="text-xl font-semibold">Contenido de tu web</h2><p className="studio-muted mt-2">Edita cualquier campo. La vista previa se actualiza mientras escribes.</p></div>
    <label className="studio-field">Nombre del negocio<input value={s.adnMarca.analisisVision?.nombreSugerido || ''} onChange={e => s.adnMarca?.analisisVision && s.actualizarAdn({ analisisVision: { ...s.adnMarca.analisisVision, nombreSugerido: e.target.value } })} /></label>
    <label className="studio-field">Especialidad<input value={s.adnMarca.analisisVision?.categoriaSugerida || ''} onChange={e => s.adnMarca?.analisisVision && s.actualizarAdn({ analisisVision: { ...s.adnMarca.analisisVision, categoriaSugerida: e.target.value } })} /><span className="studio-muted text-sm">Por ejemplo: venta de viviendas, tratamientos de estética o corte y barba.</span></label>
    {([
      ['titularPrincipal', 'Titular de presentación'], ['subtitulo', 'Subtítulo'], ['descripcionValor', 'Descripción del negocio'],
      ['ctaPrincipal', 'Texto del botón principal'], ['mensajeWhatsApp', 'Mensaje inicial de WhatsApp'], ['telefono', 'Teléfono / WhatsApp con prefijo de país'], ['horario', 'Horario de atención'], ['email', 'Correo electrónico'], ['direccion', 'Dirección del negocio']
    ] as [keyof DatosEscaparateBase, string][]).map(([key, label]) => <label key={key} className="studio-field">{label}
      {key === 'descripcionValor' || key === 'horario' || key === 'mensajeWhatsApp' ? <textarea rows={3} value={datos.datosReales?.[key] ?? datos.datosSugeridos?.[key] ?? ''} onChange={e => update(key, e.target.value)} /> :
        <input type={key === 'telefono' ? 'tel' : key === 'email' ? 'email' : 'text'} value={datos.datosReales?.[key] ?? (key === 'titularPrincipal' || key === 'subtitulo' ? datos[key] : datos.datosSugeridos?.[key]) ?? ''} onChange={e => update(key, e.target.value)} />}
    </label>)}
    <fieldset className="space-y-4"><legend className="font-semibold">Colores de tu marca</legend>{(['primario','secundario','acento','fondo'] as const).map(key => <label key={key} className="studio-field">{key}<input type="color" value={/^#[0-9a-f]{6}$/i.test(s.adnMarca?.paletaColores[key] || '') ? s.adnMarca!.paletaColores[key] : '#101622'} onChange={e => s.adnMarca && s.actualizarAdn({paletaColores:{...s.adnMarca.paletaColores,[key]:e.target.value}})} /></label>)}</fieldset>
    <fieldset className="space-y-4"><legend className="font-semibold mb-3">Servicios del negocio</legend>
      <p className="studio-muted text-sm">Añade solo servicios reales. Puedes quitar las propuestas que no correspondan a tu negocio.</p>
      {datos.ofertas.map((offer, i) => <div key={i} className="border border-emerald-900 p-4 rounded-xl space-y-3">
        {(['titulo', 'descripcion', 'precio'] as const).map(key => <label className="studio-field" key={key}>{key === 'titulo' ? 'Nombre del servicio' : key === 'precio' ? 'Precio o información de precio' : 'Descripción'}<input value={offer[key] || ''} onChange={e => s.regenerarEscaparate({ ...datos, ofertas: datos.ofertas.map((o, j) => j === i ? { ...o, [key]: e.target.value } : o) })} /></label>)}
        <button className="studio-button" onClick={() => s.regenerarEscaparate({ ...datos, ofertas: datos.ofertas.filter((_, j) => j !== i) })}>Quitar servicio {i + 1}</button>
      </div>)}
      <button className="studio-button" onClick={() => s.regenerarEscaparate({ ...datos, ofertas: [...datos.ofertas, { titulo: '', descripcion: '', precio: '' }] })}>Añadir servicio</button>
    </fieldset>
    <fieldset className="space-y-4"><legend className="font-semibold mb-3">Enlaces de contacto</legend>
      {(['instagram', 'web'] as const).map(key => <label key={key} className="studio-field">{key === 'web' ? 'Web externa (https://…) ' : 'Instagram (URL o usuario)'}<input type="text" value={s.redesSociales[key] || ''} onChange={e => s.actualizarRedes({ [key]: e.target.value })} /></label>)}
    </fieldset>
    <AIProposal />
    <FreeRegeneration />
    <p className="studio-notice">Estos cambios son un borrador. En «Publicar» puedes guardarlos en tu cuenta y actualizar la web pública.</p>
  </div>;
}
