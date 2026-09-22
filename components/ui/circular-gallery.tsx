"use client";

import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
}

export interface GalleryItem {
  id: string;
  title: string;
  plan: string;
  url: string;
  color: string;
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
}

const BORDER_PATH_MOBILE = "M 450 0 L 756 0 A 144 144 0 0 1 900 144 L 900 1756 A 144 144 0 0 1 756 1900 L 144 1900 A 144 144 0 0 1 0 1756 L 0 144 A 144 144 0 0 1 144 0 Z";

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 350, autoRotateSpeed = 0.25, ...props }, ref) => {
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const dragStartX = useRef<number>(0);
    const dragStartRotation = useRef<number>(0);
    
    const animationFrameRef = useRef<number | null>(null);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      dragStartX.current = clientX;
      dragStartRotation.current = rotation;
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const deltaX = clientX - dragStartX.current;
      setRotation(dragStartRotation.current + deltaX * 0.5);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
      }
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }, [isDragging]);

    useEffect(() => {
      const autoRotate = () => {
        if (!isDragging && hoveredIndex === null) {
          setRotation(prev => prev - autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };
      animationFrameRef.current = requestAnimationFrame(autoRotate);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [isDragging, hoveredIndex, autoRotateSpeed]);

    const anglePerItem = 360 / items.length;

    return (
      <div
        ref={ref}
        className={cn("relative w-full h-[650px] flex items-center justify-center cursor-grab active:cursor-grabbing", className)}
        style={{ perspective: '2000px' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        {...props}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d',
            transition: isDragging ? 'none' : 'transform 0.1s linear',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;
            const totalRotation = rotation % 360;
            const relativeAngle = (itemAngle + totalRotation + 360) % 360;
            const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
            const opacity = Math.max(0.2, 1 - (normalizedAngle / 180) * 1.5);
            const isHovered = hoveredIndex === i;

            return (
              <div
                key={item.id}
                className="absolute w-[280px] h-[550px] group transition-transform duration-300 ease-out"
                style={{
                  transform: `rotateY(${relativeAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: '-140px',
                  marginTop: '-275px',
                  opacity: opacity,
                  zIndex: isHovered ? 50 : Math.round(100 - normalizedAngle),
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="relative w-full h-full rounded-[16%_/_7.57%] bg-black shadow-2xl overflow-hidden cursor-pointer" onClick={() => window.open(item.url, '_blank')}>
                  {/* Neón SVG Background */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 900 1900" preserveAspectRatio="none">
                    <path 
                      d={BORDER_PATH_MOBILE}
                      fill="none" 
                      stroke={item.color} 
                      strokeWidth="20" 
                      className="opacity-40 blur-xl"
                    />
                    <path 
                      d={BORDER_PATH_MOBILE}
                      fill="none" 
                      stroke={item.color} 
                      strokeWidth="8"
                      strokeDasharray="8000"
                      strokeDashoffset={isHovered ? "0" : "8000"}
                      className="transition-all duration-1000 ease-out"
                      style={{ filter: `drop-shadow(0 0 12px ${item.color})` }}
                    />
                  </svg>

                  {/* Isla dinámica (Notch) */}
                  <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"></div>

                  {/* Pantalla (Iframe simulado) */}
                  <div className="absolute inset-[6px] rounded-[14.58%_/_6.76%] bg-[#0f0f0f] overflow-hidden z-20" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full bg-black border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
                        {item.plan}
                      </span>
                      <span className="text-xl font-bold text-white mb-6 text-center px-4 drop-shadow-lg">
                        {item.title}
                      </span>
                      <div 
                        className="px-6 py-3 rounded-xl text-black font-bold text-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-2"
                        style={{ backgroundColor: item.color }}
                      >
                        Ver Diseño
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                    <iframe 
                      src={item.url} 
                      className="w-full h-full border-none pointer-events-none scale-[1.02] transform-origin-top-left transition-all duration-500 group-hover:scale-[1.05] group-hover:blur-[2px]"
                      scrolling="no"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';
export { CircularGallery };

