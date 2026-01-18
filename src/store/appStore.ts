import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type {
    BrandData,
    MarketingStrategy,
    LandingLink,
    LandingConfig,
    LandingPageConfig,
    Project,
    FlowStep,
    SubscriptionTier,
} from '../types';
import { LANDING_THEMES } from '../data/themes';

interface UserSession {
    id: string;
    email?: string;
}

interface AppState {
    // Auth
    user: UserSession | null;
    setUser: (user: UserSession | null) => void;
    signInWithOtp: (email: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;

    // Current flow state
    currentView: string;
    setCurrentView: (view: string) => void;
    currentStep: FlowStep;
    setCurrentStep: (step: FlowStep) => void;

    // Media upload
    uploadedMedia: { type: 'image' | 'video'; url: string; thumbnail?: string }[];
    setUploadedMedia: (media: { type: 'image' | 'video'; url: string; thumbnail?: string }[]) => void;
    addUploadedMedia: (item: { type: 'image' | 'video'; url: string; thumbnail?: string }) => void;
    removeUploadedMedia: (index: number) => void;

    // Brand analysis
    brandData: BrandData | null;
    setBrandData: (data: BrandData | null) => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (analyzing: boolean) => void;

    // Marketing strategies
    strategies: MarketingStrategy[];
    setStrategies: (strategies: MarketingStrategy[]) => void;
    isGeneratingStrategies: boolean;
    setIsGeneratingStrategies: (generating: boolean) => void;

    // Landing links
    links: LandingLink[];
    setLinks: (links: LandingLink[]) => void;
    regenerateLink: (linkId: string, newLink: LandingLink) => void;
    isGeneratingLinks: boolean;
    setIsGeneratingLinks: (generating: boolean) => void;

    // Landing design (AI-generated)
    landingConfig: LandingPageConfig;
    setLandingConfig: (config: LandingPageConfig) => void;
    generatedBackgroundImage: string | null;
    setGeneratedBackgroundImage: (image: string | null) => void;
    isGeneratingDesign: boolean;
    setIsGeneratingDesign: (generating: boolean) => void;
    selectedTemplate: string;
    setSelectedTemplate: (template: string) => void;

    // Poster design (AI-generated)
    posterConfig: any | null; // Will be PosterConfig from posterGenerator
    setPosterConfig: (config: any) => void;
    isGeneratingPoster: boolean;
    setIsGeneratingPoster: (generating: boolean) => void;

    // Widget Engine
    selectedStrategy: MarketingStrategy | null;
    setSelectedStrategy: (strategy: MarketingStrategy | null) => void;
    widgetConfig: Record<string, any>;
    setWidgetConfig: (config: Record<string, any>) => void;

    // Projects
    projects: Project[];
    setProjects: (projects: Project[]) => void;
    currentProject: Project | null;
    addProject: (project: Project) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    setCurrentProject: (project: Project | null) => void;
    addLandingToProject: (projectId: string, landing: LandingConfig) => Promise<void>;
    fetchProjects: () => Promise<void>;

    // User tier
    userTier: SubscriptionTier;
    setUserTier: (tier: SubscriptionTier) => void;

    // Widget auto-generation
    autoGenerateWidgets: (campaignId: string) => Promise<any>;
    saveLanding: () => LandingConfig | null;

    // Reset flow
    resetFlow: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Auth
            user: null,
            setUser: (user) => set({ user }),
            signInWithOtp: async (email) => {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: window.location.origin,
                    },
                });
                return { error };
            },
            signOut: async () => {
                await supabase.auth.signOut();
                set({ user: null, projects: [], currentProject: null });
            },

            // Current flow state
            currentView: 'home',
            setCurrentView: (view) => set({ currentView: view }),
            currentStep: 'upload',
            setCurrentStep: (step) => set({ currentStep: step }),

            // Media upload
            uploadedMedia: [],
            setUploadedMedia: (media) => set({ uploadedMedia: media }),
            addUploadedMedia: (item) => set((state) => ({ uploadedMedia: [...state.uploadedMedia, item] })),
            removeUploadedMedia: (index) => set((state) => ({
                uploadedMedia: state.uploadedMedia.filter((_, i) => i !== index)
            })),

            // Brand analysis  
            brandData: null,
            setBrandData: (data) => set({ brandData: data }),
            isAnalyzing: false,
            setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),

            // Marketing strategies
            strategies: [],
            setStrategies: (strategies) => set({ strategies }),
            isGeneratingStrategies: false,
            setIsGeneratingStrategies: (generating) => set({ isGeneratingStrategies: generating }),

            // Landing links
            links: [],
            setLinks: (links) => set({ links }),
            regenerateLink: (linkId, newLink) => set((state) => ({
                links: state.links.map(link =>
                    link.id === linkId ? { ...newLink, regenerateCount: link.regenerateCount + 1 } : link
                )
            })),
            isGeneratingLinks: false,
            setIsGeneratingLinks: (generating) => set({ isGeneratingLinks: generating }),

            // Landing design (AI-generated)
            landingConfig: LANDING_THEMES['modern'], // Default fallback
            setLandingConfig: (config) => set({ landingConfig: config }),
            generatedBackgroundImage: null,
            setGeneratedBackgroundImage: (image) => set({ generatedBackgroundImage: image }),
            isGeneratingDesign: false,
            setIsGeneratingDesign: (generating) => set({ isGeneratingDesign: generating }),
            selectedTemplate: 'modern',
            setSelectedTemplate: (template) => set({ selectedTemplate: template }),

            // Poster design (AI-generated)
            posterConfig: null,
            setPosterConfig: (config) => set({ posterConfig: config }),
            isGeneratingPoster: false,
            setIsGeneratingPoster: (generating) => set({ isGeneratingPoster: generating }),



            // Widget Engine (New)
            selectedStrategy: null,
            setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),
            widgetConfig: {},
            setWidgetConfig: (config) => set({ widgetConfig: config }),

            // Save current landing configuration
            saveLanding: (): LandingConfig | null => {
                const state = get();
                if (!state.brandData) return null;

                const landing: LandingConfig = {
                    id: Date.now().toString(),
                    name: `${state.brandData.name} Landing`,
                    brand: state.brandData,
                    links: state.links,
                    presetId: state.selectedTemplate, // Corrected from currentTemplate
                    config: state.landingConfig,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                return landing;
            },

            // Auto-generate widgets for current campaign
            autoGenerateWidgets: async (campaignId: string) => {
                console.log('[AppStore] Starting auto-generation for campaign:', campaignId);

                try {
                    // Import service dynamically
                    const { autoGenerateWidgets } = await import('../services/widgetGenerationService');

                    // Call backend to generate widgets
                    const result = await autoGenerateWidgets(campaignId);

                    console.log('[AppStore] ✅ Widgets generated:', result.widgets);

                    // Update links with generated URLs
                    const currentLinks = get().links;
                    const updatedLinks = currentLinks.map((link, index) => {
                        const widget = result.widgets[index];
                        if (widget) {
                            return {
                                ...link,
                                url: widget.url,
                                id: widget.id
                            };
                        }
                        return link;
                    });

                    set({ links: updatedLinks });

                    return result;
                } catch (error) {
                    console.error('[AppStore] Error auto-generating widgets:', error);
                    throw error;
                }
            },

            // Projects
            projects: [],
            setProjects: (projects) => set({ projects }),
            currentProject: null,
            fetchProjects: async () => {
                const { user } = get();
                if (!user) return;

                const { data, error } = await supabase
                    .from('projects')
                    .select('*, landings(*)')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    set({ projects: data as Project[] });
                }
            },
            addProject: async (project) => {
                const { user } = get();

                // Local Optimistic Update
                set((state) => ({
                    projects: [project, ...state.projects],
                    currentProject: project
                }));

                // Sync to DB if logged in
                if (user) {
                    const { error } = await supabase.from('projects').insert({
                        id: project.id,
                        user_id: user.id,
                        name: project.name,
                        description: project.description,
                        campaign: project.campaign,
                        created_at: project.createdAt
                    });

                    if (error) {
                        console.error('Error saving project:', error);
                        // Optional: Rollback state or show toast
                    }
                }
            },
            deleteProject: async (projectId) => {
                const { user } = get();

                // Local Optimistic Update
                set((state) => ({
                    projects: state.projects.filter(p => p.id !== projectId),
                    currentProject: state.currentProject?.id === projectId ? null : state.currentProject
                }));

                if (user) {
                    const { error } = await supabase
                        .from('projects')
                        .delete()
                        .eq('id', projectId);

                    if (error) {
                        console.error('Error deleting project:', error);
                    }
                }
            },
            setCurrentProject: (project) => set({ currentProject: project }),
            addLandingToProject: async (projectId, landing) => {
                // Local Optimistic Update
                set((state) => ({
                    projects: state.projects.map(project =>
                        project.id === projectId
                            ? { ...project, landings: [...project.landings, landing], updatedAt: new Date() }
                            : project
                    )
                }));

                const { user } = get();
                if (user) {
                    // Insert Landing
                    const { error: landingError } = await supabase.from('landings').insert({
                        id: landing.id,
                        project_id: projectId,
                        user_id: user.id,
                        name: landing.name,
                        brand_data: landing.brand,
                        landing_config: landing.config || {},
                        created_at: landing.createdAt
                    });

                    if (landingError) {
                        console.error('Error saving landing:', landingError);
                        return;
                    }

                    // Insert Links
                    if (landing.links.length > 0) {
                        const linksToInsert = landing.links.map(link => ({
                            id: link.id,
                            landing_id: landing.id,
                            name: link.name,
                            description: link.description,
                            type: link.type,
                            emoji: link.emoji,
                            engagement: link.engagement,
                            conversion: link.conversion,
                            is_premium: link.isPremium,
                            regenerate_count: link.regenerateCount,
                            created_at: new Date()
                        }));

                        const { error: linksError } = await supabase.from('landing_links').insert(linksToInsert);
                        if (linksError) console.error('Error saving links:', linksError);
                    }
                }
            },

            // User tier
            userTier: 'pro', // Changed to 'pro' for development - unlocks all premium themes
            setUserTier: (tier) => set({ userTier: tier }),

            // Reset flow
            resetFlow: () => set({
                currentStep: 'upload',
                uploadedMedia: [],
                brandData: null,
                strategies: [],
                selectedStrategy: null,
                widgetConfig: {},
                links: [],
                landingConfig: LANDING_THEMES['modern'],
                generatedBackgroundImage: null,
                isAnalyzing: false,
                isGeneratingStrategies: false,
                isGeneratingLinks: false,
                isGeneratingDesign: false,
                selectedTemplate: 'modern'
            })
        }),
        {
            name: 'foto-fachada-storage',
            partialize: (state) => ({
                projects: state.projects, // We still persist locally for offline/anon support
                // userTier: state.userTier, // Commented out to force defaults (Pro)
                user: state.user // Persist session
            })
        }
    )
);
