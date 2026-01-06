interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'heading' | 'circle' | 'rect';
    className?: string;
}

export function Skeleton({
    width,
    height,
    variant = 'rect',
    className = '',
}: SkeletonProps) {
    const baseClasses = 'skeleton';

    const variantClasses = {
        text: 'skeleton-text',
        heading: 'skeleton-heading',
        circle: 'skeleton-circle',
        rect: '',
    };

    const classes = [baseClasses, variantClasses[variant], className]
        .filter(Boolean)
        .join(' ');

    const style: React.CSSProperties = {
        width: width || (variant === 'circle' ? height : '100%'),
        height: height || (variant === 'text' ? '1em' : variant === 'heading' ? '1.5em' : '100px'),
    };

    return <div className={classes} style={style} />;
}

// Preset skeleton components
export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 ? '60%' : '100%'}
                />
            ))}
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="card p-4">
            <div className="flex gap-3 items-center mb-4">
                <Skeleton variant="circle" width={40} height={40} />
                <div className="flex-1">
                    <Skeleton variant="text" width="60%" className="mb-1" />
                    <Skeleton variant="text" width="40%" height="0.8em" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return <Skeleton variant="circle" width={size} height={size} />;
}

/**
 * Strategy card skeleton for GenerativeWidgetSelector
 */
export function SkeletonStrategyCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-slate-800/50 rounded-2xl p-6 space-y-4 animate-pulse ${className}`}>
            <div className="flex justify-between items-start">
                <Skeleton variant="rect" width={48} height={48} className="rounded-lg" />
                <Skeleton variant="circle" width={32} height={32} />
            </div>
            <Skeleton variant="heading" width="80%" />
            <SkeletonText lines={2} />
            <div className="flex gap-3 pt-2">
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={60} height={16} />
            </div>
            <Skeleton variant="rect" height={44} className="rounded-xl" />
        </div>
    );
}

/**
 * Form field skeleton
 */
export function SkeletonFormField({ className = '' }: { className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <Skeleton variant="text" width={120} height={14} />
            <Skeleton variant="rect" height={42} className="rounded-lg" />
        </div>
    );
}
