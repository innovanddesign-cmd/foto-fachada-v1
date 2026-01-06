/**
 * Analytics Service
 * ==================
 * Handles logic for tracking events and aggregating data for the dashboard.
 */
import pool from '../db/pool.js';

export interface EventData {
    landingId: string;
    eventType: 'view' | 'click' | 'scan' | 'conversion';
    deviceType?: string;
    source?: string;
    metadata?: Record<string, any>;
}

export class AnalyticsService {

    /**
     * Track a new analytic event
     */
    static async trackEvent(data: EventData): Promise<void> {
        const { landingId, eventType, deviceType, source, metadata } = data;

        await pool.query(
            `INSERT INTO analytics_events 
            (landing_id, event_type, device_type, source, metadata)
            VALUES ($1, $2, $3, $4, $5)`,
            [landingId, eventType, deviceType || 'unknown', source || 'direct', metadata || {}]
        );

        // Optional: Update aggregate counters in landings table for fast access
        if (eventType === 'view') {
            await pool.query('UPDATE landings SET views = views + 1 WHERE id = $1', [landingId]);
        } else if (eventType === 'conversion' || eventType === 'click') {
            await pool.query('UPDATE landings SET conversions = conversions + 1 WHERE id = $1', [landingId]);
        }
    }

    /**
     * Get aggregated Dashboard Stats for a specific campaign's landing
     */
    static async getDashboardStats(landingId: string, range: '7d' | '30d' | 'all' = '30d') {
        // Date filter logic
        let dateFilter = '';
        if (range === '7d') dateFilter = "AND created_at > NOW() - INTERVAL '7 days'";
        if (range === '30d') dateFilter = "AND created_at > NOW() - INTERVAL '30 days'";

        // 1. Counters
        const counts = await pool.query(
            `SELECT 
                COUNT(*) FILTER (WHERE event_type = 'view') as views,
                COUNT(*) FILTER (WHERE event_type = 'scan') as scans,
                COUNT(*) FILTER (WHERE event_type = 'click') as interactions
             FROM analytics_events 
             WHERE landing_id = $1 ${dateFilter}`,
            [landingId]
        );

        // 2. Trend (Views per Day) - for Line Chart
        const trend = await pool.query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
             FROM analytics_events 
             WHERE landing_id = $1 AND event_type = 'view' ${dateFilter}
             GROUP BY DATE(created_at) 
             ORDER BY date ASC`,
            [landingId]
        );

        // 3. Devices Breakdown - for Doughnut Chart
        const devices = await pool.query(
            `SELECT device_type, COUNT(*) as count
             FROM analytics_events
             WHERE landing_id = $1 AND event_type = 'view' ${dateFilter}
             GROUP BY device_type`,
            [landingId]
        );

        // 4. Sources Breakdown
        const sources = await pool.query(
            `SELECT source, COUNT(*) as count
             FROM analytics_events
             WHERE landing_id = $1 AND event_type = 'view' ${dateFilter}
             GROUP BY source`,
            [landingId]
        );

        // 5. Heatmap Interaction (Which buttons?)
        // Assuming metadata has 'target' or 'label' for clicks
        const interactions = await pool.query(
            `SELECT metadata->>'target' as target, COUNT(*) as count
             FROM analytics_events
             WHERE landing_id = $1 AND event_type = 'click' ${dateFilter}
             GROUP BY target
             ORDER BY count DESC
             LIMIT 5`,
            [landingId]
        );

        return {
            summary: counts.rows[0],
            trend: trend.rows,
            devices: devices.rows,
            sources: sources.rows,
            heatmap: interactions.rows
        };
    }
}
