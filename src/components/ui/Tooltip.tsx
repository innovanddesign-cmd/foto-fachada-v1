/**
 * Tooltip Component
 * ==================
 * Descriptive tooltips for icons and metrics
 */
import { useState, useRef, useEffect, type ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export function Tooltip({
    content,
    children,
    position = 'top',
    delay = 200
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | undefined>(undefined);

    const showTooltip = () => {
        timeoutRef.current = window.setTimeout(() => {
            if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setCoords({
                    x: rect.left + rect.width / 2,
                    y: position === 'bottom' ? rect.bottom : rect.top
                });
            }
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const positionStyles: Record<string, React.CSSProperties> = {
        top: {
            left: coords.x,
            top: coords.y - 8,
            transform: 'translate(-50%, -100%)'
        },
        bottom: {
            left: coords.x,
            top: coords.y + 8,
            transform: 'translate(-50%, 0)'
        },
        left: {
            left: coords.x - 8,
            top: coords.y,
            transform: 'translate(-100%, -50%)'
        },
        right: {
            left: coords.x + 8,
            top: coords.y,
            transform: 'translate(0, -50%)'
        }
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
                onFocus={showTooltip}
                onBlur={hideTooltip}
                style={{ display: 'inline-flex' }}
            >
                {children}
            </div>

            {isVisible && (
                <div
                    className="tooltip"
                    style={{
                        position: 'fixed',
                        ...positionStyles[position],
                        zIndex: 9999
                    }}
                >
                    {content}
                </div>
            )}

            <style>{`
                .tooltip {
                    background: rgba(0, 0, 0, 0.9);
                    color: #fff;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    white-space: nowrap;
                    pointer-events: none;
                    animation: tooltipFadeIn 0.15s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translate(-50%, calc(-100% + 5px)); }
                    to { opacity: 1; transform: translate(-50%, -100%); }
                }
            `}</style>
        </>
    );
}
