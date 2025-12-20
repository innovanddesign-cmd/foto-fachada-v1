import type { LandingPageConfig } from '../types';

export const THEME_MODERN: LandingPageConfig = {
    background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    header: {
        logoSize: 80,
        titleColor: '#2d3748',
        subtitleColor: '#718096',
        layout: 'centered'
    },
    buttons: {
        style: 'rounded',
        background: '#ffffff',
        textColor: '#2d3748',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    separators: {
        top: 'none',
        bottom: 'none',
        color: '#ffffff'
    },
    font: 'Inter, sans-serif'
};

export const THEME_INNOVA: LandingPageConfig = {
    background: {
        type: 'texture',
        value: 'noise',
        overlay: 'rgba(0,0,0,0.85)'
    },
    header: {
        logoSize: 90,
        titleColor: '#ffffff',
        subtitleColor: '#a0aec0',
        layout: 'centered'
    },
    buttons: {
        style: 'pill',
        background: 'transparent',
        textColor: '#ffffff',
        border: '1px solid rgba(255,255,255,0.8)',
        shadow: '0 0 15px rgba(255,255,255,0.1)'
    },
    separators: {
        top: 'none',
        bottom: 'none',
        color: 'transparent'
    },
    font: 'Outfit, sans-serif'
};

export const THEME_MANGO: LandingPageConfig = {
    background: {
        type: 'image',
        value: 'tropical-palm-bg',
        overlay: 'linear-gradient(to bottom, rgba(0,150,255,0.2), rgba(0,0,0,0.1))'
    },
    header: {
        logoSize: 120,
        titleColor: '#FFD700',
        subtitleColor: '#FFF',
        layout: 'centered'
    },
    buttons: {
        style: 'glass',
        background: 'rgba(30, 60, 114, 0.8)',
        textColor: '#ffffff',
        shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    },
    separators: {
        top: 'wave',
        bottom: 'wave',
        color: '#ffffff'
    },
    font: 'Fredoka One, cursive'
};

export const THEME_GMCE: LandingPageConfig = {
    background: {
        type: 'gradient',
        value: 'linear-gradient(180deg, #00c6ff 0%, #0072ff 100%)'
    },
    header: {
        logoSize: 100,
        titleColor: '#ffffff',
        subtitleColor: '#e2e8f0',
        layout: 'centered'
    },
    buttons: {
        style: 'sharp',
        background: '#0f2027',
        textColor: '#4ade80',
        border: '1px solid #4ade80'
    },
    separators: {
        top: 'none',
        bottom: 'none',
        color: 'transparent'
    },
    font: 'Rajdhani, sans-serif'
};

export const LANDING_THEMES: Record<string, LandingPageConfig> = {
    'modern': THEME_MODERN,
    'minimal': THEME_INNOVA, // Mapping minimal to Innova for now or create new
    'bold': THEME_MANGO,
    'elegant': THEME_GMCE
};
