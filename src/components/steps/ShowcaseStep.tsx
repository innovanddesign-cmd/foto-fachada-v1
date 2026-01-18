/**
 * ShowcaseStep - Estado SHOWCASE
 * El "Momento Wow" - Renderizado del Escaparate Digital generado
 * Incluye lógica de "Regenerar" para variaciones creativas
 */

import { useCallback, useState } from 'react';
import { RefreshCw, Check, QrCode, Sparkles, Eye } from 'lucide-react';
import { useEscaparateStore, type PosterData } from '../../store/escaparateStore';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { SmartphoneFrame } from '../showcase/SmartphoneFrame';
import { ShowcaseEngine } from '../showcase/ShowcaseEngine';
import './ShowcaseStep.css';

export function ShowcaseStep() {
    const { currentState, regenerateShowcase, validatePoster } = useEscaparateStore();
    const { brandData, links, setLandingConfig, setLinks } = useAppStore();

    const [isRegenerating, setIsRegenerating] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);

    // Obtener datos del estado actual
    const showcaseData = currentState.step === 'SHOWCASE' ? currentState.data : null;
    const regenerateCount = currentState.step === 'SHOWCASE' ? currentState.regenerateCount : 0;
    const canRegenerate = currentState.step === 'SHOWCASE' ? currentState.canRegenerate : false;

    // ─── REGENERAR DISEÑO ───────────────────────────────────────

    const handleRegenerate = useCallback(async () => {
        if (!canRegenerate || isRegenerating) return;

        setIsRegenerating(true);
        regenerateShowcase(); // Incrementa contador

        try {
            const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

            if (hasApiKey) {
                // Regenerar con IA - Reactivando AnalysisStep para variante
                // En un flujo real, llamaríamos a un endpoint de 'regenerateSchema'
                // Para MVP, simulamos delay y re-lanzamos el analysis interno

                // NOTA: La lógica ideal sería tener un 'regenerateSchema' en uiSchemaGenerator
                // que acepte una 'variabilitySeed' nueva.
                // Por ahora, el usuario verá la animación de carga.
            }

            // Simular tiempo de generación (placeholder, la lógica real iría aquí)
            await new Promise(r => setTimeout(r, 1500));

            // TODO: Implementar regeneración real conectando con service/uiSchemaGenerator
            // const newSchema = await generateUISchema(brandIdentity, brandData);
            // updateShowcase(newSchema);

            // Simular tiempo de generación
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error('[ShowcaseStep] Error regenerando:', error);
        }

        setIsRegenerating(false);
    }, [canRegenerate, isRegenerating, regenerateCount, brandData, links, regenerateShowcase, setLandingConfig, setLinks]);

    // ─── ACEPTAR Y CONTINUAR ────────────────────────────────────

    const handleAcceptDesign = useCallback(async () => {
        if (!showcaseData) return;

        // Generar datos del poster
        const landingUrl = `${window.location.origin}/p/demo-${Date.now()}`;

        // Generar QR code (placeholder por ahora)
        const posterData: PosterData = {
            qrCodeUrl: landingUrl, // Se generará el QR en el siguiente paso
            landingUrl,
            validated: true
        };

        validatePoster(posterData);
    }, [showcaseData, validatePoster]);

    // ─── RENDER ─────────────────────────────────────────────────

    if (!showcaseData && !brandData) {
        return (
            <div className="showcase-step showcase-step--loading">
                <p>Cargando escaparate...</p>
            </div>
        );
    }

    return (
        <div className="showcase-step">
            {/* Header con título */}
            <div className="showcase-step__header">
                <div className="showcase-step__badge">
                    <Sparkles size={16} />
                    <span>Escaparate Digital Generado</span>
                </div>
                <h1 className="showcase-step__title">
                    ¡Tu Escaparate Está Listo! ✨
                </h1>
                <p className="showcase-step__description">
                    Esta es la landing page personalizada para <strong>{brandData?.name || showcaseData?.brandData?.name}</strong>.
                    Puedes regenerar para ver más opciones creativas.
                </p>
            </div>

            {/* Preview del escaparate */}
            <div className="showcase-step__preview-wrapper">
                <div className="showcase-step__preview-container">
                    {showcaseData?.uiSchema && showcaseData?.brandIdentity ? (
                        <SmartphoneFrame>
                            <ShowcaseEngine
                                schema={showcaseData.uiSchema}
                                brandIdentity={showcaseData.brandIdentity}
                            />
                        </SmartphoneFrame>
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-white/50">
                            Cargando diseño...
                        </div>
                    )}
                </div>

                {/* Botón de pantalla completa */}
                <button
                    className="showcase-step__fullscreen-btn"
                    onClick={() => setShowFullPreview(true)}
                >
                    <Eye size={18} />
                    Ver a pantalla completa
                </button>
            </div>

            {/* Acciones */}
            <div className="showcase-step__actions">
                <Button
                    variant="secondary"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    leftIcon={<RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />}
                >
                    {isRegenerating ? 'Regenerando...' : 'Regenerar Diseño'}
                    {regenerateCount > 0 && (
                        <span className="showcase-step__regen-count">
                            ({regenerateCount})
                        </span>
                    )}
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAcceptDesign}
                    leftIcon={<Check size={18} />}
                    rightIcon={<QrCode size={18} />}
                    className="showcase-step__accept-btn"
                >
                    Me Gusta - Generar Cartel QR
                </Button>
            </div>

            {/* Indicador de regeneraciones */}
            {regenerateCount > 0 && (
                <p className="showcase-step__regen-hint">
                    Has generado {regenerateCount + 1} variaciones. ¡Sigue explorando!
                </p>
            )}

            {/* Modal de preview completo */}
            {showFullPreview && showcaseData?.uiSchema && showcaseData?.brandIdentity && (
                <div className="showcase-step__fullscreen-modal" onClick={() => setShowFullPreview(false)}>
                    <div className="showcase-step__fullscreen-content" onClick={e => e.stopPropagation()}>
                        <button
                            className="showcase-step__fullscreen-close"
                            onClick={() => setShowFullPreview(false)}
                        >
                            ✕
                        </button>
                        <div className="w-full max-w-md mx-auto h-full overflow-y-auto bg-gray-900 rounded-[32px] p-4 relative">
                            <ShowcaseEngine
                                schema={showcaseData.uiSchema}
                                brandIdentity={showcaseData.brandIdentity}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
