'use client';

/**
 * FOTO FACHADA V2 — Panel de Metadatos Opcionales
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Formulario dinámico con validación en tiempo real
 * para redes sociales, sitio web y logotipo.
 * Diseño Aero-Glassmorphism con micro-interacciones.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Globe, Save } from 'lucide-react';
import CampoUrlSocial from './CampoUrlSocial';
import SubidaLogotipo from './SubidaLogotipo';
import { validarUrlSitioWeb } from '@/lib/validadores/validadoresUrl';
import type { MetadatosNegocio, RedesSociales } from '@/lib/estado/tipos-metadatos';
import type { DatosImagen } from '@/lib/estado/tipos-estado';
import type { PlataformaSocial } from '@/lib/validadores/validadoresUrl';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PanelMetadatosProps {
    /** Metadatos actuales */
    metadatos: MetadatosNegocio;
    /** Callback al actualizar metadatos */
    alActualizar: (metadatos: MetadatosNegocio) => void;
    /** Callback al confirmar panel */
    alConfirmar: () => void;
    /** Número de errores de validación */
    erroresValidacion?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const REDES_SOCIALES: PlataformaSocial[] = [
    'instagram',
    'tiktok',
    'twitter',
    'linkedin',
];

// ═══════════════════════════════════════════════════════════════
// ANIMACIONES
// ═══════════════════════════════════════════════════════════════

const transicionContenedor = {
    hidden: { opacity: 0, height: 0 },
    visible: {
        opacity: 1,
        height: 'auto',
        transition: {
            height: { type: 'spring', stiffness: 200, damping: 25 },
            opacity: { duration: 0.2 },
        },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: {
            height: { type: 'spring', stiffness: 200, damping: 25 },
            opacity: { duration: 0.1 },
        },
    },
};

