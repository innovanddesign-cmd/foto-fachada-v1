/**
 * NotFoundPage - Página 404
 * ===========================
 * Página de error cuando no se encuentra la ruta.
 * Estética Glassmorphism, 100% español.
 */

import { memo } from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import './ErrorPages.css';

interface NotFoundPageProps {
    onGoHome?: () => void;
}

export const NotFoundPage = memo(function NotFoundPage({ onGoHome }: NotFoundPageProps) {
    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="error-page">
            <div className="error-page__container glass-card">
                <div className="error-page__icon">
                    <Search size={64} strokeWidth={1.5} />
                </div>

                <h1 className="error-page__code">404</h1>

                <h2 className="error-page__title">
                    Página no encontrada
                </h2>

                <p className="error-page__description">
                    Vaya, parece que esta página se ha escapado.
                    No te preocupes, te ayudamos a volver.
                </p>

                <div className="error-page__actions">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGoHome}
                        leftIcon={<Home size={18} />}
                    >
                        Volver al inicio
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        leftIcon={<ArrowLeft size={18} />}
                    >
                        Ir atrás
                    </Button>
                </div>
            </div>

            {/* Decoración de fondo */}
            <div className="error-page__bg-decoration" />
        </div>
    );
});
