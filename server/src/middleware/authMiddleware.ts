/**
 * Authentication Middleware
 * ==========================
 * Protects routes by requiring valid JWT tokens
 * 
 * Security Features:
 * - Token extraction from cookies (preferred) or Authorization header
 * - Automatic token refresh when access token is expired but refresh is valid
 * - User data injection into request object
 */
import { Request, Response, NextFunction } from 'express';
import {
    verifyAccessToken,
    verifyRefreshToken,
    extractTokenFromRequest,
    extractRefreshToken,
    generateAccessToken,
    setAuthCookies,
    generateRefreshToken,
    TokenPayload
} from '../services/jwt.service.js';
import { query } from '../db/pool.js';
import { securityLogger } from '../services/logger.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Extended Request with authenticated user data
 */
export interface AuthenticatedRequest extends Request {
    user: TokenPayload;
}

// ─────────────────────────────────────────────────────────────
// Middleware Functions
// ─────────────────────────────────────────────────────────────

/**
 * Require authentication for route access
 * Returns 401 if no valid token is present
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Extract access token
        const accessToken = extractTokenFromRequest(req);

        if (!accessToken) {
            // No access token - try refresh token
            const refreshToken = extractRefreshToken(req);

            if (refreshToken) {
                // Try to refresh the session
                const refreshed = await tryRefreshSession(req as AuthenticatedRequest, res, refreshToken);
                if (refreshed) {
                    return next();
                }
            }

            res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
            return;
        }

        // Verify access token
        try {
            const decoded = verifyAccessToken(accessToken);
            (req as AuthenticatedRequest).user = {
                userId: decoded.userId,
                email: decoded.email,
                plan: decoded.plan
            };
            return next();
        } catch {
            // Access token expired or invalid - try refresh
            const refreshToken = extractRefreshToken(req);

            if (refreshToken) {
                const refreshed = await tryRefreshSession(req as AuthenticatedRequest, res, refreshToken);
                if (refreshed) {
                    return next();
                }
            }

            res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'TOKEN_INVALID'
            });
            return;
        }
    } catch (error) {
        securityLogger.error({ error }, 'Authentication middleware error');
        res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
}

/**
 * Optional authentication - doesn't block if no token
 * Adds user data if valid token is present
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const accessToken = extractTokenFromRequest(req);

        if (accessToken) {
            try {
                const decoded = verifyAccessToken(accessToken);
                (req as AuthenticatedRequest).user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    plan: decoded.plan
                };
            } catch {
                // Token invalid but we don't block - just continue without user
                securityLogger.debug('Optional auth: invalid token, continuing without user');
            }
        }

        next();
    } catch (error) {
        // Don't block on errors for optional auth
        next();
    }
}

/**
 * Require specific plan level for access
 */
export function requirePlan(allowedPlans: string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authReq = req as AuthenticatedRequest;

        if (!authReq.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }

        if (!allowedPlans.includes(authReq.user.plan)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient plan level',
                code: 'PLAN_REQUIRED',
                requiredPlans: allowedPlans,
                currentPlan: authReq.user.plan
            });
            return;
        }

        next();
    };
}

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Try to refresh the session using a refresh token
 */
async function tryRefreshSession(
    req: AuthenticatedRequest,
    res: Response,
    refreshToken: string
): Promise<boolean> {
    try {
        const decoded = verifyRefreshToken(refreshToken);

        // Fetch user from database to get current data
        const result = await query(
            'SELECT id, email, plan, is_active FROM clients WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            securityLogger.warn({ userId: decoded.userId }, 'Refresh token for non-existent user');
            return false;
        }

        const user = result.rows[0];

        if (!user.is_active) {
            securityLogger.warn({ userId: decoded.userId }, 'Refresh token for deactivated user');
            return false;
        }

        // Generate new tokens
        const userPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            plan: user.plan
        };

        const newAccessToken = generateAccessToken(userPayload);
        const newRefreshToken = generateRefreshToken(user.id);

        // Set new cookies
        setAuthCookies(res, newAccessToken, newRefreshToken);

        // Set user on request
        req.user = userPayload;

        securityLogger.info({ userId: user.id }, 'Session refreshed successfully');
        return true;

    } catch (error) {
        securityLogger.debug({ error }, 'Session refresh failed');
        return false;
    }
}

/**
 * Get user from request (type guard)
 */
export function getUser(req: Request): TokenPayload | null {
    return (req as AuthenticatedRequest).user || null;
}
