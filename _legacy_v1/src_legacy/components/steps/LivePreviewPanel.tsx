/**
 * Live Preview Panel
 * ==================
 * Panel lateral que muestra el mockup del escaparate
 * actualizándose en tiempo real mientras el usuario edita el formulario.
 */

import { useMemo, memo } from 'react';
import { Smartphone } from 'lucide-react';
import type { UISchema, BrandIdentity2026 } from '../../types';
import './LivePreviewPanel.css';

interface LivePreviewPanelProps {
    schema: UISchema | null;
    brandIdentity: BrandIdentity2026 | null;
    formValues: Record<string, string>;
}

/**
 * Componente memoizado para evitar re-renders innecesarios
 */
export const LivePreviewPanel = memo(function LivePreviewPanel({
    schema,
    brandIdentity,
    formValues
}: LivePreviewPanelProps) {

    // Extraer colores de la identidad de marca
    const colors = useMemo(() => ({
        primary: brandIdentity?.palette?.color_principal || '#6366f1',
        accent: brandIdentity?.palette?.color_acento || '#8b5cf6',
        surface: brandIdentity?.palette?.color_superficie || 'rgba(99, 102, 241, 0.1)',
        gradient: brandIdentity?.palette?.gradiente_sugerido || 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    }), [brandIdentity]);

    // Obtener valores específicos del formulario
    const previewData = useMemo(() => {
        const data: Record<string, string> = {};

        // Buscar valores relevantes para el preview
        Object.entries(formValues).forEach(([key, value]) => {
            if (key.includes('titulo') || key.includes('title')) {
                data.title = value;
            }
            if (key.includes('subtitulo') || key.includes('subtitle')) {
                data.subtitle = value;
            }
            if (key.includes('whatsapp')) {
                data.whatsapp = value;
            }
            if (key.includes('instagram')) {
                data.instagram = value;
            }
            if (key.includes('producto') || key.includes('product')) {
                data.product = value;
            }
            if (key.includes('precio_oferta') || key.includes('offer_price')) {
                data.offerPrice = value;
            }
        });

        return data;
    }, [formValues]);

    // Renderizar componentes del escaparate
    const renderComponents = () => {
        if (!schema?.escaparate_structure) {
            return (
                <div className="live-preview__placeholder">
                    <span>Cargando escaparate...</span>
                </div>
            );
        }

        return schema.escaparate_structure.slice(0, 4).map((component) => {
            const componentKey = component.id;

            switch (component.type) {
                case 'HeroVideoBackground':
                case 'HeroGradient':
                    return (
                        <div
                            key={componentKey}
                            className="preview-hero"
                            style={{ background: colors.gradient }}
                        >
                            <div className="preview-hero__content">
                                <div className="preview-hero__avatar">
                                    {(previewData.title || component.content?.titulo)?.[0]?.toUpperCase() || 'N'}
                                </div>
                                <h3 className="preview-hero__title">
                                    {previewData.title || component.content?.titulo || 'Tu Negocio'}
                                </h3>
                                <p className="preview-hero__subtitle">
                                    {previewData.subtitle || component.content?.subtitulo || 'Bienvenido'}
                                </p>
                            </div>
                        </div>
                    );

                case 'FlashCard_Offer':
                    return (
                        <div
                            key={componentKey}
                            className="preview-offer"
                            style={{ borderColor: colors.accent }}
                        >
                            <span className="preview-offer__badge">🔥 OFERTA</span>
                            <span className="preview-offer__name">
                                {previewData.product || component.content?.producto || 'Producto'}
                            </span>
                            {previewData.offerPrice && (
                                <span className="preview-offer__price" style={{ color: colors.accent }}>
                                    {previewData.offerPrice}€
                                </span>
                            )}
                        </div>
                    );

                case 'Contact_Glass':
                case 'WhatsApp_Float':
                    if (!previewData.whatsapp && !component.content?.whatsapp) return null;
                    return (
                        <div
                            key={componentKey}
                            className="preview-contact"
                            style={{ background: colors.surface }}
                        >
                            <span className="preview-contact__icon">💬</span>
                            <span className="preview-contact__text">
                                {previewData.whatsapp || component.content?.whatsapp || 'WhatsApp'}
                            </span>
                        </div>
                    );

                case 'Social_Links':
                case 'Instagram_Feed_Style':
                    if (!previewData.instagram && !component.content?.instagram) return null;
                    return (
                        <div key={componentKey} className="preview-social">
                            <span className="preview-social__icon">📸</span>
                            <span className="preview-social__text">
                                {previewData.instagram || component.content?.instagram || '@tunegocio'}
                            </span>
                        </div>
                    );

                case 'Menu_Categories':
                case 'Services_Grid':
                    return (
                        <div key={componentKey} className="preview-menu">
                            <span className="preview-menu__title">📋 Servicios</span>
                            <div className="preview-menu__items">
                                <span className="preview-menu__item" style={{ background: colors.surface }}>Item 1</span>
                                <span className="preview-menu__item" style={{ background: colors.surface }}>Item 2</span>
                                <span className="preview-menu__item" style={{ background: colors.surface }}>Item 3</span>
                            </div>
                        </div>
                    );

                default:
                    return (
                        <div key={componentKey} className="preview-generic">
                            <span>{component.content?.titulo || component.type.replace(/_/g, ' ')}</span>
                        </div>
                    );
            }
        });
    };

    return (
        <div className="live-preview">
            <div className="live-preview__header">
                <Smartphone size={18} />
                <span>Vista Previa en Tiempo Real</span>
            </div>

            <div className="live-preview__device">
                <div className="live-preview__notch"></div>
                <div className="live-preview__screen">
                    {renderComponents()}
                </div>
                <div className="live-preview__home-indicator"></div>
            </div>

            <p className="live-preview__hint">
                Los cambios se reflejan instantáneamente
            </p>
        </div>
    );
});
