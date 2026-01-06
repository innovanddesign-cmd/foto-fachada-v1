/**
 * Password Service
 * =================
 * Secure password hashing using bcrypt
 * 
 * Security Features:
 * - Cost factor 12 (recommended for 2025+)
 * - Automatic salt generation
 * - Timing-safe comparison
 */
import bcrypt from 'bcrypt';
import { securityLogger } from './logger.js';

// Cost factor: 12 is a good balance between security and performance
// Each increment doubles the computation time
const SALT_ROUNDS = 12;

/**
 * Hash a password securely
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        securityLogger.error({ error }, 'Password hashing failed');
        throw new Error('Password hashing failed');
    }
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored password hash
 * @returns true if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        const isValid = await bcrypt.compare(password, hash);
        return isValid;
    } catch (error) {
        securityLogger.error({ error }, 'Password verification failed');
        return false;
    }
}

/**
 * Check if a password meets minimum requirements
 * @param password - Password to validate
 * @returns Object with isValid and optional error message
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters' };
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password must be less than 128 characters' };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number' };
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one letter' };
    }

    return { isValid: true };
}
