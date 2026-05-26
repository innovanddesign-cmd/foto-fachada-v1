'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTiendaEstado } from '@/store/useTiendaEstado';
import { MotorEscaparate } from '@/components/generative/MotorEscaparate';
import { useGenerarTema } from '@/lib/hooks/useGenerarTema';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import type { AdnMarca, DatosEscaparate } from '@/lib/estado/tipos-estado';

/**
 * Escaparate Público (Modo Solo Lectura)
 * Ruta: /v/[slug]
 *
 * Carga datos desde el store (localStorage) basándose en el slug.
 * Si no encuentra datos locales, muestra un estado vacío.
 */
export default function PaginaEscaparate() {
    const params = useParams();
    const slug = params?.slug as string;
    const [cargando, setCargando] = useState(true);
    const [encontrado, setEncontrado] = useState(false);

    const adnMarca = useTiendaEstado((s) => s.adnMarca);
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);
    const cargarPorSlug = useTiendaEstado((s) => s.cargarPorSlug);

    // Inyectar tema CSS
    useGenerarTema();

    useEffect(() => {
        if (!slug) return;

        const cargar = async () => {
            await cargarPorSlug(slug);
            setCargando(false);
        };
        cargar();
    }, [slug, cargarPorSlug]);

    useEffect(() => {
        if (!cargando && adnMarca && datosEscaparate) {
            setEncontrado(true);
            // Asegurar modo visualización
            useTiendaEstado.setState({
                pasoActual: 'DESPLIEGUE',
                seccionResaltada: null,
                indicePreguntaActual: -1
            });
        }
    }, [cargando, adnMarca, datosEscaparate]);

    // Extraer teléfono para WhatsApp
    const telefono = (datosEscaparate?.datosReales?.telefono || "").replace(/\s/g, "");
    const nombreNegocio = adnMarca?.analisisVision?.nombreSugerido || "Negocio";
    const whatsappUrl = telefono
        ? `https://wa.me/${telefono}?text=${encodeURIComponent(`Hola ${nombreNegocio}, me gustaría más información.`)}`
        : null;

    if (cargando) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-white/40 text-sm font-mono tracking-widest uppercase">
                    Cargando escaparate...
                </motion.div>
            </div>
        );
    }

    if (!encontrado) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-3xl">🏪</span>
                </div>
                <h1 className="text-2xl font-bold text-white">Escaparate no encontrado</h1>
                <p className="text-white/40 text-sm max-w-md">
                    El negocio <span className="text-white font-semibold">"{slug}"</span> no existe o aún no ha sido publicado.
                </p>
                <a href="/" className="px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform">
                    Crear tu Escaparate
                </a>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-black">
            <MotorEscaparate />

            {/* Botón flotante WhatsApp */}
            {whatsappUrl && (
                <motion.a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                    className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                    style={{ background: "#25D366" }}
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </motion.a>
            )}

            {/* Branding */}
            <div className="fixed bottom-4 right-4 z-40">
                <div className="bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Powered by Foto Fachada AI
                </div>
            </div>
        </motion.div>
    );
}
