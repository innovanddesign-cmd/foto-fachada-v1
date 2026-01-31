import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    date: Date;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('user_notifications');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Restore Date objects
                const restored = parsed.map((n: any) => ({ ...n, date: new Date(n.date) }));
                setNotifications(restored);
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        } else {
            // Add welcome notification if empty
            addNotification({
                title: '¡Bienvenido a Foto Fachada!',
                message: 'Explora el configurador y crea tu primera campaña.',
                type: 'system'
            });
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('user_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (n: Omit<Notification, 'id' | 'date' | 'read'>) => {
        const newNotification: Notification = {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date(),
            read: false
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};
