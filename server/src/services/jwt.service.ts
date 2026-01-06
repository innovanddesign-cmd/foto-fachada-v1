/**
 * JWT Service
 * ============
 * Handles JWT token generation, verification, and cookie management
 * 
 * Security Features:
 * - Access tokens (short-lived) for API access
 * - Refresh tokens (long-lived) for session renewal
 * - HttpOnly cookies to prevent XSS
 * - Secure flag for HTTPS-only
 * - SameSite=Strict for CSRF protection
 */
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { Response } from 'express';
import { securityLogger } from './logger.js';

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'foto-fachada-default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'foto-fachada-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Long-lived refresh token

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Cookie settings
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface TokenPayload {
    userId: string;
    email: string;
    plan: string;
}

export interface RefreshPayload {
    userId: string;
    tokenVersion?: number;
}

export interface DecodedToken extends TokenPayload, JwtPayload { }

// ─────────────────────────────────────────────────────────────
// Token Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256',
        issuer: 'foto-fachada'
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate a refresh token (long-lived)
 */
export function generateRefreshToken(userId: string, tokenVersion = 0): string {
    const payload: RefreshPayload = { userId, tokenVersion };

    const options: SignOptions = {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        algorithm: 'HS256',
        issuer: 'foto-fachada'
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Generate both tokens for a user
 */
export function generateTokenPair(user: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user.userId)
    };
}

// ─────────────────────────────────────────────────────────────
// Token Verification
// ─────────────────────────────────────────────────────────────

/**
 * Verify an access token
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): DecodedToken {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: 'foto-fachada'
        }) as DecodedToken;

        return decoded;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Token verification failed';
        securityLogger.warn({ error: message }, 'Access token verification failed');
        throw new Error('Invalid or expired access token');
    }
}

/**
 * Verify a refresh token
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshPayload & JwtPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            algorithms: ['HS256'],
            issuer: 'foto-fachada'
        }) as RefreshPayload & JwtPayload;

        return decoded;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Refresh token verification failed';
        securityLogger.warn({ error: message }, 'Refresh token verification failed');
        throw new Error('Invalid or expired refresh token');
    }
}

// ─────────────────────────────────────────────────────────────
// Cookie Management
// ─────────────────────────────────────────────────────────────

/**
 * Set authentication cookies (HttpOnly + Secure)
 */
export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
): void {
    // Access token cookie (15 minutes)
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,              // Prevents XSS access
        secure: IS_PRODUCTION,       // HTTPS only in production
        sameSite: 'strict',          // CSRF protection
        maxAge: 15 * 60 * 1000,      // 15 minutes
        path: '/'
    });

    // Refresh token cookie (7 days)
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/auth' // Only sent to auth endpoints
    });

    securityLogger.info('Auth cookies set');
}

/**
 * Clear authentication cookies (logout)
 */
export function clearAuthCookies(res: Response): void {
    res.cookie(ACCESS_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
    });

    res.cookie(REFRESH_TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'strict',
        maxAge: 0,
        path: '/api/auth'
    });

    securityLogger.info('Auth cookies cleared');
}

/**
 * Extract access token from request (cookie or header)
 */
export function extractTokenFromRequest(req: { cookies?: Record<string, string>; headers: Record<string, string | string[] | undefined> }): string | null {
    // Try cookie first (preferred)
    if (req.cookies?.[ACCESS_TOKEN_COOKIE]) {
        return req.cookies[ACCESS_TOKEN_COOKIE];
    }

    // Fall back to Authorization header (for API clients)
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

/**
 * Extract refresh token from request
 */
export function extractRefreshToken(req: { cookies?: Record<string, string> }): string | null {
    return req.cookies?.[REFRESH_TOKEN_COOKIE] || null;
}

// Export cookie names for external use
export const COOKIE_NAMES = {
    ACCESS: ACCESS_TOKEN_COOKIE,
    REFRESH: REFRESH_TOKEN_COOKIE
} as const;
