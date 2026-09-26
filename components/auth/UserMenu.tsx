"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import { User, LogOut, Cloud, CloudOff } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function UserMenu() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white/20 animate-pulse" />
            </div>
        );
    }

    if (!user) {
        return (
            <a
                href="/auth/login"
                className="flex items-center gap-2 min-h-11 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
            >
                <User className="w-3.5 h-3.5" />
                Iniciar Sesión
            </a>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {/* Sync indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">Sesión activa</span>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>
                <span className="hidden sm:block text-xs font-medium text-white/70 max-w-[120px] truncate">
                    {user.email}
                </span>
                <button
                    type="button"
                    onClick={handleSignOut}
                    aria-label="Cerrar sesión"
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                    <LogOut className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
