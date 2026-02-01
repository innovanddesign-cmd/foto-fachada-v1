"use client";

import { DatosEscaparate, SeccionEscaparate } from "@/lib/estado/tipos-estado";
import { HeroPro } from "./secciones/HeroPro";
import { BentoValor } from "./secciones/BentoValor";
import { useTiendaEstado } from "@/store/useTiendaEstado";

interface MotorRenderizadoProps {
    datos?: DatosEscaparate;
    vistaPrevia?: boolean;
}

export const MotorRenderizado = ({ datos, vistaPrevia = false }: MotorRenderizadoProps) => {
    // Si no se pasan datos, intentar obtenerlos del store (modo real)
    const datosStore = useTiendaEstado((s) => s.datosEscaparate);
    const data = datos || datosStore;

    if (!data) {
        return (
            <div className="w-full min-h-[50vh] flex items-center justify-center text-white/50">
                Esperando datos de generación...
            </div>
        );
    }

    // Extraer colores del ADN si existen en el store, si no usar defaults
    const adn = useTiendaEstado.getState().adnMarca;
    const colores = adn?.paletaColores || {
        primario: "#3b82f6",
        secundario: "#8b5cf6",
        acento: "#06b6d4",
        fondo: "#0f172a",
        superficieGlass: "rgba(255,255,255,0.1)"
    };

    return (
        <div className="w-full bg-slate-900 border-x border-slate-800/50 min-h-screen">
            {/* Si hay secciones definidas en el JSON (Fase 3) */}
            {data.secciones && data.secciones.length > 0 ? (
                data.secciones.map((seccion: SeccionEscaparate) => {
                    switch (seccion.tipo) {
                        case "Hero":
                            return (
                                <HeroPro
                                    key={seccion.id}
                                    titulo={seccion.contenido.titulo}
                                    subtitulo={seccion.contenido.descripcion}
                                    ctaTexto={seccion.contenido.cta?.texto}
                                    ctaAccion={seccion.contenido.cta?.accion}
                                    colores={colores}
                                />
                            );
                        case "Bento":
                            return (
                                <BentoValor
                                    key={seccion.id}
                                    elementos={seccion.contenido.elementos || []}
                                    colores={colores}
                                />
                            );
                        default:
                            return (
                                <div key={seccion.id} className="p-4 text-white/30 text-xs border border-dashed border-white/10 m-4 rounded">
                                    Sección no implementada: {seccion.tipo}
                                </div>
                            );
                    }
                })
            ) : (
                /* Fallback legacy v2 - Generar Hero con datos básicos */
                <HeroPro
                    titulo={data.titularPrincipal || "Bienvenido"}
                    subtitulo={data.subtitulo || "Explora nuestra colección"}
                    ctaTexto="Ver Ofertas"
                    ctaAccion="#ofertas"
                    colores={colores}
                />
            )}

            {/* Debug Info en modo vista previa */}
            {vistaPrevia && (
                <div className="fixed bottom-4 left-4 p-2 bg-black/80 text-white text-[10px] font-mono rounded pointer-events-none z-50">
                    Motor v2.3 :: {data.secciones?.length || 0} secciones
                </div>
            )}
        </div>
    );
};