const transicionItem = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.05,
            type: 'spring',
            stiffness: 200,
            damping: 20,
        },
    }),
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function PanelMetadatos({
    metadatos,
    alActualizar,
    alConfirmar,
}: PanelMetadatosProps) {
    const [expandido, setExpandido] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState<'redes' | 'sitio' | 'logotipo' | null>(null);
    const [sitioWebValido, setSitioWebValido] = useState(true);

    // Actualizar red social
    const actualizarRedSocial = useCallback(
        (plataforma: PlataformaSocial, valor: string, esValido: boolean) => {
            const nuevasRedes: RedesSociales = {
                ...metadatos.redesSociales,
                [plataforma]: valor,
            };
            alActualizar({
                ...metadatos,
                redesSociales: nuevasRedes,
            });
        },
        [metadatos, alActualizar]
    );

    // Actualizar sitio web
    const actualizarSitioWeb = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const valor = e.target.value;
            const resultado = validarUrlSitioWeb(valor);
            setSitioWebValido(resultado.esValida);
            alActualizar({
                ...metadatos,
                sitioWeb: valor,
            });
        },
        [metadatos, alActualizar]
    );

    // Actualizar logotipo
    const actualizarLogotipo = useCallback(
        (logotipo: DatosImagen) => {
            alActualizar({
                ...metadatos,
                logotipo,
            });
        },
        [metadatos, alActualizar]
    );

    // Eliminar logotipo
    const eliminarLogotipo = useCallback(() => {
        alActualizar({
            ...metadatos,
            logotipo: undefined,
        });
    }, [metadatos, alActualizar]);

    // Contar campos completados
    const camposCompletados = Object.values(metadatos.redesSociales).filter(Boolean).length +
        (metadatos.sitioWeb ? 1 : 0) +
        (metadatos.logotipo ? 1 : 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full"
        >
            {/* Cabecera colapsable */}
            <motion.button
                onClick={() => setExpandido(!expandido)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`
          w-full p-5
          flex items-center justify-between
          bg-white/5 backdrop-blur-xl
          border border-white/10
          ${expandido ? 'rounded-t-3xl border-b-0' : 'rounded-3xl'}
          transition-all duration-200
        `}
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">📋</span>
                    <div className="text-left">
                        <h3 className="text-white font-medium">Metadatos Opcionales</h3>
                        <p className="text-sm text-white/50">
                            {camposCompletados > 0
                                ? `${camposCompletados} campo${camposCompletados > 1 ? 's' : ''} completado${camposCompletados > 1 ? 's' : ''}`
                                : 'Añade información de tu negocio'}
                        </p>
                    </div>
                </div>

                <motion.div
                    animate={{ rotate: expandido ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                    {expandido ? (
                        <ChevronUp className="w-5 h-5 text-white/50" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-white/50" />
                    )}
                </motion.div>
            </motion.button>

            {/* Contenido expandible */}
            <AnimatePresence>
                {expandido && (
                    <motion.div
                        key="panel-contenido"
                        variants={transicionContenedor}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                    >
                        <div
                            className={`
                p-6 space-y-6
                bg-white/5 backdrop-blur-xl
                border border-white/10 border-t-0
                rounded-b-3xl
              `}
                        >
                            {/* Sección: Redes Sociales */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setSeccionActiva(seccionActiva === 'redes' ? null : 'redes')}
                                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                                >
                                    <span className="text-lg">🌐</span>
                                    <span className="font-medium">Redes Sociales</span>
                                    <motion.div
                                        animate={{ rotate: seccionActiva === 'redes' ? 180 : 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </motion.div>
                                </button>

                                <AnimatePresence>
                                    {seccionActiva === 'redes' && (
                                        <motion.div
                                            variants={transicionContenedor}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            className="space-y-4 pl-8"
                                        >
                                            {REDES_SOCIALES.map((plataforma, i) => (
                                                <motion.div
                                                    key={plataforma}
                                                    custom={i}
                                                    variants={transicionItem}
                                                    initial="hidden"
                                                    animate="visible"
                                                >
                                                    <CampoUrlSocial
                                                        tipo={plataforma as 'instagram' | 'tiktok' | 'web'}
                                                        valor={metadatos.redesSociales[plataforma] || ''}
                                                        alCambiar={(valor) =>
                                                            actualizarRedSocial(plataforma, valor, true)
                                                        }
                                                        placeholder={`URL de ${plataforma}`}
                                                    />
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Separador */}
                            <div className="h-px bg-white/10" />

                            {/* Sección: Sitio Web */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-white/80">
                                    <Globe className="w-4 h-4" />
                                    <span className="font-medium">Sitio Web Existente</span>
                                </label>
                                <input
                                    type="url"
                                    value={metadatos.sitioWeb || ''}
                                    onChange={actualizarSitioWeb}
                                    placeholder="www.ejemplo.com"
                                    className={`
                    w-full px-4 py-3
                    bg-white/5 backdrop-blur-md
                    border ${sitioWebValido ? 'border-white/15' : 'border-red-500/50'}
                    rounded-2xl
                    text-white placeholder-white/30
                    outline-none
                    transition-all duration-200
                    focus:bg-white/10 focus:border-white/30
                  `}
                                />
                                {!sitioWebValido && metadatos.sitioWeb && (
                                    <p className="text-sm text-red-400 mt-1">
                                        Ingresa una URL válida
                                    </p>
                                )}
                            </div>

                            {/* Separador */}
                            <div className="h-px bg-white/10" />

                            {/* Sección: Logotipo */}
                            <SubidaLogotipo
                                logotipo={metadatos.logotipo}
                                alSubir={actualizarLogotipo}
                                alEliminar={eliminarLogotipo}
                            />

                            {/* Botón de confirmar */}
                            <motion.button
                                onClick={alConfirmar}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                  w-full py-4
                  flex items-center justify-center gap-2
                  bg-gradient-to-r from-green-500 to-emerald-600
                  rounded-2xl
                  text-white font-medium
                  shadow-lg shadow-green-500/25
                  transition-all duration-200
                  hover:shadow-xl hover:shadow-green-500/30
                `}
                            >
                                <Save className="w-5 h-5" />
                                Guardar y Continuar
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
