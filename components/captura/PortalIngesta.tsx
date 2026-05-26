'use client';

/**
 * FOTO FACHADA V2 — Portal de Ingesta Aero-Glass 2026
 * Motor: Antigravity v.2026 (Gemini 3 Pro)
 * 
 * Componente de alta fidelidad con físicas de Framer Motion.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { accionesTienda } from '@/store/useTiendaEstado';
// heic2any se importa dinámicamente solo cuando se necesita (accede a window al importarse)

// Configuración de físicas
const FISICAS_SPRING = { stiffness: 300, damping: 20 };
const LIMITE_PESO_MB = 15;
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export default function PortalIngesta() {
    const [estado, setEstado] = useState<'reposo' | 'drag' | 'procesando' | 'exito' | 'error'>('reposo');
    const [errorMsg, setErrorMsg] = useState('');
    const [progreso, setProgreso] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Referencias para el seguimiento del cursor
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Muelles para suavizar el movimiento del gradiente
    const springX = useSpring(mouseX, FISICAS_SPRING);
    const springY = useSpring(mouseY, FISICAS_SPRING);

    // Seguimiento del cursor en DragOver
    const manejarMouseMove = useCallback((e: React.DragEvent | React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    }, [mouseX, mouseY]);

    // Lógica de procesamiento de archivo
    const procesarArchivo = async (archivo: File) => {
        setEstado('procesando');
        setProgreso(10);

        try {
            let archivoFinal = archivo;

            // Validación de peso
            if (archivo.size > LIMITE_PESO_MB * 1024 * 1024) {
                throw new Error(`El archivo excede los ${LIMITE_PESO_MB}MB.`);
            }

            // Validación de tipo
            const esHeic = archivo.type === 'image/heic' || archivo.name.toLowerCase().endsWith('.heic');
            if (!TIPOS_ACEPTADOS.includes(archivo.type) && !esHeic) {
                throw new Error('Formato no soportado. Usa JPG, PNG, WEBP o HEIC.');
            }

            setProgreso(30);

            // Conversión HEIC si es necesario
            if (esHeic) {
                try {
                    const heic2any = (await import('heic2any')).default;
                    const blob = await heic2any({
                        blob: archivo,
                        toType: 'image/jpeg',
                        quality: 0.8
                    });
                    archivoFinal = new File([Array.isArray(blob) ? blob[0] : blob], archivo.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
                } catch (convErr) {
                    console.error('Error convirtiendo HEIC:', convErr);
                    throw new Error('Error al convertir archivo HEIC.');
                }
            }

            setProgreso(60);

            // Generación de Preview
            const url = URL.createObjectURL(archivoFinal);
            setPreviewUrl(url);

            setProgreso(90);

            // Simulación de "asimilación" del archivo (Efecto elástico)
            setTimeout(() => {
                accionesTienda.setFotoFachada(archivoFinal, url);
                setProgreso(100);
                setEstado('exito');
            }, 800);

        } catch (err: any) {
            setErrorMsg(err.message || 'Error al procesar la imagen');
            setEstado('error');
            setTimeout(() => setEstado('reposo'), 3000);
        }
    };

    const manejarDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setEstado('reposo');
        const archivo = e.dataTransfer.files[0];

        // Efecto "Succión": Contracción momentánea
        setSuccion(true);
        setTimeout(() => setSuccion(false), 300);

        if (archivo) await procesarArchivo(archivo);
    };

    const [succion, setSuccion] = useState(false);

    return (
        <div className="relative w-full max-w-4xl mx-auto p-4">
            {/* Contenedor Principal Aero-Glass */}
            <motion.div
                onDragOver={(e) => {
                    e.preventDefault();
                    setEstado('drag');
                    manejarMouseMove(e);
                }}
                onDragLeave={() => setEstado('reposo')}
                onDrop={manejarDrop}
                whileHover={{ scale: 1.01 }}
                animate={{
                    scale: succion ? 0.98 : (estado === 'drag' ? 1.05 : 1),
                    backgroundColor: estado === 'drag' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.03)'
                }}
                transition={FISICAS_SPRING}
                className={`
                    relative min-h-[400px] rounded-[3rem] overflow-hidden
                    backdrop-blur-[48px] saturate-[150%]
                    border border-white/10
                    flex flex-col items-center justify-center
                    shadow-[0_10px_20px_rgba(0,0,0,0.2),0_20px_40px_rgba(0,0,0,0.1),0_40px_80px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]
                    cursor-pointer group
                `}
            >
                {/* Border Beam (Efecto de luz recorriendo el borde) */}
                <div className="absolute inset-0 pointer-events-none rounded-[3rem] overflow-hidden">
                    <motion.div
                        className="absolute inset-[-100%] opacity-40"
                        style={{
                            background: "conic-gradient(from 0deg, transparent, #3b82f6, #8b5cf6, transparent 25%)",
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute inset-[2px] bg-black/40 rounded-[2.9rem] backdrop-blur-[48px]" />
                </div>

                {/* Gradiente Radial Perseguidor */}
                <motion.div
                    className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{
                        background: useTransform(
                            [springX, springY],
                            ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(59,130,246,0.3), transparent 70%)`
                        )
                    }}
                />

                {/* Contenido Dinámico */}
                <AnimatePresence mode="wait">
                    {estado === 'procesando' ? (
                        <motion.div
                            key="procesando"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6 relative z-10"
                        >
                            <ProgresoCircular progreso={progreso} />
                            <p className="text-white/80 font-medium tracking-wide">ASIMILANDO FACHADA...</p>
                        </motion.div>
                    ) : estado === 'exito' ? (
                        <motion.div
                            key="exito"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center relative z-10"
                        >
                            <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">PORTAL SINCRONIZADO</h3>
                            <p className="text-white/60">Análisis listo para comenzar</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reposo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center p-8 z-10"
                        >
                            <motion.div
                                className="mb-6 relative"
                                animate={estado === 'drag' ? { y: [0, -10, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                    <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mb-3 tracking-tighter uppercase">
                                {estado === 'drag' ? 'SUELTA EL ARCHIVO' : 'PORTAL DE INGESTA'}
                            </h2>
                            <p className="text-white/50 max-w-sm mx-auto leading-relaxed">
                                Arrastra la fotografía de tu negocio. Soportamos JPG, PNG, WEBP y HEIC hasta 15MB.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feedback de Error */}
                <AnimatePresence>
                    {estado === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-8 left-0 right-0 text-center z-20"
                        >
                            <span className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30 text-sm font-medium">
                                {errorMsg}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Preview Cinematográfico (Si existe) */}
            <AnimatePresence>
                {previewUrl && estado === 'exito' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        className="mt-8 rounded-[2rem] overflow-hidden aspect-[16/9] border border-white/10 shadow-2xl relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute bottom-6 left-6 text-white font-medium tracking-widest text-xs uppercase opacity-80">
                            VISTA PREVIA DE CAPTURA • 2026
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Componente de Progreso Circular con Curva Bézier
function ProgresoCircular({ progreso }: { progreso: number }) {
    const radio = 45;
    const circunferencia = 2 * Math.PI * radio;
    const offset = circunferencia - (progreso / 100) * circunferencia;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r={radio}
                    className="stroke-white/5 fill-none"
                    strokeWidth="4"
                />
                <motion.circle
                    cx="64"
                    cy="64"
                    r={radio}
                    className="stroke-blue-500 fill-none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: circunferencia, strokeDashoffset: circunferencia }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ ease: [0.65, 0, 0.35, 1], duration: 0.5 }}
                />
            </svg>
            <span className="absolute text-2xl font-bold font-mono text-white">
                {Math.round(progreso)}%
            </span>
        </div>
    );
}
