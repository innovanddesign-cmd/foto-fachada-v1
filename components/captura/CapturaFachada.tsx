"use client";
import PortalIngesta from './PortalIngesta';
import FormularioActivos from './FormularioActivos';
import VistaPreviaGaleria from './VistaPreviaGaleria';
import BotonAnalisis from './BotonAnalisis';
export default function CapturaFachada() {
 return <div className="space-y-8 text-white"><section><h2 className="text-2xl font-semibold text-center mb-3">Una foto clara de tu fachada</h2><p className="text-slate-300 text-center mb-6">Incluye el nombre del negocio y su entrada. Después podrás revisar todos los datos.</p><PortalIngesta /></section><details className="rounded-2xl border border-slate-600 p-5"><summary className="cursor-pointer font-semibold py-2">Añadir logo, fotos y redes sociales (opcional)</summary><div className="mt-5"><VistaPreviaGaleria /><FormularioActivos /></div></details><BotonAnalisis /></div>;
}
