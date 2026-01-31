/**
 * DeployStep - Estado DEPLOY
 * Entrega final: Enlaces, archivos y confirmación de publicación
 */

import { useCallback, useState } from 'react';
import { Check, Copy, ExternalLink, Download, Share2, Sparkles, RotateCcw } from 'lucide-react';
import { useEscaparateStore } from '../../store/escaparateStore';
import { Button } from '../ui/Button';
import './DeployStep.css';

export function DeployStep() {
    const { currentState, resetFlow } = useEscaparateStore();
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Obtener datos del estado actual
    const deployResult = currentState.step === 'DEPLOY' ? currentState.result : null;
    const escaparateData = currentState.step === 'DEPLOY' ? currentState.data : null;
    const businessName = escaparateData?.brandData?.name || 'Tu Negocio';

    // ─── HANDLERS ───────────────────────────────────────────────

    const handleCopyUrl = useCallback(async () => {
        if (!deployResult?.landingUrl) return;

        try {
            await navigator.clipboard.writeText(deployResult.landingUrl);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (error) {
            console.error('[DeployStep] Error copiando URL:', error);
        }
    }, [deployResult]);

    const handleShare = useCallback(async () => {
        if (!deployResult?.landingUrl) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${businessName} - Escaparate Digital`,
                    text: `¡Visita el escaparate digital de ${businessName}!`,
                    url: deployResult.landingUrl
                });
            } else {
                handleCopyUrl();
            }
        } catch (error) {
            console.error('[DeployStep] Error compartiendo:', error);
        }
    }, [deployResult, businessName, handleCopyUrl]);

    const handleNewEscaparate = useCallback(() => {
        resetFlow();
    }, [resetFlow]);

    // ─── RENDER ─────────────────────────────────────────────────

    if (!deployResult) {
        return (
            <div className="deploy-step deploy-step--loading">
                <p>Cargando resultados...</p>
            </div>
        );
    }

    return (
        <div className="deploy-step">
            {/* Celebración */}
            <div className="deploy-step__celebration">
                <div className="deploy-step__confetti" />
                <div className="deploy-step__icon">
                    <Sparkles size={48} />
                </div>
                <h1 className="deploy-step__title">
                    🎉 ¡Tu Escaparate Está Publicado!
                </h1>
                <p className="deploy-step__subtitle">
                    <strong>{businessName}</strong> ya tiene su escaparate digital activo
                </p>
            </div>

            {/* URL Card */}
            <div className="deploy-step__url-card">
                <div className="deploy-step__url-label">Tu enlace público:</div>
                <div className="deploy-step__url-container">
                    <code className="deploy-step__url">{deployResult.landingUrl}</code>
                    <div className="deploy-step__url-actions">
                        <button
                            className="deploy-step__url-btn"
                            onClick={handleCopyUrl}
                            title="Copiar enlace"
                        >
                            {copiedUrl ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <a
                            href={deployResult.landingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deploy-step__url-btn"
                            title="Abrir en nueva pestaña"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>
                {copiedUrl && (
                    <span className="deploy-step__copied">¡Enlace copiado!</span>
                )}
            </div>

            {/* Recursos */}
            <div className="deploy-step__resources">
                <h2 className="deploy-step__resources-title">Tus Recursos</h2>

                <div className="deploy-step__resource-grid">
                    <div className="deploy-step__resource">
                        <div className="deploy-step__resource-icon">🔗</div>
                        <div className="deploy-step__resource-info">
                            <h3>Landing Page</h3>
                            <p>Tu escaparate digital completo</p>
                        </div>
                        <a
                            href={deployResult.landingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deploy-step__resource-action"
                        >
                            <ExternalLink size={16} />
                            Visitar
                        </a>
                    </div>

                    <div className="deploy-step__resource">
                        <div className="deploy-step__resource-icon">📄</div>
                        <div className="deploy-step__resource-info">
                            <h3>Cartel PDF</h3>
                            <p>Listo para imprimir con QR</p>
                        </div>
                        <button className="deploy-step__resource-action">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>

                    <div className="deploy-step__resource">
                        <div className="deploy-step__resource-icon">📱</div>
                        <div className="deploy-step__resource-info">
                            <h3>Código QR</h3>
                            <p>Imagen PNG de alta resolución</p>
                        </div>
                        <button className="deploy-step__resource-action">
                            <Download size={16} />
                            Descargar
                        </button>
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="deploy-step__actions">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleShare}
                    leftIcon={<Share2 size={18} />}
                >
                    Compartir Escaparate
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleNewEscaparate}
                    leftIcon={<RotateCcw size={18} />}
                >
                    Crear Otro Escaparate
                </Button>
            </div>

            {/* Tips */}
            <div className="deploy-step__tips">
                <h3>📣 Próximos Pasos</h3>
                <ul>
                    <li>Comparte el enlace en tus redes sociales</li>
                    <li>Imprime el cartel y colócalo en tu fachada</li>
                    <li>Añade el enlace a tu bio de Instagram</li>
                    <li>Envía el link a tus clientes por WhatsApp</li>
                </ul>
            </div>
        </div>
    );
}
