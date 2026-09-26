/**
 * Supabase Auth Helper
 * Wraps auth operations with proper error handling.
 */
import { createClient } from './client';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
    user: User | null;
    error: string | null;
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        return { user: null, error: translateAuthError(error) };
    }

    return { user: data.user, error: null };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { user: null, error: translateAuthError(error) };
    }

    return { user: data.user, error: null };
}

export async function signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Translate Supabase auth errors to user-friendly Spanish messages.
 */
function translateAuthError(error: AuthError): string {
    const msg = error.message.toLowerCase();

    if (msg.includes('invalid login credentials')) {
        return 'Email o contraseña incorrectos.';
    }
    if (msg.includes('user already registered')) {
        return 'Ya existe una cuenta con este email.';
    }
    if (msg.includes('email not confirmed')) {
        return 'Email no confirmado. Revisa tu bandeja de entrada.';
    }
    if (msg.includes('password')) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (msg.includes('rate limit')) {
        return 'Demasiados intentos. Espera un momento y vuelve a intentar.';
    }

    return error.message || 'Error de autenticación desconocido.';
}
