"use client";

import { useEffect, useState } from "react";
import { useTiendaEstado } from "@/store/useTiendaEstado";
import { AIService } from "@/services/ai";
import { EscaneoProgresivo } from "./EscaneoProgresivo";
import { VistaResultados } from "./VistaResultados";
import InformeIdentidad from "./InformeIdentidad";
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

                // Convertir blob URL / object URL a base64 para enviar a la API
                let imagenBase64 = imagenSubida.urlImagen;
                if (imagenBase64.startsWith('blob:') || imagenBase64.startsWith('http')) {
                    const resp = await fetch(imagenBase64);
                    const blob = await resp.blob();
                    imagenBase64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                }

                // Ejecutar análisis real con Gemini
                const adn = await AIService.analizarImagen(imagenBase64);

                const endTime = Date.now();
                const duration = endTime - startTime;
                const minDuration = 3000; // 3 segundos de show para asimilación

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
            // Generar escaparate basado en el ADN analizado
            const escaparate = await AIService.generarEscaparate(resultadoAdn);

            // Deducir estrategia de conversión
            const cat = (resultadoAdn.analisisVision?.categoriaSugerida || "").toLowerCase();
            let estrategia: AdnMarca['estrategiaPrincipal'] = 'LEAD_MAGNET';
            if (cat.includes('restaurante') || cat.includes('gastro') || cat.includes('café') || cat.includes('bar')) {
                estrategia = 'OFERTA_FLASH';
            } else if (cat.includes('peluquer') || cat.includes('salud') || cat.includes('clínica')) {
                estrategia = 'CITA_PREVIA';
            }

            // Enriquecer ADN con estrategia y keywords
            const adnEnriquecido: AdnMarca = {
                ...resultadoAdn,
                estrategiaPrincipal: estrategia,
                keywords: resultadoAdn.analisisVision?.objetosDetectados || [resultadoAdn.ambiente || "negocio"],
            };

            // Completar en Store Global (esto genera slug y avanza a ESCAPARATE)
            completarAnalisis(adnEnriquecido, escaparate);
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
                    type="button"
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
            <InformeIdentidad
                adn={resultadoAdn}
                onConfirmar={manejarContinuar}
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
