"use client";

import { useState } from 'react';
import { signUp } from '@/lib/supabase/auth';
import { motion } from 'framer-motion';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const { user, error: authError } = await signUp(email, password);

        if (authError) {
            setError(authError);
            setLoading(false);
            return;
        }

        if (user) {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm mx-auto text-center space-y-6"
            >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Cuenta creada</h2>
                    <p className="text-white/40 text-sm mt-2">
                        Revisa tu bandeja de entrada para confirmar tu email.
                    </p>
                </div>
                <a
                    href="/auth/login"
                    className="inline-block px-6 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/15 transition-colors"
                >
                    Ir a Iniciar Sesión
                </a>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto space-y-6"
        >
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
                <p className="text-white/40 text-sm mt-1">Empieza a crear escaparates digitales</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <span className="animate-pulse">Creando cuenta...</span>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Crear Cuenta
                        </>
                    )}
                </button>
            </form>

            <p className="text-center text-white/30 text-xs">
                ¿Ya tienes cuenta?{' '}
                <a href="/auth/login" className="text-purple-400 hover:text-purple-300 font-bold">
                    Iniciar sesión
                </a>
            </p>
        </motion.div>
    );
}
