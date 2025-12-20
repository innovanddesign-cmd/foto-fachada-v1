import { useState } from 'react';
import { Mail, ArrowRight, X, Sparkles, Loader } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { Button } from './ui/Button';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const { signInWithOtp } = useAppStore();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await signInWithOtp(email);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSent(true);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md overflow-hidden bg-background border border-glass rounded-2xl shadow-2xl animate-scaleIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {sent ? '¡Revisa tu correo!' : 'Bienvenido de nuevo'}
                        </h2>
                        <p className="mt-2 text-muted">
                            {sent
                                ? `Hemos enviado un enlace mágico a ${email}`
                                : 'Ingresa tu correo para iniciar sesión o registrarte'
                            }
                        </p>
                    </div>

                    {sent ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
                                El enlace de acceso expirará en 10 minutos.
                            </div>
                            <Button variant="secondary" className="w-full" onClick={onClose}>
                                Entendido
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="hola@ejemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-12"
                                disabled={loading}
                                leftIcon={loading ? <Loader className="animate-spin" /> : undefined}
                                rightIcon={!loading ? <ArrowRight size={18} /> : undefined}
                            >
                                {loading ? 'Enviando enlace...' : 'Continuar con Email'}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Al continuar, aceptas nuestros Tameinos de Servicio y Política de Privacidad.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
