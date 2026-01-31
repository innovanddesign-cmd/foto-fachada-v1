/**
 * Language Selector Component
 * ===========================
 * Dropdown to switch between supported languages
 */
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { availableLanguages, changeLanguage, getCurrentLanguage } from '../../i18n';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode: string) => {
        changeLanguage(langCode as 'es' | 'en');
        setCurrentLang(langCode);
        setIsOpen(false);
    };

    const currentLanguageData = availableLanguages.find(l => l.code === currentLang) || availableLanguages[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 
                    px-3 py-2 rounded-lg 
                    bg-slate-800/50 hover:bg-slate-700/50 
                    border border-slate-700/50
                    text-slate-300 hover:text-white
                    transition-all duration-200
                    ${compact ? 'px-2' : ''}
                `}
                aria-label={t('common.language')}
            >
                <Globe size={16} className="text-slate-400" />
                {!compact && (
                    <>
                        <span className="text-sm">{currentLanguageData.flag} {currentLanguageData.name}</span>
                        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </>
                )}
                {compact && <span className="text-sm">{currentLanguageData.flag}</span>}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="
                    absolute right-0 mt-2 w-40 
                    bg-slate-800 border border-slate-700 
                    rounded-lg shadow-xl z-50
                    py-1 animate-fadeIn
                ">
                    {availableLanguages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`
                                w-full flex items-center justify-between
                                px-3 py-2 text-sm
                                hover:bg-slate-700/50 transition-colors
                                ${currentLang === lang.code ? 'text-indigo-400' : 'text-slate-300'}
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                            </span>
                            {currentLang === lang.code && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
