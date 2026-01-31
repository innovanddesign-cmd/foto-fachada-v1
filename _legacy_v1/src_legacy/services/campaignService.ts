/**
 * Campaign Service
 * =================
 * CRUD operations for campaigns with optimistic updates
 */

import type { Project } from '../types';

const STORAGE_KEY = 'foto_fachada_campaigns';

// ─────────────────────────────────────────────────────────────
// LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────────────────────

function getCampaigns(): Project[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveCampaigns(campaigns: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

// ─────────────────────────────────────────────────────────────
// CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────

export async function fetchCampaigns(): Promise<Project[]> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 100));
    return getCampaigns();
}

export async function createCampaign(data: Partial<Project>): Promise<Project> {
    const campaigns = getCampaigns();

    const newCampaign: Project = {
        id: `campaign_${Date.now()}`,
        name: data.name || 'Nueva Campaña',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        ...data
    } as Project;

    campaigns.unshift(newCampaign);
    saveCampaigns(campaigns);

    return newCampaign;
}

export async function updateCampaign(id: string, data: Partial<Project>): Promise<Project | null> {
    const campaigns = getCampaigns();
    const index = campaigns.findIndex(c => c.id === id);

    if (index === -1) return null;

    campaigns[index] = {
        ...campaigns[index],
        ...data,
        updatedAt: new Date()
    };

    saveCampaigns(campaigns);
    return campaigns[index];
}

export async function deleteCampaign(id: string): Promise<boolean> {
    const campaigns = getCampaigns();
    const filtered = campaigns.filter(c => c.id !== id);

    if (filtered.length === campaigns.length) return false;

    saveCampaigns(filtered);
    return true;
}

export async function getCampaign(id: string): Promise<Project | null> {
    const campaigns = getCampaigns();
    return campaigns.find(c => c.id === id) || null;
}

// ─────────────────────────────────────────────────────────────
// BACKEND API OPERATIONS
// ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface BackendCampaign {
    id: string;
    client_id: string;
    brand_analysis_id?: string;
    name: string;
    description?: string;
    thumbnail_url?: string;
    status: 'active' | 'draft' | 'archived' | 'paused';
    deploy_status: 'pending' | 'deployed' | 'failed';
    created_at: string;
    updated_at: string;
    business_name?: string;
    business_type?: string;
    landing_count?: number;
}

export async function fetchCampaignsFromBackend(): Promise<BackendCampaign[]> {
    try {
        const response = await fetch(`${API_URL}/api/campaigns`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch campaigns');
        }

        const data = await response.json();
        return data.campaigns || [];
    } catch (error) {
        console.error('[CampaignService] Error fetching:', error);
        // Fallback to localStorage
        return getCampaigns() as unknown as BackendCampaign[];
    }
}

export async function createCampaignInBackend(campaignData: {
    name: string;
    description?: string;
    thumbnail_url?: string;
    brand_analysis_id?: string;
}): Promise<{ campaign: BackendCampaign; redirectTo: string } | null> {
    try {
        const response = await fetch(`${API_URL}/api/campaigns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(campaignData)
        });

        if (!response.ok) {
            throw new Error('Failed to create campaign');
        }

        return await response.json();
    } catch (error) {
        console.error('[CampaignService] Error creating:', error);
        return null;
    }
}

export async function deleteCampaignFromBackend(id: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        return response.ok;
    } catch (error) {
        console.error('[CampaignService] Error deleting:', error);
        return false;
    }
}

export async function duplicateCampaignFromBackend(id: string): Promise<BackendCampaign | null> {
    try {
        const response = await fetch(`${API_URL}/api/campaigns/${id}/duplicate`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to duplicate campaign');
        }

        const data = await response.json();
        return data.campaign;
    } catch (error) {
        console.error('[CampaignService] Error duplicating:', error);
        return null;
    }
}

export async function updateCampaignInBackend(
    id: string,
    updates: Partial<{ name: string; description: string; status: string; thumbnail_url: string }>
): Promise<BackendCampaign | null> {
    try {
        const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            throw new Error('Failed to update campaign');
        }

        const data = await response.json();
        return data.campaign;
    } catch (error) {
        console.error('[CampaignService] Error updating:', error);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// METRICS (Mock - connect to PostgreSQL in production)
// ─────────────────────────────────────────────────────────────


export interface CampaignMetrics {
    visits: number;
    scans: number;
    clicks: number;
    conversions: number;
}

export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    // TODO: Connect to PostgreSQL
    // For now, return mock data or zeros

    const storedMetrics = localStorage.getItem(`metrics_${campaignId}`);
    if (storedMetrics) {
        return JSON.parse(storedMetrics);
    }

    // Return zeros for new campaigns
    return {
        visits: 0,
        scans: 0,
        clicks: 0,
        conversions: 0
    };
}

export async function getDashboardMetrics(): Promise<{
    totalVisits: number;
    totalScans: number;
    totalClicks: number;
    activeCampaigns: number;
}> {
    const campaigns = getCampaigns();
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    // Aggregate metrics
    let totalVisits = 0;
    let totalScans = 0;
    let totalClicks = 0;

    for (const campaign of campaigns) {
        const metrics = await getCampaignMetrics(campaign.id);
        totalVisits += metrics.visits;
        totalScans += metrics.scans;
        totalClicks += metrics.clicks;
    }

    return {
        totalVisits,
        totalScans,
        totalClicks,
        activeCampaigns
    };
}

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

const JWT_KEY = 'foto_fachada_jwt';
const USER_KEY = 'foto_fachada_user';

export function getAuthToken(): string | null {
    return localStorage.getItem(JWT_KEY);
}

export function setAuthToken(token: string): void {
    localStorage.setItem(JWT_KEY, token);
}

export function clearAuth(): void {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear any other session data
    sessionStorage.clear();
}

export function isAuthenticated(): boolean {
    const token = getAuthToken();
    if (!token) return false;

    // Basic JWT expiry check
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function logout(): void {
    clearAuth();
    // Redirect to login
    window.location.href = '/login';
}
