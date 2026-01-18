/**
 * PosterValidationStep - Estado POSTER_VALIDATION
 * Transición phygital: Generación del cartel QR y visualización en mockup
 */

import { useCallback, useState } from 'react';
import { Download, Check, ArrowLeft, Printer } from 'lucide-react';
import { useEscaparateStore } from '../../store/escaparateStore';
import { useAppStore } from '../../store/appStore';
import { Button } from '../ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import './PosterValidationStep.css';

export function PosterValidationStep() {
    const { currentState, updateConfig, goToStep } = useEscaparateStore();
    const { brandData } = useAppStore();
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Obtener datos del estado actual
    const posterData = currentState.step === 'POSTER_VALIDATION' ? currentState.poster : null;
    const escaparateData = currentState.step === 'POSTER_VALIDATION' ? currentState.data : null;

    const businessName = brandData?.name || escaparateData?.brandData?.name || 'Tu Negocio';
    const landingUrl = posterData?.landingUrl || '';

    // ─── ACCIONES ───────────────────────────────────────────────

    const handleContinue = useCallback(() => {
        // Transicionar a configuración adaptativa
        updateConfig({});
    }, [updateConfig]);

    const handleGoBack = useCallback(() => {
        const result = goToStep('SHOWCASE');
        if (!result.success) {
            console.warn('[PosterValidation] No se pudo volver al Showcase');
        }
    }, [goToStep]);

    const handleDownloadPdf = useCallback(async () => {
        setIsGeneratingPdf(true);

        try {
            // Importar servicio de pósters premium
            const { generatePremiumPoster, getHookSuggestions } = await import('../../services/posterBuilderService');

            // Obtener datos del store
            const currentBrandData = escaparateData?.brandData || brandData;
            const brandIdentity = escaparateData?.brandIdentity;

            if (!currentBrandData) {
                throw new Error('No hay datos de marca disponibles');
            }

            // Obtener hook sugerido para el tipo de negocio
            const hookSuggestions = getHookSuggestions(currentBrandData.businessType || '');
            const selectedHook = hookSuggestions[0] || { emoji: '✨', text: 'Descúbrenos' };

            // Generar póster premium con herencia de marca 2026
            const result = await generatePremiumPoster({
                brandData: currentBrandData,
                brandIdentity,  // Pasamos la identidad 2026 para texturas por vibe
                landingUrl: landingUrl || 'https://foto-fachada.vercel.app',
                hookText: selectedHook.text,
                hookEmoji: selectedHook.emoji,
                ctaSecondary: 'Síguenos en redes',
                whatsapp: currentBrandData.whatsapp,
                instagram: currentBrandData.instagram,
                facebook: currentBrandData.facebook
            });

            // Descargar el PDF generado
            const link = document.createElement('a');
            link.href = result.dataUrl;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('[PosterValidation] ✅ PDF generado con vibe:', brandIdentity?.vibe || 'default');

        } catch (error) {
            console.error('[PosterValidation] Error generando PDF:', error);
        }

        setIsGeneratingPdf(false);
    }, [escaparateData, brandData, landingUrl]);

    // ─── RENDER ─────────────────────────────────────────────────

    return (
        <div className="poster-step">
            <div className="poster-step__header">
                <h1 className="poster-step__title">
                    🖼️ Tu Cartel con QR
                </h1>
                <p className="poster-step__description">
                    Imprime este cartel y colócalo en tu fachada. Tus clientes escanearán el código
                    para acceder a tu escaparate digital.
                </p>
            </div>

            {/* Preview del cartel */}
            <div className="poster-step__preview">
                <div className="poster-step__poster">
                    <div className="poster-step__poster-content">
                        <h2 className="poster-step__poster-title">{businessName}</h2>
                        <p className="poster-step__poster-subtitle">ESCANEA Y DESCUBRE</p>

                        <div className="poster-step__qr-container">
                            <QRCodeSVG
                                value={landingUrl || 'https://foto-fachada.vercel.app'}
                                size={160}
                                level="H"
                                includeMargin
                                className="poster-step__qr"
                            />
                        </div>

                        <p className="poster-step__poster-url">
                            {landingUrl.replace(/^https?:\/\//, '') || 'tu-landing.vercel.app'}
                        </p>
                    </div>

                    <div className="poster-step__poster-footer">
                        Generado con Foto Fachada
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="poster-step__actions">
                <Button
                    variant="ghost"
                    onClick={handleGoBack}
                    leftIcon={<ArrowLeft size={18} />}
                >
                    Volver al Escaparate
                </Button>

                <div className="poster-step__actions-group">
                    <Button
                        variant="secondary"
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        leftIcon={isGeneratingPdf ? <Printer size={18} className="animate-spin" /> : <Download size={18} />}
                    >
                        {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
                    </Button>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleContinue}
                        leftIcon={<Check size={18} />}
                    >
                        Continuar con la Configuración
                    </Button>
                </div>
            </div>

            {/* Consejos */}
            <div className="poster-step__tips">
                <h3>💡 Consejos para tu cartel</h3>
                <ul>
                    <li>Imprime en tamaño A4 o A3 para mejor visibilidad</li>
                    <li>Colócalo a la altura de los ojos de tus clientes</li>
                    <li>Asegúrate de que haya buena iluminación para escanear</li>
                    <li>Plastifícalo si estará en exterior</li>
                </ul>
            </div>
        </div>
    );
}
