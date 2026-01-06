/**
 * Auth Routes
 * ============
 * Handles authentication endpoints: register, login, logout, refresh
 * 
 * Security Features:
 * - Bcrypt password hashing (cost=12)
 * - JWT tokens in HttpOnly cookies
 * - Rate limiting on all endpoints
 * - Input validation
 */
import { Router, Request, Response } from 'express';
import { query } from '../db/pool.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../services/password.service.js';
import {
    generateTokenPair,
    setAuthCookies,
    clearAuthCookies,
    verifyRefreshToken,
    extractRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    TokenPayload
} from '../services/jwt.service.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { securityLogger } from '../services/logger.js';

const router = Router();

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface RegisterBody {
    email: string;
    password: string;
    name?: string;
}

interface LoginBody {
    email: string;
    password: string;
}

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Register a new user with secure password hashing
 */
router.post('/register', async (req: Request<object, object, RegisterBody>, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
            return;
        }

        // Password strength validation
        const passwordCheck = validatePasswordStrength(password);
        if (!passwordCheck.isValid) {
            res.status(400).json({
                success: false,
                error: passwordCheck.error
            });
            return;
        }

        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM clients WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
            return;
        }

        // Hash password securely with bcrypt
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await query(
            `INSERT INTO clients (email, password_hash, name, plan) 
       VALUES ($1, $2, $3, 'free') 
       RETURNING id, email, name, plan, created_at`,
            [email.toLowerCase(), passwordHash, name || null]
        );

        const user = result.rows[0];

        // Generate JWT tokens
        const userPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            plan: user.plan
        };

        const { accessToken, refreshToken } = generateTokenPair(userPayload);

        // Set HttpOnly cookies
        setAuthCookies(res, accessToken, refreshToken);

        securityLogger.info({ userId: user.id, email: user.email }, 'User registered successfully');

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan
            }
        });
    } catch (error) {
        securityLogger.error({ error }, 'Registration error');
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and set JWT cookies
 */
router.post('/login', async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }

        // Find user
        const result = await query(
            'SELECT id, email, name, password_hash, plan, is_active FROM clients WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            // Use generic message to prevent email enumeration
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }

        const user = result.rows[0];

        // Check if active
        if (!user.is_active) {
            res.status(403).json({
                success: false,
                error: 'Account is deactivated'
            });
            return;
        }

        // Verify password with bcrypt
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            securityLogger.warn({ email }, 'Invalid login attempt');
            res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
            return;
        }

        // Generate JWT tokens
        const userPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            plan: user.plan
        };

        const { accessToken, refreshToken } = generateTokenPair(userPayload);

        // Set HttpOnly cookies
        setAuthCookies(res, accessToken, refreshToken);

        securityLogger.info({ userId: user.id }, 'User logged in successfully');

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan
            }
        });
    } catch (error) {
        securityLogger.error({ error }, 'Login error');
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
router.post('/logout', (req: Request, res: Response): void => {
    clearAuthCookies(res);

    securityLogger.info('User logged out');

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = extractRefreshToken(req);

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                error: 'No refresh token provided'
            });
            return;
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Fetch user from database
        const result = await query(
            'SELECT id, email, plan, is_active FROM clients WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
            return;
        }

        const user = result.rows[0];

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

        res.json({
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        securityLogger.warn({ error }, 'Token refresh failed');
        res.status(401).json({
            success: false,
            error: 'Token refresh failed'
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', requireAuth, (req: Request, res: Response): void => {
    const authReq = req as AuthenticatedRequest;

    res.json({
        success: true,
        user: authReq.user
    });
});

export default router;
