/**
 * Analytics Dashboard
 * ====================
 * Visualizes campaign performance using Chart.js
 */
import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Loader2, TrendingUp, MousePointer, QrCode, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './AnalyticsDashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement
);

interface AnalyticsStats {
    summary: {
        views: string;
        scans: string;
        interactions: string;
    };
    trend: { date: string; count: string }[];
    devices: { device_type: string; count: string }[];
    sources: { source: string; count: string }[];
    heatmap: { target: string; count: string }[];
}

interface AnalyticsDashboardProps {
    landingId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AnalyticsDashboard({ landingId }: AnalyticsDashboardProps) {
    const { t } = useTranslation();
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d');

    useEffect(() => {
        fetchStats();
    }, [landingId, range]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('foto_fachada_jwt');
            const res = await fetch(`${API_URL}/api/analytics/${landingId}?range=${range}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500" /></div>;
    if (!stats) return <div>No data available</div>;

    // Chart Data Preparation

    // 1. Trend Line Chart
    const trendData = {
        labels: stats.trend.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: t('analytics.views', 'Visitas'),
                data: stats.trend.map(d => parseInt(d.count)),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.4
            }
        ]
    };

    // 2. Device Doughnut Chart
    const deviceData = {
        labels: stats.devices.map(d => d.device_type),
        datasets: [{
            data: stats.devices.map(d => parseInt(d.count)),
            backgroundColor: ['#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'],
            borderWidth: 0
        }]
    };

    return (
        <div className="analytics-dashboard">
            {/* Header / Filter */}
            <div className="analytics-header">
                <h3>{t('analytics.title', 'Rendimiento de Campaña')}</h3>
                <div className="filter-controls">
                    <Filter size={14} className="mr-2 opacity-50" />
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value as any)}
                        className="bg-transparent border-none text-sm focus:outline-none"
                    >
                        <option value="7d">Últimos 7 días</option>
                        <option value="30d">Últimos 30 días</option>
                        <option value="all">Todo el tiempo</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon bg-blue-500/10 text-blue-400"><TrendingUp size={20} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">{t('analytics.total_views', 'Visitas Totales')}</span>
                        <span className="kpi-value">{stats.summary.views || 0}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon bg-purple-500/10 text-purple-400"><QrCode size={20} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">{t('analytics.qr_scans', 'Escaneos QR')}</span>
                        <span className="kpi-value">{stats.summary.scans || 0}</span>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon bg-pink-500/10 text-pink-400"><MousePointer size={20} /></div>
                    <div className="kpi-content">
                        <span className="kpi-label">{t('analytics.interactions', 'Interacciones')}</span>
                        <span className="kpi-value">{stats.summary.interactions || 0}</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Trend Chart */}
                <div className="chart-card wide">
                    <h4>{t('analytics.trend_title', 'Evolución de Visitas')}</h4>
                    <div className="chart-wrapper">
                        <Line
                            data={trendData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false, color: '#333' } },
                                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Device Donut */}
                <div className="chart-card">
                    <h4>{t('analytics.devices_title', 'Dispositivos')}</h4>
                    <div className="chart-wrapper donut-wrapper">
                        {stats.devices.length > 0 ? (
                            <Doughnut data={deviceData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%' }} />
                        ) : (
                            <div className="empty-state">Sin datos suficientes</div>
                        )}
                    </div>
                </div>

                {/* Top Buttons (Heatmap List) */}
                <div className="chart-card">
                    <h4>{t('analytics.heatmap_title', 'Botones Más Clickados')}</h4>
                    <div className="heatmap-list">
                        {stats.heatmap.length > 0 ? (
                            stats.heatmap.map((item, idx) => (
                                <div key={idx} className="heatmap-item">
                                    <span className="item-name">{item.target || 'Desconocido'}</span>
                                    <div className="item-bar-container">
                                        <div
                                            className="item-bar"
                                            style={{ width: `${Math.min(100, (parseInt(item.count) / parseInt(stats.summary.interactions || '1')) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="item-count">{item.count}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <p>Esperando actividad...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
