'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { obtenerConfigLayout } from '@/lib/impresion/MotorDisenoImpresion';
import type { FormatoPoster } from '@/lib/estado/tipos-estado';

export function PosterViewport({ formato = 'A4', children }: { formato?: FormatoPoster; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(280);
  const dims = obtenerConfigLayout(formato);
  const scale = Math.min(width / dims.anchoPx, 0.65);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={host} className="w-full min-w-0 flex justify-center">
    <div style={{ width: dims.anchoPx * scale, height: dims.altoPx * scale, position: 'relative' }}>
      <div data-poster-scale style={{ width: dims.anchoPx, height: dims.altoPx, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>{children}</div>
    </div>
  </div>;
}
