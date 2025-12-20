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
