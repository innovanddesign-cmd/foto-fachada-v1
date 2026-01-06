/**
 * Upload Middleware
 * ==================
 * Multer configuration with MIME type validation
 */
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Ensure upload directory exists
 */
function ensureUploadDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Storage configuration with organized folder structure
 */
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        // Organize by clientId/campaignId
        const body = req.body || {};
        const clientId = (body.clientId as string) || 'anonymous';
        const campaignId = (body.campaignId as string) || 'general';

        const uploadPath = path.join(UPLOAD_DIR, clientId, campaignId);
        ensureUploadDir(uploadPath);

        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const safeName = file.originalname
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 50);

        cb(null, `${timestamp}-${random}-${safeName}`);
    }
});

/**
 * File filter for basic MIME type validation
 * (Deep validation with magic bytes done in route handler)
 */
const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Usa JPG, PNG o WEBP.`));
    }
};

/**
 * Multer instance for image uploads
 */
export const imageUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5 // Max 5 files at once
    }
});

/**
 * Multer error handler middleware
 */
export function handleMulterError(
    err: Error,
    _req: import('express').Request,
    res: import('express').Response,
    next: import('express').NextFunction
): void {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
                success: false,
                error: 'Archivo demasiado grande. Máximo: 10MB.'
            });
            return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            res.status(400).json({
                success: false,
                error: 'Demasiados archivos. Máximo: 5.'
            });
            return;
        }
        res.status(400).json({
            success: false,
            error: `Error de upload: ${err.message}`
        });
        return;
    }

    if (err.message.includes('Tipo de archivo')) {
        res.status(400).json({
            success: false,
            error: err.message
        });
        return;
    }

    next(err);
}

/**
 * Get the public URL for an uploaded file
 */
export function getPublicUrl(filePath: string): string {
    const relativePath = filePath.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
    return `/uploads${relativePath}`;
}

export { UPLOAD_DIR, ALLOWED_MIME_TYPES };
