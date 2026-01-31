import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "dark" | "gradient";
    intensity?: "low" | "medium" | "high";
    interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, children, variant = "default", intensity = "medium", interactive = false, ...props }, ref) => {

        const baseStyles = "rounded-3xl border border-white/10 backdrop-blur-xl transition-all duration-300";

        const variants = {
            default: "bg-white/5",
            dark: "bg-black/40",
            gradient: "bg-gradient-to-br from-white/10 to-white/5",
        };

        const intensities = {
            low: "backdrop-blur-md",
            medium: "backdrop-blur-xl",
            high: "backdrop-blur-3xl",
        };

        const interactiveStyles = interactive
            ? "hover:bg-white/10 hover:scale-[1.02] hover:shadow-glass cursor-pointer active:scale-95"
            : "";

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    intensities[intensity],
                    interactiveStyles,
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";
