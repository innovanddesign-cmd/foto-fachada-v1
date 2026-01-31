/**
 * Theme Toggle Component
 * ======================
 * Button to switch between dark and light modes with i18n support
 */
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { t } = useTranslation();
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={`
                flex items-center gap-2 
                px-3 py-2 rounded-lg 
                bg-[var(--color-bg-tertiary)]
                border border-[var(--color-border)]
                text-[var(--color-text-secondary)] hover:text-[var(--color-text)]
                transition-all duration-200
                ${compact ? 'px-2' : ''}
            `}
            aria-label={t('theme.toggle')}
            title={isDark ? t('common.lightMode') : t('common.darkMode')}
        >
            {isDark ? (
                <>
                    <Moon size={16} className="text-indigo-400" />
                    {!compact && <span className="text-sm">{t('theme.dark')}</span>}
                </>
            ) : (
                <>
                    <Sun size={16} className="text-amber-500" />
                    {!compact && <span className="text-sm">{t('theme.light')}</span>}
                </>
            )}
        </button>
    );
}
