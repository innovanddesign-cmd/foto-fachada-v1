/**
 * Servicio de Persistencia Avanzada
 * IndexedDB con fallback a sessionStorage
 * 
 * Permite recuperar el estado del escaparate en caso de:
 * - Refresh accidental
 * - Pérdida de conexión
 * - Cierre del navegador
 */

import type { EscaparateState } from '../store/escaparateStore';

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const DB_NAME = 'escaparate-db';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const AUTOSAVE_INTERVAL_MS = 5000;

// ─────────────────────────────────────────────────────────────
// INDEXEDDB HELPERS
// ─────────────────────────────────────────────────────────────

let db: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.warn('[Persistence] IndexedDB no disponible, usando sessionStorage');
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
                store.createIndex('lastSaved', 'lastSaved', { unique: false });
            }
        };
    });
}

// ─────────────────────────────────────────────────────────────
// SESSION DATA INTERFACE
// ─────────────────────────────────────────────────────────────

export interface PersistedSession {
    sessionId: string;
    currentState: EscaparateState;
    stateHistory: string[];
    lastSaved: Date;
    version: number;
}

// ─────────────────────────────────────────────────────────────
// CORE FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Guarda el estado actual en IndexedDB
 */
export async function persistSession(
    sessionId: string,
    state: EscaparateState,
    stateHistory: string[]
): Promise<boolean> {
    const session: PersistedSession = {
        sessionId,
        currentState: state,
        stateHistory,
        lastSaved: new Date(),
        version: 1
    };

    try {
        const database = await openDB();

        return new Promise((resolve) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(session);

            request.onsuccess = () => {
                console.log('[Persistence] Sesión guardada:', sessionId);
                resolve(true);
            };

            request.onerror = () => {
                console.error('[Persistence] Error guardando sesión');
                // Fallback a sessionStorage
                try {
                    sessionStorage.setItem(`escaparate-${sessionId}`, JSON.stringify(session));
                    resolve(true);
                } catch {
                    resolve(false);
                }
            };
        });
    } catch {
        // IndexedDB no disponible, usar sessionStorage
        try {
            sessionStorage.setItem(`escaparate-${sessionId}`, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Recupera una sesión guardada
 */
export async function recoverSession(sessionId: string): Promise<PersistedSession | null> {
    try {
        const database = await openDB();

        return new Promise((resolve) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(sessionId);

            request.onsuccess = () => {
                const result = request.result as PersistedSession | undefined;
                if (result) {
                    console.log('[Persistence] Sesión recuperada:', sessionId);
                    resolve(result);
                } else {
                    // Intentar sessionStorage
                    const fallback = sessionStorage.getItem(`escaparate-${sessionId}`);
                    if (fallback) {
                        resolve(JSON.parse(fallback));
                    } else {
                        resolve(null);
                    }
                }
            };

            request.onerror = () => {
                // Fallback a sessionStorage
                const fallback = sessionStorage.getItem(`escaparate-${sessionId}`);
                if (fallback) {
                    resolve(JSON.parse(fallback));
                } else {
                    resolve(null);
                }
            };
        });
    } catch {
        // Fallback a sessionStorage
        const fallback = sessionStorage.getItem(`escaparate-${sessionId}`);
        if (fallback) {
            return JSON.parse(fallback);
        }
        return null;
    }
}

/**
 * Obtiene la sesión más reciente
 */
export async function getLatestSession(): Promise<PersistedSession | null> {
    try {
        const database = await openDB();

        return new Promise((resolve) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('lastSaved');
            const request = index.openCursor(null, 'prev'); // Más reciente primero

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    resolve(cursor.value as PersistedSession);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
}

/**
 * Limpia la sesión actual
 */
export async function clearSession(sessionId: string): Promise<void> {
    try {
        const database = await openDB();

        return new Promise((resolve) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            store.delete(sessionId);

            transaction.oncomplete = () => {
                console.log('[Persistence] Sesión eliminada:', sessionId);
                resolve();
            };

            transaction.onerror = () => {
                sessionStorage.removeItem(`escaparate-${sessionId}`);
                resolve();
            };
        });
    } catch {
        sessionStorage.removeItem(`escaparate-${sessionId}`);
    }
}

/**
 * Limpia todas las sesiones antiguas (más de 24h)
 */
export async function cleanOldSessions(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    try {
        const database = await openDB();

        return new Promise((resolve) => {
            const transaction = database.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('lastSaved');
            const range = IDBKeyRange.upperBound(oneDayAgo);
            const request = index.openCursor(range);

            request.onsuccess = () => {
                const cursor = request.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => {
                console.log(`[Persistence] ${deletedCount} sesiones antiguas eliminadas`);
                resolve(deletedCount);
            };

            transaction.onerror = () => resolve(0);
        });
    } catch {
        return 0;
    }
}

// ─────────────────────────────────────────────────────────────
// AUTO-SAVE HOOK
// ─────────────────────────────────────────────────────────────

let autoSaveInterval: NodeJS.Timeout | null = null;

/**
 * Inicia el auto-guardado cada 5 segundos si hay cambios
 */
export function startAutoSave(
    getState: () => { sessionId: string; currentState: EscaparateState; stateHistory: string[]; isDirty: boolean },
    onSaved: () => void
): void {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
    }

    autoSaveInterval = setInterval(async () => {
        const state = getState();

        if (state.isDirty) {
            const success = await persistSession(state.sessionId, state.currentState, state.stateHistory);
            if (success) {
                onSaved();
            }
        }
    }, AUTOSAVE_INTERVAL_MS);

    console.log('[Persistence] Auto-guardado iniciado');
}

/**
 * Detiene el auto-guardado
 */
export function stopAutoSave(): void {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('[Persistence] Auto-guardado detenido');
    }
}

// ─────────────────────────────────────────────────────────────
// RECOVERY CHECK
// ─────────────────────────────────────────────────────────────

/**
 * Comprueba si hay una sesión que recuperar al cargar la app
 */
export async function checkForRecoverableSession(): Promise<{
    hasSession: boolean;
    session: PersistedSession | null;
    isRecent: boolean;
}> {
    const session = await getLatestSession();

    if (!session) {
        return { hasSession: false, session: null, isRecent: false };
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isRecent = new Date(session.lastSaved) > fiveMinutesAgo;

    // Solo recuperar si está en un estado recuperable
    const recoverableSteps = ['SHOWCASE', 'POSTER_VALIDATION', 'ADAPTIVE_CONFIG'];
    const isRecoverable = recoverableSteps.includes(session.currentState.step);

    return {
        hasSession: isRecoverable,
        session: isRecoverable ? session : null,
        isRecent
    };
}
