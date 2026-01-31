/**
 * Strategies Skeleton Component
 * ==============================
 * Loading state for strategies grid
 */
// import React from 'react';
import './StrategiesSkeleton.css';

export function StrategiesSkeleton() {
    return (
        <div className="strategies-skeleton-grid">
            {[1, 2, 3].map((i) => (
                <div key={i} className="strategy-card-skeleton">
                    <div className="skeleton-emoji shimmer"></div>
                    <div className="skeleton-title shimmer"></div>
                    <div className="skeleton-desc shimmer"></div>
                    <div className="skeleton-desc short shimmer"></div>
                    <div className="skeleton-line shimmer"></div>
                    <div className="skeleton-footer shimmer"></div>
                </div>
            ))}
        </div>
    );
}
