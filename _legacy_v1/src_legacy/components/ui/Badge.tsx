import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
    size?: 'sm' | 'md';
    children: React.ReactNode;
}

export function Badge({
    variant = 'neutral',
    size = 'md',
    children,
    className = '',
    ...props
}: BadgeProps) {
    const variantClasses = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        neutral: 'badge-neutral',
    };

    const sizeClasses = {
        sm: 'text-xs py-0.5 px-1.5',
        md: '',
    };

    const classes = [
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
}
