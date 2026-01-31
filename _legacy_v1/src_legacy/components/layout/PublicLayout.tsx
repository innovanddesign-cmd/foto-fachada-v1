import type { ReactNode } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import './PublicLayout.css';

interface PublicLayoutProps {
    children: ReactNode;
    onLogin: () => void;
    onGetStarted: () => void;
}

export function PublicLayout({ children, onLogin, onGetStarted }: PublicLayoutProps) {
    return (
        <div className="public-layout">
            <PublicNavbar onLogin={onLogin} onGetStarted={onGetStarted} />
            <main className="public-main">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
}
