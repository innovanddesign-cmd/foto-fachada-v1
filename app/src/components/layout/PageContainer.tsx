import type { ReactNode } from 'react';
import './PageContainer.css';

interface PageContainerProps {
    children: ReactNode;
    title?: string;
    description?: string;
    actions?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: boolean;
}

export function PageContainer({
    children,
    title,
    description,
    actions,
    maxWidth = 'xl',
    padding = true,
}: PageContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full',
    };

    return (
        <main className={`page-container ${padding ? 'page-padded' : ''}`}>
            <div className={`page-content ${maxWidthClasses[maxWidth]}`}>
                {(title || actions) && (
                    <div className="page-header animate-fadeInDown">
                        <div className="page-header-text">
                            {title && <h1 className="page-title">{title}</h1>}
                            {description && <p className="page-description">{description}</p>}
                        </div>
                        {actions && <div className="page-actions">{actions}</div>}
                    </div>
                )}
                <div className="page-body animate-fadeIn">
                    {children}
                </div>
            </div>
        </main>
    );
}
