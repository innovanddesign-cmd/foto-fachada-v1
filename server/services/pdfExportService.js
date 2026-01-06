/**
 * PDF Export Service (Puppeteer)
 * ===============================
 * Renders HTML to high-quality A4 PDF at 300 DPI
 * Features:
 * - High-res image loading with wait
 * - File management in /posters/{client_id}/
 * - Automatic seller notification
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import { appLogger } from './logger.js';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

// A4 at 300 DPI (in pixels)
const A4_WIDTH_PX = 2480;  // 210mm at 300 DPI
const A4_HEIGHT_PX = 3508; // 297mm at 300 DPI

// Posters storage directory
const POSTERS_DIR = process.env.POSTERS_DIR || './posters';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} PdfExportConfig
 * @property {string} html - Complete HTML content to render
 * @property {string} clientId - Client identifier for folder structure
 * @property {string} filename - Output filename (without extension)
 * @property {string} [sellerEmail] - Email for notification
 * @property {string} [sellerPhone] - WhatsApp for notification
 */

/**
 * @typedef {Object} PdfExportResult
 * @property {string} filePath - Absolute path to generated PDF
 * @property {string} relativePath - Path relative to posters dir
 * @property {number} fileSize - Size in bytes
 * @property {boolean} notificationSent - Whether seller was notified
 */

// ─────────────────────────────────────────────────────────────
// BROWSER POOL (Singleton)
// ─────────────────────────────────────────────────────────────

let browserInstance = null;

/**
 * Get or create browser instance
 * @returns {Promise<puppeteer.Browser>}
 */
async function getBrowser() {
    if (!browserInstance) {
        appLogger.info('[PdfExport] Launching Puppeteer browser...');
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        // Handle browser disconnect
        browserInstance.on('disconnected', () => {
            appLogger.warn('[PdfExport] Browser disconnected');
            browserInstance = null;
        });
    }
    return browserInstance;
}

/**
 * Close browser (for graceful shutdown)
 */
export async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
        appLogger.info('[PdfExport] Browser closed');
    }
}

// ─────────────────────────────────────────────────────────────
// FILE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/**
 * Ensure client poster directory exists
 * @param {string} clientId 
 * @returns {Promise<string>} Directory path
 */
async function ensureClientDir(clientId) {
    const sanitizedId = clientId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const clientDir = path.join(POSTERS_DIR, sanitizedId);

    await fs.mkdir(clientDir, { recursive: true });

    return clientDir;
}

/**
 * Generate unique filename with timestamp
 * @param {string} baseName 
 * @returns {string}
 */
function generateFilename(baseName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${sanitized}_${timestamp}.pdf`;
}

// ─────────────────────────────────────────────────────────────
// HTML ENHANCEMENT FOR HIGH-RES PRINTING
// ─────────────────────────────────────────────────────────────

/**
 * Enhance HTML for print-quality rendering
 * @param {string} html 
 * @returns {string}
 */
function enhanceHtmlForPrint(html) {
    // Add print-specific styles
    const printStyles = `
    <style id="puppeteer-print-styles">
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body {
                margin: 0 !important;
                padding: 0 !important;
            }
        }
        
        /* Force high-res image loading */
        img {
            image-rendering: high-quality;
            image-rendering: -webkit-optimize-contrast;
        }
        
        /* Ensure backgrounds print */
        * {
            -webkit-print-color-adjust: exact !important;
        }
    </style>
    `;

    // Insert before </head>
    if (html.includes('</head>')) {
        return html.replace('</head>', `${printStyles}</head>`);
    }

    // Fallback: wrap in basic HTML structure
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${printStyles}
</head>
<body>${html}</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// MAIN PDF EXPORT
// ─────────────────────────────────────────────────────────────

/**
 * Export HTML to high-quality PDF
 * @param {PdfExportConfig} config 
 * @returns {Promise<PdfExportResult>}
 */
export async function exportToPdf(config) {
    const { html, clientId, filename, sellerEmail, sellerPhone } = config;

    const startTime = Date.now();
    appLogger.info({ clientId, filename }, '[PdfExport] Starting PDF generation');

    let page = null;

    try {
        // Ensure output directory
        const clientDir = await ensureClientDir(clientId);
        const outputFilename = generateFilename(filename);
        const outputPath = path.join(clientDir, outputFilename);

        // Get browser and create page
        const browser = await getBrowser();
        page = await browser.newPage();

        // Set viewport for high-resolution capture
        await page.setViewport({
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            deviceScaleFactor: 1 // Already at 300 DPI equivalent
        });

        // Enhance HTML for printing
        const enhancedHtml = enhanceHtmlForPrint(html);

        // Load HTML content
        await page.setContent(enhancedHtml, {
            waitUntil: 'networkidle0', // Wait for all images to load
            timeout: 30000
        });

        // Wait for fonts and images to fully load
        await page.evaluate(() => {
            return new Promise((resolve) => {
                // Wait for all images
                const images = Array.from(document.querySelectorAll('img'));
                if (images.length === 0) {
                    resolve();
                    return;
                }

                let loaded = 0;
                const checkLoaded = () => {
                    loaded++;
                    if (loaded >= images.length) resolve();
                };

                images.forEach(img => {
                    if (img.complete) {
                        checkLoaded();
                    } else {
                        img.addEventListener('load', checkLoaded);
                        img.addEventListener('error', checkLoaded);
                    }
                });

                // Timeout fallback
                setTimeout(resolve, 5000);
            });
        });

        // Wait for fonts
        await page.evaluate(() => document.fonts?.ready);

        // Small delay for any CSS transitions
        await new Promise(r => setTimeout(r, 500));

        // Generate PDF
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            scale: 1
        });

        // Get file stats
        const stats = await fs.stat(outputPath);

        const duration = Date.now() - startTime;
        appLogger.info({
            clientId,
            outputPath,
            fileSize: stats.size,
            duration
        }, '[PdfExport] PDF generated successfully');

        // Send notification
        let notificationSent = false;
        if (sellerEmail || sellerPhone) {
            notificationSent = await sendSellerNotification({
                clientId,
                filePath: outputPath,
                sellerEmail,
                sellerPhone
            });
        }

        return {
            filePath: path.resolve(outputPath),
            relativePath: `${clientId}/${outputFilename}`,
            fileSize: stats.size,
            notificationSent
        };

    } catch (error) {
        appLogger.error({ clientId, error: error.message }, '[PdfExport] Failed to generate PDF');
        throw error;

    } finally {
        if (page) {
            await page.close();
        }
    }
}

// ─────────────────────────────────────────────────────────────
// SELLER NOTIFICATION
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NotificationConfig
 * @property {string} clientId
 * @property {string} filePath
 * @property {string} [sellerEmail]
 * @property {string} [sellerPhone]
 */

/**
 * Send notification to seller about ready poster
 * @param {NotificationConfig} config 
 * @returns {Promise<boolean>}
 */
async function sendSellerNotification(config) {
    const { clientId, filePath, sellerEmail, sellerPhone } = config;

    try {
        const message = `🖨️ CARTEL LISTO PARA ENTREGA

