/**
 * Proposal Service
 * ================
 * Client-side service to interact with proposals API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProposalData {
    campaign_id: string;
    strategy_id: string;
    title: string;
    description: string;
    visual_mechanic: string;
    ui_config: Record<string, any>;
    code_template: string;
    status: 'draft' | 'saved' | 'implemented';
}

export async function saveProposal(proposalData: ProposalData) {
    try {
        const response = await fetch(`${API_URL}/api/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('foto_fachada_jwt')}`
            },
            body: JSON.stringify(proposalData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save proposal');
        }

        return await response.json();
    } catch (error) {
        console.error('[ProposalService] Error saving:', error);
        throw error;
    }
}
