"use client";

import { useTiendaEstado } from "@/store/useTiendaEstado";
import { MotorEscaparate } from "./MotorEscaparate";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

/**
 * EscaparateInmersivo.tsx
 * Wrapper del MotorEscaparate con botón flotante de WhatsApp.
 * Se usa dentro del SmartphoneMockup en la fase de Configuración.
 */
export const EscaparateInmersivo = () => {
    const adn = useTiendaEstado((s) => s.adnMarca);
    const datosEscaparate = useTiendaEstado((s) => s.datosEscaparate);
    const redes = useTiendaEstado((s) => s.redesSociales);

    // Extraer teléfono del ADN o redes para WhatsApp
    const telefono = (datosEscaparate?.datosReales?.telefono || "").replace(/\s/g, "");
    const nombreNegocio = adn?.analisisVision?.nombreSugerido || "Tu Negocio";
    const whatsappUrl = telefono
        ? `https://wa.me/${telefono}?text=${encodeURIComponent(`Hola ${nombreNegocio}, me gustaría obtener más información.`)}`
        : redes?.web || "#";

    return (
        <div className="w-full min-h-screen bg-[#050505] relative">
            <MotorEscaparate />

            {/* Botón flotante WhatsApp */}
            {telefono && (
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
        </div>
    );
};
