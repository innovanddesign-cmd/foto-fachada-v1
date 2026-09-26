/**
 * ExportadorPDF.ts
 * Motor de exportación profesional para cartelería física y digital.
 */

import html2canvas from 'html2canvas';

export type ExportFormat = 'PDF' | 'PNG' | 'JPG';

interface ExportConfig {
    formato: ExportFormat;
    nombreArchivo: string;
    escala?: number; // Default 3 for 300 DPI
    anadirMarcasCorte?: boolean;
}

/**
 * Captura un elemento HTML y lo exporta con alta fidelidad.
 */
export const exportarCartel = async (elementId: string, config: ExportConfig) => {
    const elemento = document.getElementById(elementId);
    if (!elemento) {
        throw new Error('No se encuentra el cartel que quieres exportar.');
    }

    // Open during the user's click, before canvas rendering yields to the browser.
    const ventana = config.formato === 'PDF' ? window.open('', '_blank') : null;
    if (config.formato === 'PDF' && !ventana) {
        throw new Error('Permite ventanas emergentes para imprimir o guardar el PDF.');
    }

    try {
        console.log(`[Exportador] Iniciando captura de alta fidelidad: ${config.formato}`);

        const canvas = await html2canvas(elemento, {
            scale: config.escala || 3, // Forzar alta resolución
            useCORS: true,
            backgroundColor: null,
            logging: false,
            onclone: (doc) => {
                // Manipulación del DOM clonado antes de la captura (ej: marcas de corte)
                if (config.anadirMarcasCorte) {
                    const cloned = doc.getElementById(elementId);
                    if (cloned) {
                        cloned.style.border = "1px solid rgba(0,0,0,0.1)"; // Simulación de sangrado
                    }
                }
            }
        });

        const dataUrl = canvas.toDataURL(`image/${config.formato === 'JPG' ? 'jpeg' : 'png'}`, 1.0);

        if (config.formato === 'PDF') {
            // Nota: Integración con jsPDF se realizaría aquí. 
            // Como fallback profesional, abrimos el diálogo de impresión con el canvas.
            imprimirCanvas(dataUrl, config.nombreArchivo, ventana!);
        } else {
            const link = document.createElement('a');
            link.download = `${config.nombreArchivo}.${config.formato.toLowerCase()}`;
            link.href = dataUrl;
            link.click();
        }

        return dataUrl;
    } catch (err) {
        ventana?.close();
        console.error("[Exportador] Error fatal en la generación:", err);
        throw err;
    }
};

/**
 * Fallback de impresión profesional.
 * Abre ventana antes de operación asíncrona para evitar popup blocker.
 */
const imprimirCanvas = (dataUrl: string, titulo: string, win: Window) => {
    const tituloSeguro = titulo.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

    win.document.write(`
        <html>
            <head>
                <title>Imprimir - ${tituloSeguro}</title>
                <style>
                    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #333; }
                    img { max-width: 100%; height: auto; box-shadow: 0 0 50px rgba(0,0,0,0.5); }
                    @media print {
                        body { background: white; }
                        img { box-shadow: none; width: 100%; }
                    }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <img src="${dataUrl}" />
            </body>
        </html>
    `);
    win.document.close();
};

/**
 * Genera el "Marketing Pack" (Fase 4 Bloque 1B)
 */
export const generarPackMarketing = async (elementId: string, nombreNegocio: string) => {
    console.log("[Exportador] Generando Pack de Marketing Multiformato...");

    // 1. Exportamos los formatos principales
    const a4 = await exportarCartel(elementId, { formato: 'PNG', nombreArchivo: `${nombreNegocio}_A4_Print` });

    // Idealmente usaríamos JSZip para empaquetar, pero como fallback
    // permitiremos descargas secuenciales o informaremos al UI.
    return { a4 };
};
