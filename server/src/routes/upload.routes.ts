/**
 * Upload Routes
 * ==============
 * Endpoints for secure image upload with MIME validation
 */
import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import {
    imageUpload,
    handleMulterError,
    getPublicUrl,
    ALLOWED_MIME_TYPES,
    UPLOAD_DIR
} from '../middleware/uploadMiddleware.js';
import { appLogger } from '../services/logger.js';

const router = Router();

// Allowed magic byte signatures
const ALLOWED_MIME_SET = new Set(ALLOWED_MIME_TYPES);

/**
 * POST /api/uploads/image
 * Upload a single image with validation
 */
router.post(
    '/image',
    imageUpload.single('image'),
    handleMulterError,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;

            if (!file) {
                res.status(400).json({
                    success: false,
                    error: 'No se recibió ningún archivo'
                });
                return;
            }

            // Read file for magic byte validation
            const buffer = await fs.readFile(file.path);
            const fileType = await fileTypeFromBuffer(buffer);

            // Validate MIME type using magic bytes (not just extension)
            if (!fileType || !ALLOWED_MIME_SET.has(fileType.mime)) {
                // Delete the suspicious file
                await fs.unlink(file.path);

                appLogger.warn({
                    context: 'upload',
                    claimed: file.mimetype,
                    actual: fileType?.mime || 'unknown',
                    filename: file.originalname
                }, 'Rejected file with mismatched MIME type');

                res.status(400).json({
                    success: false,
                    error: 'Tipo de archivo inválido. Solo JPG, PNG y WEBP son permitidos.'
                });
                return;
            }

            // Generate public URL
            const publicUrl = getPublicUrl(file.path);

            appLogger.info({
                context: 'upload',
                filename: file.filename,
                size: file.size,
                mime: fileType.mime,
                clientId: req.body?.clientId,
                campaignId: req.body?.campaignId
            }, 'Image uploaded successfully');

            res.status(201).json({
                success: true,
                id: file.filename,
                url: publicUrl,
                size: file.size,
                mime: fileType.mime
            });

        } catch (error) {
            appLogger.error({ error, context: 'upload' }, 'Upload processing error');
            next(error);
        }
    }
);

/**
 * POST /api/uploads/images
 * Upload multiple images (max 5)
 */
router.post(
    '/images',
    imageUpload.array('images', 5),
    handleMulterError,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'No se recibieron archivos'
                });
                return;
            }

            const results: Array<{
                id: string;
                url: string;
                valid: boolean;
                error?: string;
            }> = [];

            for (const file of files) {
                const buffer = await fs.readFile(file.path);
                const fileType = await fileTypeFromBuffer(buffer);

                if (!fileType || !ALLOWED_MIME_SET.has(fileType.mime)) {
                    await fs.unlink(file.path);
                    results.push({
                        id: file.originalname,
                        url: '',
                        valid: false,
                        error: 'Tipo de archivo inválido'
                    });
                } else {
                    results.push({
                        id: file.filename,
                        url: getPublicUrl(file.path),
                        valid: true
                    });
                }
            }

            const validCount = results.filter(r => r.valid).length;

            res.status(201).json({
                success: validCount > 0,
                uploaded: validCount,
                total: files.length,
                results
            });

        } catch (error) {
            appLogger.error({ error, context: 'upload' }, 'Multi-upload processing error');
            next(error);
        }
    }
);

/**
 * DELETE /api/uploads/:id
 * Delete an uploaded file
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { clientId, campaignId } = req.query;

        // Build path (with validation to prevent path traversal)
        const safePath = id.replace(/[^a-zA-Z0-9._-]/g, '');
        const client = (clientId as string || 'anonymous').replace(/[^a-zA-Z0-9._-]/g, '');
        const campaign = (campaignId as string || 'general').replace(/[^a-zA-Z0-9._-]/g, '');

        const filePath = path.join(UPLOAD_DIR, client, campaign, safePath);

        // Ensure the path is within UPLOAD_DIR (prevent traversal)
        if (!filePath.startsWith(UPLOAD_DIR)) {
            res.status(400).json({
                success: false,
                error: 'Ruta inválida'
            });
            return;
        }

        await fs.unlink(filePath);

        res.json({
            success: true,
            message: 'Archivo eliminado'
        });

    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            res.status(404).json({
                success: false,
                error: 'Archivo no encontrado'
            });
            return;
        }
        next(error);
    }
});

export default router;
