/**
 * Escaparate Store - Máquina de Estados Finita (FSM)
 * Motor de Escaparates Digitales Generativos
 * 
 * Estados: UPLOAD → ANALYSIS → SHOWCASE → POSTER_VALIDATION → ADAPTIVE_CONFIG → DEPLOY
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BrandData, LandingPageConfig, LandingLink, UISchema, BrandIdentity2026 } from '../types';

// ─────────────────────────────────────────────────────────────
// TIPOS DE ESTADO
// ─────────────────────────────────────────────────────────────

export type EscaparateStep =
    | 'UPLOAD'
    | 'ANALYSIS'
    | 'SHOWCASE'
    | 'POSTER_VALIDATION'
    | 'ADAPTIVE_CONFIG'
    | 'DEPLOY';

export interface EscaparateData {
    brandData: BrandData;
    brandIdentity?: BrandIdentity2026;  // Nuevo: identidad 2026 extendida
    uiSchema?: UISchema;                 // Nuevo: schema generativo
    landingConfig: LandingPageConfig;
    links: LandingLink[];
    generatedAt: Date;
    version: number;
}

export interface PosterData {
    qrCodeUrl: string;
    landingUrl: string;
    mockupImage?: string;
    validated: boolean;
}

export interface ConfigFormData {
    whatsapp?: string;
    instagram?: string;
    address?: string;
    hours?: string;
    phone?: string;
    customFields: Record<string, string>;
}

export interface DeployResult {
    landingUrl: string;
    posterPdfUrl: string;
    qrCodeImage: string;
    publishedAt: Date;
    success: boolean;
}

// Estado discriminado
export type EscaparateState =
    | { step: 'UPLOAD'; mediaUrls: string[] }
    | { step: 'ANALYSIS'; mediaUrls: string[]; progress: number; currentPhase: string }
    | { step: 'SHOWCASE'; data: EscaparateData; canRegenerate: boolean; regenerateCount: number }
    | { step: 'POSTER_VALIDATION'; data: EscaparateData; poster: PosterData }
    | { step: 'ADAPTIVE_CONFIG'; data: EscaparateData; poster: PosterData; config: ConfigFormData; requiredFields: string[] }
    | { step: 'DEPLOY'; data: EscaparateData; poster: PosterData; config: ConfigFormData; result: DeployResult };

// ─────────────────────────────────────────────────────────────
// ORDEN DE ESTADOS PARA NAVEGACIÓN
// ─────────────────────────────────────────────────────────────

const STEP_ORDER: EscaparateStep[] = [
    'UPLOAD',
    'ANALYSIS',
    'SHOWCASE',
    'POSTER_VALIDATION',
    'ADAPTIVE_CONFIG',
    'DEPLOY'
];

const STEP_LABELS: Record<EscaparateStep, string> = {
    UPLOAD: 'Subir Foto',
    ANALYSIS: 'Analizando',
    SHOWCASE: 'Tu Escaparate',
    POSTER_VALIDATION: 'Cartel QR',
    ADAPTIVE_CONFIG: 'Configuración',
    DEPLOY: 'Publicar'
};

// ─────────────────────────────────────────────────────────────
// STORE INTERFACE
// ─────────────────────────────────────────────────────────────

interface EscaparateStore {
    // Estado actual FSM
    currentState: EscaparateState;
    stateHistory: EscaparateStep[];

    // Metadatos de sesión
    sessionId: string;
    lastSaved: Date | null;
    isDirty: boolean;

    // Getters
    getCurrentStep: () => EscaparateStep;
    getStepIndex: (step: EscaparateStep) => number;
    canGoForward: () => boolean;
    canGoBack: () => boolean;
    getStepLabel: (step: EscaparateStep) => string;

    // Transiciones
    setMediaUrls: (urls: string[]) => void;
    startAnalysis: () => void;
    updateAnalysisProgress: (progress: number, phase: string) => void;
    completeAnalysis: (data: EscaparateData) => void;
    regenerateShowcase: () => void;
    validatePoster: (poster: PosterData) => void;
    updateConfig: (config: Partial<ConfigFormData>) => void;
    completeDeploy: (result: DeployResult) => void;

    // Navegación retrospectiva
    goBack: () => { success: boolean; dataLost: boolean; warning?: string };
    goToStep: (step: EscaparateStep) => { success: boolean; dataLost: boolean; warning?: string };

    // Reset
    resetFlow: () => void;

    // Persistencia
    markDirty: () => void;
    markSaved: () => void;
}

// ─────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: EscaparateState = {
    step: 'UPLOAD',
    mediaUrls: []
};

// ─────────────────────────────────────────────────────────────
// STORE IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

export const useEscaparateStore = create<EscaparateStore>()(
    persist(
        (set, get) => ({
            // Estado inicial
            currentState: initialState,
            stateHistory: ['UPLOAD'],
            sessionId: generateSessionId(),
            lastSaved: null,
            isDirty: false,

            // ─── GETTERS ────────────────────────────────────────────

            getCurrentStep: () => get().currentState.step,

            getStepIndex: (step) => STEP_ORDER.indexOf(step),

            canGoForward: () => {
                const { currentState } = get();
                const currentIndex = STEP_ORDER.indexOf(currentState.step);

                // Validar que el paso actual esté completo
                switch (currentState.step) {
                    case 'UPLOAD':
                        return currentState.mediaUrls.length > 0;
                    case 'ANALYSIS':
                        return currentState.progress >= 100;
                    case 'SHOWCASE':
                        return true; // Siempre puede avanzar si ya tiene el escaparate
                    case 'POSTER_VALIDATION':
                        return currentState.poster.validated;
                    case 'ADAPTIVE_CONFIG':
                        return true; // El formulario se valida en el componente
                    case 'DEPLOY':
                        return false; // Estado final
                    default:
                        return currentIndex < STEP_ORDER.length - 1;
                }
            },

            canGoBack: () => {
                const currentIndex = STEP_ORDER.indexOf(get().currentState.step);
                return currentIndex > 0;
            },

            getStepLabel: (step) => STEP_LABELS[step],

            // ─── TRANSICIONES ───────────────────────────────────────

            setMediaUrls: (urls) => set(state => ({
                currentState: {
                    ...state.currentState,
                    step: 'UPLOAD',
                    mediaUrls: urls
                } as EscaparateState,
                isDirty: true
            })),

            startAnalysis: () => set(state => {
                if (state.currentState.step !== 'UPLOAD') return state;
                if (state.currentState.mediaUrls.length === 0) return state;

                return {
                    currentState: {
                        step: 'ANALYSIS',
                        mediaUrls: state.currentState.mediaUrls,
                        progress: 0,
                        currentPhase: 'Iniciando análisis...'
                    },
                    stateHistory: [...state.stateHistory, 'ANALYSIS'],
                    isDirty: true
                };
            }),

            updateAnalysisProgress: (progress, phase) => set(state => {
                if (state.currentState.step !== 'ANALYSIS') return state;

                return {
                    currentState: {
                        ...state.currentState,
                        progress,
                        currentPhase: phase
                    } as EscaparateState
                };
            }),

            completeAnalysis: (data) => set(state => {
                if (state.currentState.step !== 'ANALYSIS') return state;

                return {
                    currentState: {
                        step: 'SHOWCASE',
                        data,
                        canRegenerate: true,
                        regenerateCount: 0
                    },
                    stateHistory: [...state.stateHistory, 'SHOWCASE'],
                    isDirty: true
                };
            }),

            regenerateShowcase: () => set(state => {
                if (state.currentState.step !== 'SHOWCASE') return state;

                return {
                    currentState: {
                        ...state.currentState,
                        regenerateCount: state.currentState.regenerateCount + 1
                    } as EscaparateState,
                    isDirty: true
                };
            }),

            validatePoster: (poster) => set(state => {
                if (state.currentState.step !== 'SHOWCASE') return state;

                return {
                    currentState: {
                        step: 'POSTER_VALIDATION',
                        data: state.currentState.data,
                        poster: { ...poster, validated: true }
                    },
                    stateHistory: [...state.stateHistory, 'POSTER_VALIDATION'],
                    isDirty: true
                };
            }),

            updateConfig: (config) => set(state => {
                if (state.currentState.step === 'POSTER_VALIDATION') {
                    // Transicionar a ADAPTIVE_CONFIG
                    const requiredFields = determineRequiredFields(state.currentState.data);
                    return {
                        currentState: {
                            step: 'ADAPTIVE_CONFIG',
                            data: state.currentState.data,
                            poster: state.currentState.poster,
                            config: {
                                customFields: {},
                                ...config
                            },
                            requiredFields
                        },
                        stateHistory: [...state.stateHistory, 'ADAPTIVE_CONFIG'],
                        isDirty: true
                    };
                }

                if (state.currentState.step !== 'ADAPTIVE_CONFIG') return state;

                return {
                    currentState: {
                        ...state.currentState,
                        config: {
                            ...state.currentState.config,
                            ...config
                        }
                    } as EscaparateState,
                    isDirty: true
                };
            }),

            completeDeploy: (result) => set(state => {
                if (state.currentState.step !== 'ADAPTIVE_CONFIG') return state;

                return {
                    currentState: {
                        step: 'DEPLOY',
                        data: state.currentState.data,
                        poster: state.currentState.poster,
                        config: state.currentState.config,
                        result
                    },
                    stateHistory: [...state.stateHistory, 'DEPLOY'],
                    isDirty: false // Guardado al completar
                };
            }),

            // ─── NAVEGACIÓN RETROSPECTIVA ───────────────────────────

            goBack: () => {
                const state = get();
                const currentIndex = STEP_ORDER.indexOf(state.currentState.step);

                if (currentIndex <= 0) {
                    return { success: false, dataLost: false };
                }

                const previousStep = STEP_ORDER[currentIndex - 1];
                return get().goToStep(previousStep);
            },

            goToStep: (targetStep) => {
                const state = get();
                const currentIndex = STEP_ORDER.indexOf(state.currentState.step);
                const targetIndex = STEP_ORDER.indexOf(targetStep);

                // No permitir avanzar con goToStep (usar transiciones explícitas)
                if (targetIndex >= currentIndex) {
                    return { success: false, dataLost: false };
                }

                // Determinar si se perderán datos
                let dataLost = false;
                let warning: string | undefined;

                if (state.currentState.step === 'ADAPTIVE_CONFIG' && targetIndex < STEP_ORDER.indexOf('ADAPTIVE_CONFIG')) {
                    dataLost = true;
                    warning = 'Los datos de configuración se perderán si vuelves atrás.';
                }

                // Reconstruir el estado para el paso objetivo
                let newState: EscaparateState;

                switch (targetStep) {
                    case 'UPLOAD':
                        newState = { step: 'UPLOAD', mediaUrls: [] };
                        break;
                    case 'ANALYSIS':
                        // No tiene sentido volver a ANALYSIS
                        return { success: false, dataLost: false };
                    case 'SHOWCASE':
                        if (state.currentState.step === 'POSTER_VALIDATION' ||
                            state.currentState.step === 'ADAPTIVE_CONFIG' ||
                            state.currentState.step === 'DEPLOY') {
                            const currentData = 'data' in state.currentState ? state.currentState.data : undefined;
                            if (currentData) {
                                newState = {
                                    step: 'SHOWCASE',
                                    data: currentData,
                                    canRegenerate: true,
                                    regenerateCount: 0
                                };
                            } else {
                                return { success: false, dataLost: false };
                            }
                        } else {
                            return { success: false, dataLost: false };
                        }
                        break;
                    case 'POSTER_VALIDATION':
                        if (state.currentState.step === 'ADAPTIVE_CONFIG' || state.currentState.step === 'DEPLOY') {
                            const stateWithPoster = state.currentState;
                            if ('poster' in stateWithPoster && 'data' in stateWithPoster) {
                                newState = {
                                    step: 'POSTER_VALIDATION',
                                    data: stateWithPoster.data,
                                    poster: stateWithPoster.poster
                                };
                            } else {
                                return { success: false, dataLost: false };
                            }
                        } else {
                            return { success: false, dataLost: false };
                        }
                        break;
                    default:
                        return { success: false, dataLost: false };
                }

                set({
                    currentState: newState,
                    stateHistory: [...state.stateHistory, targetStep],
                    isDirty: true
                });

                return { success: true, dataLost, warning };
            },

            // ─── RESET ──────────────────────────────────────────────

            resetFlow: () => set({
                currentState: initialState,
                stateHistory: ['UPLOAD'],
                sessionId: generateSessionId(),
                lastSaved: null,
                isDirty: false
            }),

            // ─── PERSISTENCIA ───────────────────────────────────────

            markDirty: () => set({ isDirty: true }),

            markSaved: () => set({
                isDirty: false,
                lastSaved: new Date()
            })
        }),
        {
            name: 'escaparate-session-v2', // Changed name to force fresh state for new persistence strategy
            storage: createJSONStorage(() => localStorage), // Persistencia fuerte para cierre de navegador
            partialize: (state) => ({
                currentState: state.currentState,
                stateHistory: state.stateHistory,
                sessionId: state.sessionId,
                lastSaved: state.lastSaved
            })
        }
    )
);

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

function determineRequiredFields(data: EscaparateData): string[] {
    const required: string[] = [];

    // Determinar campos necesarios basados en los links generados
    const linkTypes = data.links.map(l => l.type);

    if (linkTypes.includes('contact')) {
        if (!data.brandData.whatsapp) required.push('whatsapp');
        if (!data.brandData.instagram) required.push('instagram');
    }

    if (!data.brandData.address) {
        required.push('address');
    }

    if (!data.brandData.hours) {
        required.push('hours');
    }

    return required;
}

// Export step order for use in components
export { STEP_ORDER, STEP_LABELS };
