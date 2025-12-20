import type { ReactNode } from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import './PublicLayout.css';

interface PublicLayoutProps {
    children: ReactNode;
    onLogin: () => void;
    onGetStarted: () => void;
}

export function PublicLayout({ children, onLogin, onGetStarted }: PublicLayoutProps) {
    return (
        <div className="public-layout">
            <PublicHeader onLogin={onLogin} onGetStarted={onGetStarted} />
            <main className="public-main">
                {children}
            </main>
            <Footer />
        </div>
    );
}
