import { create } from 'zustand';

// Types
export type AppStateStep =
    | 'CAPTURE'
    | 'ANALYSIS'
    | 'SHOWCASE'
    | 'SIGNAGE'
    | 'CONFIG'
    | 'DEPLOY';

export interface BrandDNA {
    palette: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        glass: string;
    };
    typography: 'Geometric Sans' | 'Elegant Serif' | 'Handwritten' | 'Tech Mono';
    vibe: string;
    detectedStructure: 'Menu' | 'Gallery' | 'Offer';
}

export interface StorefrontData {
    heroHeadline: string;
    heroSubline: string;
    layout: 'hero-split' | 'hero-center' | 'gallery-grid';
    offers: { title: string; price: string }[];
}

interface StorefrontStore {
    currentStep: AppStateStep;
    uploadedImage: string | null;
    isAnalyzing: boolean;
    brandDNA: BrandDNA | null;
    storefrontData: StorefrontData | null;

    // Actions
    setStep: (step: AppStateStep) => void;
    setUploadedImage: (image: string) => void;
    startAnalysis: () => void;
    completeAnalysis: (dna: BrandDNA, data: StorefrontData) => void;
    regenerateStorefront: (data: StorefrontData) => void;
    reset: () => void;
}

export const useStorefrontStore = create<StorefrontStore>((set) => ({
    currentStep: 'CAPTURE',
    uploadedImage: null,
    isAnalyzing: false,
    brandDNA: null,
    storefrontData: null,

    setStep: (step) => set({ currentStep: step }),
    setUploadedImage: (image) => set({ uploadedImage: image }),
    startAnalysis: () => set({ isAnalyzing: true, currentStep: 'ANALYSIS' }),
    completeAnalysis: (dna, data) => set({
        isAnalyzing: false,
        brandDNA: dna,
        storefrontData: data,
        currentStep: 'SHOWCASE'
    }),
    regenerateStorefront: (data) => set({ storefrontData: data }),
    reset: () => set({
        currentStep: 'CAPTURE',
        uploadedImage: null,
        brandDNA: null,
        storefrontData: null
    })
}));
