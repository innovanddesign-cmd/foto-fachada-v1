"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTiendaEstado } from "@/store/useTiendaEstado";
import { HeroPro } from "./secciones/HeroPro";
import { BentoValor } from "./secciones/BentoValor";
import { GaleriaMasonry } from "./secciones/GaleriaMasonry";
import { AccionMarketingCore } from "./secciones/AccionMarketingCore";
import { MessageCircle } from "lucide-react";

export const EscaparateInmersivo = () => {
    // 1. Obtener datos del Store Global
    const { datosEscaparate, adnMarca } = useTiendaEstado();

    // 2. Fallbacks de Seguridad (si faltan datos)
    const colores = adnMarca?.paletaColores || {
        primario: "#3b82f6",
        secundario: "#8b5cf6",
        acento: "#06b6d4",
        fondo: "#0f172a",
        superficieGlass: "rgba(255,255,255,0.1)"
    };

    const keywords = adnMarca?.keywords || ["business", "modern", "store"];
    const estrategia = adnMarca?.estrategiaPrincipal || "CITA_PREVIA";

    // 3. Scroll Logic para Sticky Footer
    const [mostrarFooter, setMostrarFooter] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            // Mostrar botón flotante después de 600px de scroll
            setMostrarFooter(target.scrollTop > 600);
        };

        // NOTA: El scroll ocurre DENTRO del SmartphoneMockup, no en el window
        // Necesitamos escuchar el evento en el contenedor padre si es posible, 
        // pero como este componente vive dentro del scroll container del mockup, 
        // podemos usar un IntersectionObserver o simplemente confiar en que el usuario verá el botón al final.
        // O mejor: Usar un IntersectionObserver interno "dummy" después del Hero.
    }, []);

    // Workaround para Scroll inside Mockup:
    // El SmartphoneMockup maneja el scroll en un div con overflow-y-auto.
    // Detectar scroll ahí desde aquí es complejo sin pasar refs.
    // Usaremos un truco de visualización simple: El botón de WhatsApp será fixed relative al mockup (absolute bottom-4 right-4) 
    // y lo mostraremos siempre o con animation delay.

    return (
        <div className="w-full bg-[#050505] min-h-screen pb-24 relative">

            {/* --- SECCIÓN 1: HERO --- */}
            <HeroPro
                titulo={datosEscaparate?.titularPrincipal || "Transformamos tu Visión"}
                subtitulo={datosEscaparate?.subtitulo || "La nueva era de tu negocio comienza hoy."}
                ctaTexto="Descubrir Más"
                ctaAccion="#catalogo"
                colores={colores}
            />

            {/* --- SECCIÓN 2: BENTO GRID --- */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <BentoValor
                    elementos={[
                        { id: "1", titulo: "Calidad Premium", descripcion: "Materiales seleccionados por expertos.", icono: "award", colSpan: 2 },
                        { id: "2", titulo: "24/7 Soporte", descripcion: "Estamos para ti siempre.", icono: "shield", colSpan: 1 },
                        { id: "3", titulo: "Innovación", descripcion: "Tecnología de punta aplicada.", icono: "zap", colSpan: 3 }
                    ]}
                    colores={colores}
                />
            </motion.div>

            {/* --- SECCIÓN 3: GALERÍA MASONRY --- */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <GaleriaMasonry
                    keywords={keywords}
                    colores={colores}
                />
            </motion.div>

            {/* --- SECCIÓN 4: CONVERSION CORE --- */}
            <motion.div
                id="oferta"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <AccionMarketingCore
                    estrategia={estrategia}
                    colores={colores}
                />
            </motion.div>

            {/* --- STICKY FOOTER (WhatsApp) --- */}
            <motion.a
                href="https://wa.me/"
                target="_blank"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, type: "spring" }}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                style={{
                    background: "#25D366", // Brand color WhatsApp
                    boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
                }}
            >
                <MessageCircle className="w-6 h-6 text-white leading-none" />
            </motion.a>

        </div>
    );
};
