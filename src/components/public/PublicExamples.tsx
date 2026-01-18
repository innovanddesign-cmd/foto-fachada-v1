import { useState } from 'react';
import { ArrowRight, Utensils, ShoppingBag, Hotel, Coffee } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import './PublicPages.css';

const SECTORS = [
    { id: 'all', label: 'Todos', icon: null },
    { id: 'restaurant', label: 'Restauración', icon: Utensils },
    { id: 'retail', label: 'Tiendas', icon: ShoppingBag },
    { id: 'hotel', label: 'Hoteles', icon: Hotel },
    { id: 'cafe', label: 'Cafeterías', icon: Coffee },
];

const EXAMPLES = [
    {
        id: 1,
        sector: 'restaurant',
        name: 'Restaurante Mediterráneo',
        location: 'Playa de Levante, Benidorm',
        before: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)', // Placeholder for photo
        after: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',   // Placeholder for design
        stats: { visits: '+45%', clicks: '210' }
    },
    {
        id: 2,
        sector: 'retail',
        name: 'Moda Ibicenca',
        location: 'Casco Antiguo, Altea',
        before: 'linear-gradient(135deg, #a8a29e 0%, #d6d3d1 100%)',
        after: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        stats: { visits: '+32%', clicks: '150' }
    },
    {
        id: 3,
        sector: 'cafe',
        name: 'Café del Mar',
        location: 'Paseo Marítimo, Calpe',
        before: 'linear-gradient(135deg, #78716c 0%, #a8a29e 100%)',
        after: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
        stats: { visits: '+60%', clicks: '320' }
    },
    {
        id: 4,
        sector: 'hotel',
        name: 'Hotel Vista Bella',
        location: 'Rincón de Loix, Benidorm',
        before: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
        after: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        stats: { visits: '+25%', clicks: '410' }
    },
    // Add more examples as needed
];

export function PublicExamples() {
    const [activeSector, setActiveSector] = useState('all');

    const filteredExamples = activeSector === 'all'
        ? EXAMPLES
        : EXAMPLES.filter(ex => ex.sector === activeSector);

    return (
        <div className="public-page fade-in">
            <div className="page-header">
                <Badge variant="neutral">Casos de Éxito</Badge>
                <h1>El Escaparate Digital</h1>
                <p>No somos una plantilla. Cada diseño es único para cada negocio.</p>
            </div>

            <div className="sector-filters">
                {SECTORS.map(sector => {
                    const Icon = sector.icon;
                    return (
                        <button
                            key={sector.id}
                            className={`filter-pill ${activeSector === sector.id ? 'active' : ''}`}
                            onClick={() => setActiveSector(sector.id)}
                        >
                            {Icon && <Icon size={14} />}
                            {sector.label}
                        </button>
                    );
                })}
            </div>

            <div className="examples-grid">
                {filteredExamples.map(example => (
                    <div key={example.id} className="example-card">
                        <div className="card-media">
                            <div className="media-layer before" style={{ background: example.before }}>
                                <Badge className="status-badge">Antes</Badge>
                            </div>
                            <div className="media-layer after" style={{ background: example.after }}>
                                <Badge className="status-badge success">Después (IA)</Badge>
                                <div className="example-stats">
                                    <div className="stat">
                                        <span className="value">{example.stats.visits}</span>
                                        <span className="label">Visitas</span>
                                    </div>
                                    <div className="stat">
                                        <span className="value">{example.stats.clicks}</span>
                                        <span className="label">Escaneos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-info">
                            <h3>{example.name}</h3>
                            <p>{example.location}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="page-cta">
                <h2>¿Quieres resultados como estos?</h2>
                <Button size="lg" variant="primary" rightIcon={<ArrowRight size={20} />}>
                    Crear mi Escaparate Ahora
                </Button>
            </div>
        </div>
    );
}
