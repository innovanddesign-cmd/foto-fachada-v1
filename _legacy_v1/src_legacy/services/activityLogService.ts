/**
 * Activity Log Service
 * =====================
 * Tracks user actions for the activity feed
 */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ActivityLogEntry {
    id: string;
    type: 'campaign' | 'landing' | 'poster' | 'account' | 'billing' | 'support';
    action: string;
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'foto_fachada_activity_log';
const MAX_ENTRIES = 50;

function getStoredLogs(): ActivityLogEntry[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data).map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
        }));
    } catch {
        return [];
    }
}

function saveLogs(logs: ActivityLogEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_ENTRIES)));
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

/**
 * Log a new activity
 */
export function logActivity(
    type: ActivityLogEntry['type'],
    action: string,
    description: string,
    metadata?: Record<string, any>
): void {
    const logs = getStoredLogs();

    const newEntry: ActivityLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        type,
        action,
        description,
        timestamp: new Date(),
        metadata
    };

    logs.unshift(newEntry);
    saveLogs(logs);
}

/**
 * Get recent activity logs
 */
export function getActivityLogs(limit: number = 20): ActivityLogEntry[] {
    return getStoredLogs().slice(0, limit);
}

/**
 * Clear all activity logs
 */
export function clearActivityLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// ─────────────────────────────────────────────────────────────
// HELPER LOGGERS
// ─────────────────────────────────────────────────────────────

export const activity = {
    campaignCreated: (name: string) =>
        logActivity('campaign', 'create', `Creaste la campaña "${name}"`),

    campaignDeleted: (name: string) =>
        logActivity('campaign', 'delete', `Eliminaste la campaña "${name}"`),

    campaignDuplicated: (name: string) =>
        logActivity('campaign', 'duplicate', `Duplicaste la campaña "${name}"`),

    landingGenerated: (name: string) =>
        logActivity('landing', 'generate', `Generaste una landing para "${name}"`),

    posterGenerated: (name: string) =>
        logActivity('poster', 'generate', `Generaste un cartel para "${name}"`),

    posterDownloaded: (name: string) =>
        logActivity('poster', 'download', `Descargaste el cartel de "${name}"`),

    profileUpdated: () =>
        logActivity('account', 'update', 'Actualizaste tu perfil de negocio'),

    passwordChanged: () =>
        logActivity('account', 'security', 'Cambiaste tu contraseña'),

    planUpgraded: (plan: string) =>
        logActivity('billing', 'upgrade', `Mejoraste tu plan a ${plan}`),

    planDowngraded: (plan: string) =>
        logActivity('billing', 'downgrade', `Cambiaste tu plan a ${plan}`),

    supportContacted: () =>
        logActivity('support', 'contact', 'Contactaste con soporte')
};

// ─────────────────────────────────────────────────────────────
// TIME FORMATTING
// ─────────────────────────────────────────────────────────────

export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });
}
