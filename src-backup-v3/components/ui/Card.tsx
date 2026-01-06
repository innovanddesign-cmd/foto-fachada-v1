import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({
    children,
    padding = 'md',
    hover = false,
    className = '',
    ...props
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
    };

    const classes = [
        'card',
        hover ? 'card-interactive' : '',
        paddingClasses[padding],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
    return (
        <div className={`card-header ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardBody({ children, className = '', ...props }: CardBodyProps) {
    return (
        <div className={`card-body ${className}`} {...props}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
    return (
        <div className={`card-footer ${className}`} {...props}>
            {children}
        </div>
    );
}
