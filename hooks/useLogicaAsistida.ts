"use client";

import { useTiendaEstado } from '@/store/useTiendaEstado';
import { useCallback, useMemo, useEffect } from 'react';

export interface PreguntaEdicion {
    id: string;
    seccionId: string; // ID de la sección en el escaparate que se edita
    pregunta: string;
    placeholder: string;
    campo: string; // Campo específico del contenido (ej: 'titulo', 'descripcion')
    tipo: 'texto' | 'opciones' | 'imagen';
    opciones?: string[];
    sugerenciasIA?: string[];
}

/**
 * useLogicaAsistida.ts
 * Motor de lógica para el Editor Conversacional Zen.
 */
export const useLogicaAsistida = () => {
    const {
        datosEscaparate,
        indicePreguntaActual,
        setIndicePregunta,
        actualizarSeccion,
        resaltarSeccion,
        adnMarca
    } = useTiendaEstado();

    // 1. Generar la lista de preguntas basada en la estructura actual del escaparate
    const preguntas = useMemo(() => {
        // En una versión final, esto podría venir de un análisis IA de la estructura
        // Por ahora, generamos el flujo estándar de edición
        return [
            {
                id: `hero-pro-titulo`,
                seccionId: 'hero-pro',
                pregunta: "¿Cuál es la promesa principal de tu negocio?",
                placeholder: "Ej: Cortes de autor que redefinen tu estilo",
                campo: 'titularPrincipal',
                tipo: 'texto',
                sugerenciasIA: [
                    `Redefine tu estilo con ${adnMarca?.analisisVision?.nombreSugerido}`,
                    "La excelencia en cada detalle",
                    "Tu destino premium en la ciudad"
                ]
            },
            {
                id: `hero-pro-subtitulo`,
                seccionId: 'hero-pro',
                pregunta: "¿Qué frase resume mejor tu valor único?",
                placeholder: "Ej: Expertos en colorimetría y diseño capilar",
                campo: 'subtitulo',
                tipo: 'texto'
            },
            {
                id: `bento-valor-titulo`,
                seccionId: 'bento-valor',
                pregunta: "¿Cómo quieres llamar a tu sección de servicios?",
                placeholder: "Ej: Nuestros Servicios Estrella",
                campo: 'titulo',
                tipo: 'texto'
            },
            {
                id: `conversion-core-cta`,
                seccionId: 'conversion-core',
                pregunta: "¿Qué acción principal debe realizar el cliente?",
                placeholder: "Ej: Reservar Cita",
                campo: 'cta',
                tipo: 'texto',
                sugerenciasIA: ["Solicitar Información", "Comprar Ahora", "Ver Catálogo"]
            }
        ] as PreguntaEdicion[];
    }, [adnMarca]);

    const preguntaActual = preguntas[indicePreguntaActual];

    // 2. Manejadores
    const avanzar = useCallback(() => {
        if (indicePreguntaActual < preguntas.length - 1) {
            setIndicePregunta(indicePreguntaActual + 1);
            const siguiente = preguntas[indicePreguntaActual + 1];
            if (siguiente) resaltarSeccion(siguiente.seccionId);
        } else {
            useTiendaEstado.getState().establecerPaso('DESPLIEGUE');
        }
    }, [indicePreguntaActual, preguntas, setIndicePregunta, resaltarSeccion]);

    const retroceder = useCallback(() => {
        if (indicePreguntaActual > 0) {
            setIndicePregunta(indicePreguntaActual - 1);
            const anterior = preguntas[indicePreguntaActual - 1];
            if (anterior) resaltarSeccion(anterior.seccionId);
        }
    }, [indicePreguntaActual, preguntas, setIndicePregunta, resaltarSeccion]);

    const responder = useCallback((valor: string) => {
        if (!preguntaActual) return;

        const store = useTiendaEstado.getState();
        const { datosEscaparate, regenerarEscaparate } = store;
        if (!datosEscaparate) return;

        let nuevosDatos = { ...datosEscaparate };

        // Mapeo inteligente según campo
        if (preguntaActual.campo === 'titularPrincipal') {
            nuevosDatos.titularPrincipal = valor;
            regenerarEscaparate(nuevosDatos);
        } else if (preguntaActual.campo === 'subtitulo') {
            nuevosDatos.subtitulo = valor;
            regenerarEscaparate(nuevosDatos);
        } else if (preguntaActual.campo === 'cta') {
            actualizarSeccion(preguntaActual.seccionId, {
                cta: { texto: valor, accion: '#' }
            });
        } else {
            actualizarSeccion(preguntaActual.seccionId, { [preguntaActual.campo]: valor });
        }

        avanzar();
    }, [preguntaActual, actualizarSeccion, avanzar]);

    // Efecto de Auto-Scroll en el Mockup
    useEffect(() => {
        if (preguntaActual) {
            // Nota: El scroll ocurre dentro del mockup, buscamos el elemento en el frame del mockup
            // Como no es un iframe, podemos buscarlo directamente en el DOM
            const el = document.getElementById(`section-${preguntaActual.seccionId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [preguntaActual]);

    return {
        preguntas,
        preguntaActual,
        indicePreguntaActual,
        avanzar,
        retroceder,
        responder,
        progreso: ((indicePreguntaActual + 1) / preguntas.length) * 100
    };
};
