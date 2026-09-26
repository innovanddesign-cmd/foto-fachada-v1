/**
 * Mapping local -> remoto por propietario (persistente e idempotente).
 *
 * Los ids locales de campaña no son UUID (ej: "camp_1712345678"), pero la tabla
 * remota exige UUID. Se guarda una correspondencia localId -> remoteId en
 * localStorage, namespaced por propietario, para que:
 *  - la primera migración INSERTe de verdad (sin id local inválido),
 *  - repetir la migración actualice la misma fila (idempotencia),
 *  - dos cuentas en el mismo navegador no compartan mappings.
 */
import type { User } from '@supabase/supabase-js';

const PREFIJO = 'escaparates:mapa-ids:';

export function esUuid(valor: unknown): boolean {
    return typeof valor === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
}

function clave(ownerId: string): string {
    return `${PREFIJO}${ownerId}`;
}

export function leerMapaIds(ownerId: string): Record<string, string> {
    if (typeof localStorage === 'undefined') return {};
    try {
        const bruto = localStorage.getItem(clave(ownerId));
        if (!bruto) return {};
        const parsed = JSON.parse(bruto);
        return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
    } catch {
        return {};
    }
}

export function escribirMapaIds(ownerId: string, mapa: Record<string, string>): void {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(clave(ownerId), JSON.stringify(mapa));
    } catch {
        // Cuota llena o modo privado: el mapping no es crítico para el resto de la app.
    }
}

/** Resuelve el id remoto para un id local, si existe. */
export function resolverIdRemoto(ownerId: string, localId: string | null | undefined): string | null {
    if (!localId) return null;
    const mapa = leerMapaIds(ownerId);
    const remoto = mapa[localId];
    return remoto && esUuid(remoto) ? remoto : null;
}

/** Persiste la correspondencia local -> remoto (solo UUIDs válidos). */
export function registrarIdRemoto(ownerId: string, localId: string | null | undefined, remoteId: string): void {
    if (!localId || !esUuid(remoteId)) return;
    const mapa = leerMapaIds(ownerId);
    if (mapa[localId] === remoteId) return;
    mapa[localId] = remoteId;
    escribirMapaIds(ownerId, mapa);
}

/**
 * Decisión de operación para guardar. Funzione pura para poder testearla.
 * - 'actualizar': hay mapping o el localId ya es un UUID propio existente.
 * - 'insertar': no hay fila remota todavía -> INSERT real.
 */
export type OperacionGuardado = 'actualizar' | 'insertar';

export function decidirOperacion(params: {
    localId: string | null | undefined;
    remoteIdResuelto: string | null;
    existeFilaPropiaConEseUuid: boolean;
}): OperacionGuardado {
    if (params.remoteIdResuelto) return 'actualizar';
    if (params.localId && esUuid(params.localId) && params.existeFilaPropiaConEseUuid) return 'actualizar';
    return 'insertar';
}

/** Borra mappings de un propietario (usado al cerrar sesión en este dispositivo). */
export function limpiarMapaIds(ownerId: string): void {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.removeItem(clave(ownerId));
    } catch {
        // ignorar
    }
}

export function esPropietario(user: User | null | undefined): user is User {
    return !!user && typeof user.id === 'string' && esUuid(user.id);
}
