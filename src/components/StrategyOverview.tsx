/**
 * Strategy Overview Component
 * ===========================
 * Vista informacional de los 3 bloques estratégicos.
 */

import { TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import './StrategyOverview.css';

interface StrategyBlock {
    id: string;
    emoji: string;
    title: string;
    tagline: string;
    description: string;
    example: string;
    color: string;
}

const STRATEGY_BLOCKS: StrategyBlock[] = [
    {
        id: 'ventas',
        emoji: '💰',
        title: 'Venta Rápida',
        tagline: 'Consigue clientes nuevos',
        description: 'Ofertas irresistibles que generan urgencia y atraen clientes al momento.',
        example: '2x1 en [PRODUCTO] solo hoy',
        color: '#22c55e'
    },
    {
        id: 'fidelizacion',
        emoji: '🔄',
        title: 'Fidelizar',
        tagline: 'Haz que vuelvan',
        description: 'Recompensas y sorpresas que convierten visitas en clientes habituales.',
        example: 'Rasca y gana en cada visita',
        color: '#8b5cf6'
    },
    {
        id: 'autoridad',
        emoji: '⭐',
        title: 'Autoridad',
        tagline: 'Sé el experto',
        description: 'Posiciónate como referente en tu zona y consigue más reseñas.',
        example: 'Guía de [TIPO] por el barrio',
        color: '#f59e0b'
    }
];

export function StrategyOverview() {
    const { brandData } = useAppStore();

    const personalizeExample = (example: string): string => {
        if (!brandData) return example;
        const businessType = brandData.businessType || 'negocio';
        const product = getMainProduct(businessType);
        return example.replace('[PRODUCTO]', product).replace('[TIPO]', businessType);
    };

    return (
        <div className="strategy-overview">
            <div className="overview-header">
                <h2 className="overview-title">
                    <span className="title-emoji">🎯</span>
                    Tu Plan de Marketing
                </h2>
                <p className="overview-subtitle">
                    3 estrategias diseñadas para hacer crecer tu negocio
                </p>
            </div>

            <div className="strategy-blocks">
                {STRATEGY_BLOCKS.map((block, index) => (
                    <div
                        key={block.id}
                        className="strategy-block"
                        style={{
                            '--block-color': block.color,
                            '--delay': `${index * 0.1}s`
                        } as React.CSSProperties}
                    >
                        <div className="block-header">
                            <div className="block-icon" style={{ background: block.color }}>
                                {block.id === 'ventas' && <TrendingUp size={24} color="white" />}
                                {block.id === 'fidelizacion' && <Users size={24} color="white" />}
                                {block.id === 'autoridad' && <Award size={24} color="white" />}
                            </div>
                            <div className="block-titles">
                                <h3 className="block-title">
                                    <span className="block-emoji">{block.emoji}</span>
                                    {block.title}
                                </h3>
                                <span className="block-tagline">{block.tagline}</span>
                            </div>
                        </div>

                        <p className="block-description">{block.description}</p>

                        <div className="block-example">
                            <span className="example-label">📌 Para ti:</span>
                            <span className="example-text">"{personalizeExample(block.example)}"</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="overview-footer">
                <div className="next-step-hint">
                    <ArrowRight size={18} />
                    <span>A continuación generaremos tus 3 páginas personalizadas</span>
                </div>
            </div>
        </div>
    );
}

function getMainProduct(businessType: string): string {
    const products: Record<string, string> = {
        'bar': 'cañas', 'cafetería': 'cafés', 'restaurante': 'menú del día',
        'pizzería': 'pizzas', 'panadería': 'pan artesano', 'heladería': 'helados',
        'peluquería': 'cortes', 'gym': 'clases', 'spa': 'masajes'
    };
    const normalized = businessType.toLowerCase();
    for (const [key, value] of Object.entries(products)) {
        if (normalized.includes(key)) return value;
    }
    return 'productos';
}

export default StrategyOverview;
