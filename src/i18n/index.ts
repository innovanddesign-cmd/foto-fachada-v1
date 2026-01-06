/**
 * i18n Configuration
 * ==================
 * Multi-language support with i18next
 * Default: Spanish (es), Fallback: English (en)
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

const resources = {
    es: { translation: esTranslations },
    en: { translation: enTranslations }
};

i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize
    .init({
        resources,
        fallbackLng: 'es', // Spanish as default
        supportedLngs: ['es', 'en'],

        // Language detection options
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'foto-fachada-lang'
        },

        // Interpolation options
        interpolation: {
            escapeValue: false // React already escapes
        },

        // React options
        react: {
            useSuspense: false // Disable suspense for SSR compatibility
        }
    });

/**
 * Change language programmatically
 */
export function changeLanguage(lang: 'es' | 'en') {
    i18n.changeLanguage(lang);
    localStorage.setItem('foto-fachada-lang', lang);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
    return i18n.language || 'es';
}

/**
 * Get available languages
 */
export const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default i18n;
