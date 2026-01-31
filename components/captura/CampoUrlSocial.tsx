'use client';

/**
 * FOTO FACHADA V2 — Campo URL de Red Social
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Input con validación en tiempo real y feedback visual animado.
 * Diseño Aero-Glassmorphism.
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2 } from 'lucide-react';
import {
    validarUrlRedSocial,
    type PlataformaSocial,
    ICONOS_PLATAFORMAS,
    NOMBRES_PLATAFORMAS,
} from '@/lib/validadores/validadoresUrl';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface CampoUrlSocialProps {
    /** Plataforma de red social */
    plataforma: PlataformaSocial;
    /** Valor actual del campo */
    valor: string;
    /** Callback cuando cambia el valor */
    alCambiar: (valor: string, esValido: boolean) => void;
    /** Deshabilitado */
    deshabilitado?: boolean;
}

type EstadoValidacion = 'vacio' | 'validando' | 'valido' | 'invalido';

// ═══════════════════════════════════════════════════════════════
// ANIMACIONES
// ═══════════════════════════════════════════════════════════════

const animacionSacudida = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
};

const animacionAparecer = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { type: 'spring', stiffness: 200, damping: 15 },
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export default function CampoUrlSocial({
    plataforma,
    valor,
    alCambiar,
    deshabilitado = false,
}: CampoUrlSocialProps) {
    const [estadoValidacion, setEstadoValidacion] = useState<EstadoValidacion>('vacio');
    const [mensajeError, setMensajeError] = useState('');
    const [enfocado, setEnfocado] = useState(false);

    // Validar con debounce
    useEffect(() => {
        if (!valor || valor.trim() === '') {
            setEstadoValidacion('vacio');
            setMensajeError('');
            return;
        }

        setEstadoValidacion('validando');

        const temporizador = setTimeout(() => {
            const resultado = validarUrlRedSocial(valor, plataforma);
            setEstadoValidacion(resultado.esValida ? 'valido' : 'invalido');
            setMensajeError(resultado.esValida ? '' : resultado.mensaje);
            alCambiar(valor, resultado.esValida);
        }, 300);

        return () => clearTimeout(temporizador);
    }, [valor, plataforma, alCambiar]);

    const manejarCambio = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        alCambiar(e.target.value, false);
    }, [alCambiar]);

    const icono = ICONOS_PLATAFORMAS[plataforma];
    const nombrePlataforma = NOMBRES_PLATAFORMAS[plataforma];

    // Colores según estado
    const estilosBorde = {
        vacio: 'border-white/15',
        validando: 'border-white/30',
        valido: 'border-green-500/50',
        invalido: 'border-red-500/50',
    };

    return (
        <div className="w-full">
            <label className="block mb-2 text-sm text-white/70">
                <span className="mr-2">{icono}</span>
                {nombrePlataforma}
            </label>

            <motion.div
                className="relative"
                animate={estadoValidacion === 'invalido' && !enfocado ? animacionSacudida : {}}
            >
                <input
                    type="url"
                    value={valor}
                    onChange={manejarCambio}
                    onFocus={() => setEnfocado(true)}
                    onBlur={() => setEnfocado(false)}
                    disabled={deshabilitado}
                    placeholder={`URL de ${nombrePlataforma}`}
                    className={`
            w-full px-4 py-3 pr-12
            bg-white/5 backdrop-blur-md
            border ${estilosBorde[estadoValidacion]}
            rounded-2xl
            text-white placeholder-white/30
            outline-none
            transition-all duration-200
            focus:bg-white/10 focus:border-white/30
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                    style={{
                        boxShadow: enfocado
                            ? '0 0 20px rgba(255, 255, 255, 0.1)'
                            : 'none',
                    }}
                />

                {/* Indicador de estado */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <AnimatePresence mode="wait">
                        {estadoValidacion === 'validando' && (
                            <motion.div key="loading" {...animacionAparecer}>
                                <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                            </motion.div>
                        )}
                        {estadoValidacion === 'valido' && (
                            <motion.div key="valid" {...animacionAparecer}>
                                <Check className="w-5 h-5 text-green-400" />
                            </motion.div>
                        )}
                        {estadoValidacion === 'invalido' && (
                            <motion.div key="invalid" {...animacionAparecer}>
                                <X className="w-5 h-5 text-red-400" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Mensaje de error */}
            <AnimatePresence>
                {estadoValidacion === 'invalido' && mensajeError && (
                    <motion.p
                        initial={{ opacity: 0, y: -5, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -5, height: 0 }}
                        className="mt-2 text-sm text-red-400"
                    >
                        {mensajeError}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