📋 Cliente: ${clientId}
📁 Archivo: ${path.basename(filePath)}
⏰ Entrega estimada: 24-48h

Por favor, imprimir y preparar para entrega.`;

        // Log notification (in production, integrate with actual services)
        appLogger.info({
            clientId,
            sellerEmail,
            sellerPhone,
            message
        }, '[PdfExport] Seller notification triggered');

        // TODO: Integrate with actual notification services
        // - Email: Use nodemailer or SendGrid
        // - WhatsApp: Use Twilio or WhatsApp Business API

        // For now, we simulate successful notification
        // In production, replace with actual API calls:

        /*
        if (sellerEmail) {
            await sendEmail({
                to: sellerEmail,
                subject: `Cartel listo: ${clientId}`,
                body: message
            });
        }
        
        if (sellerPhone) {
            await sendWhatsApp({
                to: sellerPhone,
                message: message
            });
        }
        */

        return true;

    } catch (error) {
        appLogger.error({ error: error.message }, '[PdfExport] Failed to send notification');
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// BATCH EXPORT
// ─────────────────────────────────────────────────────────────

/**
 * Export multiple posters in batch
 * @param {PdfExportConfig[]} configs 
 * @returns {Promise<PdfExportResult[]>}
 */
export async function batchExportToPdf(configs) {
    appLogger.info({ count: configs.length }, '[PdfExport] Starting batch export');

    const results = [];

    for (const config of configs) {
        try {
            const result = await exportToPdf(config);
            results.push(result);
        } catch (error) {
            results.push({
                filePath: null,
                relativePath: null,
                fileSize: 0,
                notificationSent: false,
                error: error.message
            });
        }
    }

    return results;
}

// ─────────────────────────────────────────────────────────────
// CLEANUP
// ─────────────────────────────────────────────────────────────

/**
 * Clean up old posters (older than specified days)
 * @param {number} olderThanDays 
 * @returns {Promise<number>} Number of files deleted
 */
export async function cleanupOldPosters(olderThanDays = 30) {
    const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    try {
        const clients = await fs.readdir(POSTERS_DIR);

        for (const clientId of clients) {
            const clientDir = path.join(POSTERS_DIR, clientId);
            const stat = await fs.stat(clientDir);

            if (!stat.isDirectory()) continue;

            const files = await fs.readdir(clientDir);

            for (const file of files) {
                const filePath = path.join(clientDir, file);
                const fileStat = await fs.stat(filePath);

                if (fileStat.mtime.getTime() < cutoffDate) {
                    await fs.unlink(filePath);
                    deletedCount++;
                }
            }

            // Remove empty directories
            const remaining = await fs.readdir(clientDir);
            if (remaining.length === 0) {
                await fs.rmdir(clientDir);
            }
        }

        appLogger.info({ deletedCount }, '[PdfExport] Cleanup completed');

    } catch (error) {
        appLogger.error({ error: error.message }, '[PdfExport] Cleanup failed');
    }

    return deletedCount;
}
