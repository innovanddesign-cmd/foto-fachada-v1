import { Sparkles, Palette, Type, Users, Store, Edit3 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './BrandAnalysis.css';

export function BrandAnalysis() {
    const { brandData, isAnalyzing } = useAppStore();

    if (isAnalyzing) {
        return (
            <div className="brand-analysis loading">
                <div className="loading-content">
                    <div className="loading-spinner">
                        <Sparkles className="animate-spin" size={32} />
                    </div>
                    <h3>Analizando la fachada...</h3>
                    <p className="text-muted">Extrayendo colores, logo y estilo del negocio</p>
                    <div className="loading-bars">
                        <div className="loading-bar" style={{ animationDelay: '0s' }} />
                        <div className="loading-bar" style={{ animationDelay: '0.1s' }} />
                        <div className="loading-bar" style={{ animationDelay: '0.2s' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!brandData) return null;

    return (
        <div className="brand-analysis animate-fadeIn">
            <div className="section-header">
                <Sparkles className="section-icon text-warning" />
                <h2>Identidad de Marca</h2>
                <p className="text-muted">Datos extraídos de la fachada</p>
            </div>

            <div className="brand-cards">
                {/* Business Name Card */}
                <div className="brand-card main-card">
                    <div className="business-name" style={{ color: brandData.colors.primary }}>
                        {brandData.name}
                    </div>
                    <div className="business-type">
                        <Store size={16} />
                        {brandData.businessType}
                        {brandData.niche && <span className="niche">• {brandData.niche}</span>}
                    </div>
                    <p className="business-description">{brandData.description}</p>
                </div>

                {/* Colors Card */}
                <div className="brand-card">
                    <div className="card-header">
                        <Palette size={18} />
                        <span>Colores de Marca</span>
                    </div>
                    <div className="color-palette">
                        <div className="color-swatch">
                            <div
                                className="swatch-color"
                                style={{ backgroundColor: brandData.colors.primary }}
                            />
                            <span className="swatch-label">Primario</span>
                            <code className="swatch-hex">{brandData.colors.primary}</code>
                        </div>
                        <div className="color-swatch">
                            <div
                                className="swatch-color"
                                style={{ backgroundColor: brandData.colors.secondary }}
                            />
                            <span className="swatch-label">Secundario</span>
                            <code className="swatch-hex">{brandData.colors.secondary}</code>
                        </div>
                        <div className="color-swatch">
                            <div
                                className="swatch-color"
                                style={{ backgroundColor: brandData.colors.accent }}
                            />
                            <span className="swatch-label">Acento</span>
                            <code className="swatch-hex">{brandData.colors.accent}</code>
                        </div>
                    </div>
                </div>

                {/* Typography Card */}
                <div className="brand-card">
                    <div className="card-header">
                        <Type size={18} />
                        <span>Tipografía</span>
                    </div>
                    <p className="card-value">{brandData.typography}</p>
                </div>

                {/* Style Card */}
                <div className="brand-card">
                    <div className="card-header">
                        <Edit3 size={18} />
                        <span>Estilo Visual</span>
                    </div>
                    <p className="card-value">{brandData.style}</p>
                </div>

                {/* Target Audience Card */}
                {brandData.targetAudience && (
                    <div className="brand-card">
                        <div className="card-header">
                            <Users size={18} />
                            <span>Público Objetivo</span>
                        </div>
                        <p className="card-value">{brandData.targetAudience}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
