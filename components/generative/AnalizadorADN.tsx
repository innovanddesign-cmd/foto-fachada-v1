"use client";

import { useEffect, useState } from "react";
import { useTiendaEstado } from "@/store/useTiendaEstado";
import { AIService } from "@/services/ai";
import { EscaneoProgresivo } from "./EscaneoProgresivo";
import { VistaResultados } from "./VistaResultados";
import { AdnMarca } from "@/lib/estado/tipos-estado";

export const AnalizadorADN = () => {
    const imagenSubida = useTiendaEstado((s) => s.imagenSubida);
    const completarAnalisis = useTiendaEstado((s) => s.completarAnalisis);

    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [analizado, setAnalizado] = useState(false);
    const [resultadoAdn, setResultadoAdn] = useState<AdnMarca | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Si no hay imagen, no hacemos nada (el Page.tsx redirigirá a captura)
        if (!imagenSubida || !imagenSubida.urlImagen) {
            return;
        }

        let isMounted = true;

        const ejecutarAnalisis = async () => {
            try {
                const startTime = Date.now();

                // Ejecutar análisis (simulado)
                const adn = await AIService.analizarImagen(imagenSubida.urlImagen);

                const endTime = Date.now();
                const duration = endTime - startTime;
                const minDuration = 4000; // 4 segundos de show

                if (duration < minDuration) {
                    await new Promise(resolve => setTimeout(resolve, minDuration - duration));
                }

                if (isMounted) {
                    setResultadoAdn(adn);
                    setAnalizado(true);
                }

            } catch (err) {
                console.error("Error en análisis:", err);
                if (isMounted) setError("Error al procesar la fachada. Intenta nuevamente.");
            }
        };

        ejecutarAnalisis();

        return () => { isMounted = false; };
    }, [imagenSubida, mounted]);

    const manejarContinuar = async () => {
        if (!resultadoAdn) return;

        try {
            // Generar escaparate justo antes de pasar al siguiente paso
            const escaparate = await AIService.generarEscaparate(resultadoAdn);

            // Persistencia en sessionStorage (SEMILLA_V2)
            const seedData = {
                version: "2.2.0",
                fase_activa: 2,
                fase_nombre: "Analisis_Brand_DNA",
                estandar_visual: "Aero-Glassmorphism",
                datos_previos: "CARGADOS_Fase1",
                status_objetivo: "READY_FOR_SHOWCASE",
                resultado_adn: resultadoAdn
            };
            sessionStorage.setItem("SEMILLA_V2", JSON.stringify(seedData));

            // Completar en Store Global
            completarAnalisis(resultadoAdn, escaparate);
        } catch (err) {
            console.error("Error al generar escaparate:", err);
            setError("Error al preparar la siguiente fase.");
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 backdrop-blur-xl rounded-3xl border border-red-500/30 text-red-200">
                <p>⚠️ {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (analizado && resultadoAdn) {
        return (
            <VistaResultados
                adn={resultadoAdn}
                onContinuar={manejarContinuar}
                onReiniciar={() => useTiendaEstado.getState().reiniciar()}
            />
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[60vh] py-12">
            <EscaneoProgresivo />

            <div className="mt-8 text-center space-y-2">
                <p className="text-white/50 text-sm animate-pulse">
                    Procesando datos biométricos del edificio...
                </p>
                <p className="text-xs text-white/30 font-mono">
                    MOTOR NEURONAL v2.2 ACTIVO
                </p>
            </div>
        </div>
    );
};
