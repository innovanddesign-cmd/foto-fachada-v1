/**
 * ErrorPage - Página 500
 * ========================
 * Página de error genérico.
 * Estética Glassmorphism, 100% español.
 */

import { memo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import './ErrorPages.css';

interface ErrorPageProps {
    error?: Error | string;
    onRetry?: () => void;
    onGoHome?: () => void;
}

export const ErrorPage = memo(function ErrorPage({
    error,
    onRetry,
    onGoHome
}: ErrorPageProps) {
    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        } else {
            window.location.reload();
        }
    };

    const handleGoHome = () => {
        if (onGoHome) {
            onGoHome();
        } else {
            window.location.href = '/';
        }
    };

    const errorMessage = typeof error === 'string'
        ? error
        : error?.message || 'Error desconocido';

    return (
        <div className="error-page error-page--500">
            <div className="error-page__container glass-card">
                <div className="error-page__icon error-page__icon--warning">
                    <AlertTriangle size={64} strokeWidth={1.5} />
                </div>

                <h1 className="error-page__code">¡Ups!</h1>

                <h2 className="error-page__title">
                    Algo salió mal
                </h2>

                <p className="error-page__description">
                    Ha ocurrido un error inesperado.
                    Estamos trabajando para solucionarlo.
                </p>

                {errorMessage && process.env.NODE_ENV === 'development' && (
                    <div className="error-page__details">
                        <code>{errorMessage}</code>
                    </div>
                )}

                <div className="error-page__actions">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleRetry}
                        leftIcon={<RefreshCw size={18} />}
                    >
                        Reintentar
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleGoHome}
                        leftIcon={<Home size={18} />}
                    >
                        Volver al inicio
                    </Button>
                </div>
            </div>

            {/* Decoración de fondo */}
            <div className="error-page__bg-decoration error-page__bg-decoration--error" />
        </div>
    );
});
