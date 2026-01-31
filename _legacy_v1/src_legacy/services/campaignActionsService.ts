/**
 * Campaign Actions Service
 * =========================
 * Duplicate, request changes, preview
 */

import type { Project } from '../types';
import { toast } from '../store/toastStore';
import { activity } from './activityLogService';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface ChangeRequest {
    campaignId: string;
    requestType: 'text' | 'images' | 'prices' | 'other';
    description: string;
    urgency: 'normal' | 'urgent';
}

export interface UserCredits {
    updates: number;
    landings: number;
    posters: number;
}

// ─────────────────────────────────────────────────────────────
// CREDITS MANAGEMENT
// ─────────────────────────────────────────────────────────────

const CREDITS_KEY = 'foto_fachada_credits';

export function getUserCredits(): UserCredits {
    const stored = localStorage.getItem(CREDITS_KEY);
    if (stored) return JSON.parse(stored);

    // Default credits based on plan (would come from backend)
    return {
        updates: 5,
        landings: 10,
        posters: 10
    };
}

export function useCredit(type: keyof UserCredits): boolean {
    const credits = getUserCredits();

    if (credits[type] <= 0) {
        toast.error('Sin créditos', `No tienes créditos de ${type} disponibles`);
        return false;
    }

    credits[type]--;
    localStorage.setItem(CREDITS_KEY, JSON.stringify(credits));
    return true;
}

// ─────────────────────────────────────────────────────────────
// DUPLICATE CAMPAIGN
// ─────────────────────────────────────────────────────────────

export function duplicateCampaign(campaign: Project): Project {
    const newCampaign: Project = {
        ...campaign,
        id: `campaign_${Date.now()}`,
        name: `${campaign.name} (copia)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        landings: campaign.landings.map(landing => ({
            ...landing,
            id: `landing_${Date.now()}_${Math.random().toString(36).slice(2)}`
        }))
    };

    activity.campaignDuplicated(campaign.name);
    toast.success('Campaña duplicada', `"${campaign.name}" ha sido clonada`);

    return newCampaign;
}

// ─────────────────────────────────────────────────────────────
// REQUEST CHANGES
// ─────────────────────────────────────────────────────────────

export async function requestChanges(request: ChangeRequest): Promise<boolean> {
    // Check credits
    if (!useCredit('updates')) {
        return false;
    }

    try {
        // In production, send to backend
        console.log('Change request submitted:', request);

        // Simulate API call
        await new Promise(r => setTimeout(r, 500));

        toast.success(
            'Solicitud enviada',
            'Recibirás los cambios en 24-48 horas'
        );

        return true;
    } catch (error) {
        toast.error('Error', 'No se pudo enviar la solicitud');
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// PREVIEW LANDING
// ─────────────────────────────────────────────────────────────

export function getLandingPreviewUrl(campaignId: string, landingId?: string): string {
    const isDev = import.meta.env.DEV;
    const protocol = isDev ? 'http' : 'https';
    const domain = isDev ? 'localhost:3000' : 'foto-fachada-v1.vercel.app';
    const baseUrl = import.meta.env.VITE_LANDING_BASE_URL || `${protocol}://${domain}`;
    return `${baseUrl}/${campaignId}${landingId ? `/${landingId}` : ''}`;
}
