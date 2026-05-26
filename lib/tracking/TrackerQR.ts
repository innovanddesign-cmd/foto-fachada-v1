"use client";

import { useEffect, useRef } from 'react';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import type { RegistroEscaneo } from '@/lib/estado/tipos-estado';

/**
 * TrackerQR.ts
 * Motor de inteligencia de escaneos.
 * Maneja fingerprinting, geolocalización y registro de eventos.
 */

interface TrackerConfig {
    campañaId: string;
    onScanRegistered?: () => void;
}

export const useTrackerQR = ({ campañaId, onScanRegistered }: TrackerConfig) => {
    const registrarEscaneo = useTiendaEstado((s) => s.registrarEscaneo);
    const hasRegistered = useRef(false);

    useEffect(() => {
        if (hasRegistered.current || !campañaId) return;

        const registrarEvento = async () => {
            hasRegistered.current = true;

            // 1. Detectar Dispositivo (User Agent Parsing Simplificado)
            const ua = navigator.userAgent;
            let modelo = "Desconocido";
            let os: RegistroEscaneo['dispositivo']['os'] = "Unknown";

            if (/iPhone|iPad|iPod/.test(ua)) {
                os = "iOS";
                modelo = "iPhone/iPad";
            } else if (/Android/.test(ua)) {
                os = "Android";
                modelo = "Dispositivo Android";
            } else if (/Win/.test(ua)) os = "Desktop";
            else if (/Mac/.test(ua)) os = "Desktop";

            // 2. Simular Geolocalización (En prod usaría IP Geolocation API)
            // Aquí simulamos coordenadas en ciudades principales de España aleatoriamente
            const ciudades = [
                { ciudad: "Madrid", pais: "España", lat: 40.4168, lng: -3.7038 },
                { ciudad: "Barcelona", pais: "España", lat: 41.3851, lng: 2.1734 },
                { ciudad: "Valencia", pais: "España", lat: 39.4699, lng: -0.3763 },
                { ciudad: "Sevilla", pais: "España", lat: 37.3891, lng: -5.9845 }
            ];
            const ubicacion = ciudades[Math.floor(Math.random() * ciudades.length)];

            // 3. Registrar en Store
            registrarEscaneo({
                campañaId,
                dispositivo: { modelo, os },
                ubicacionEstimada: ubicacion
            });

            console.log(`[TrackerQR] Escaneo registrado: ${modelo} desde ${ubicacion.ciudad}`);

            if (onScanRegistered) onScanRegistered();
        };

        registrarEvento();
    }, [campañaId, registrarEscaneo, onScanRegistered]);
};

// ═══════════════════════════════════════════════════════════════
// UTILIDADES DE ANALYTICS
// ═══════════════════════════════════════════════════════════════

export function analizarMejorHora(escaneos: RegistroEscaneo[]): string {
    if (escaneos.length === 0) return "Pendiente de datos";

    const horas = escaneos.map(e => new Date(e.timestamp).getHours());

    // Crear histograma
    const conteo = new Array(24).fill(0);
    horas.forEach(h => conteo[h]++);

    // Encontrar pico
    const maxEscaneos = Math.max(...conteo);
    const horaPico = conteo.indexOf(maxEscaneos);

    // Formatear rango
    const siguiente = (horaPico + 1) % 24;
    return `${horaPico}:00 - ${siguiente}:00`;
}
