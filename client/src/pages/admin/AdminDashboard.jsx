import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [statsRes, analyticsRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/analytics'),
            ]);
            setStats(statsRes.data.data);
            setAnalytics(analyticsRes.data.data);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    async function cleanupExpired() {
        if (!confirm('Clean up all expired or inactive jobs?')) return;
        try {
            const res = await axios.delete('/api/admin/jobs/expired');
            toast.success(res.data.message);
            loadData();
        } catch (err) {
            toast.error('Cleanup failed');
        }
    }

    if (loading) return <div className="p-8 text-center text-muted">Loading dashboard...</div>;
    if (!stats || !analytics) return null;

    return (
        <div className="admin-page animate-fade-in">
            <div className="admin-page-header flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-heading">System Overview</h1>
                    <p className="text-sm text-secondary">Real-time statistics of the platform</p>
                </div>
                <button className="btn btn-primary" onClick={cleanupExpired}>
                    🧹 Cleanup Expired
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="admin-stat-card">
                    <div className="text-3xl font-bold text-accent">{stats.totalJobs}</div>
                    <div className="text-sm text-secondary mt-1 uppercase font-semibold">Total Jobs</div>
                </div>
                <div className="admin-stat-card">
                    <div className="text-3xl font-bold text-success">{stats.activeJobs}</div>
                    <div className="text-sm text-secondary mt-1 uppercase font-semibold">Active Jobs</div>
                </div>
                <div className="admin-stat-card">
                    <div className="text-3xl font-bold text-warning">{stats.inactiveJobs}</div>
                    <div className="text-sm text-secondary mt-1 uppercase font-semibold">Inactive Jobs</div>
                </div>
                <div className="admin-stat-card">
                    <div className="text-3xl font-bold text-info">{stats.totalUsers}</div>
                    <div className="text-sm text-secondary mt-1 uppercase font-semibold">Total Users</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Job Distribution by Source */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-lg mb-4 text-heading border-b border-border pb-2">Jobs by Source</h3>
                    <div style={{ height: '300px' }} className="flex justify-center items-center">
                        {analytics.jobDistribution.source.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.jobDistribution.source}
                                        cx="50%" cy="50%" labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100} fill="#8884d8" dataKey="value"
                                    >
                                        {analytics.jobDistribution.source.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted text-sm text-center">No data available for jobs by source</div>
                        )}
                    </div>
                </div>

                {/* Daily Job Growth */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-lg mb-4 text-heading border-b border-border pb-2">Job Posting Trends (30 Days)</h3>
                    <div style={{ height: '300px' }} className="flex justify-center items-center">
                        {analytics.dailyGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.dailyGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} tickFormatter={(str) => new Date(str).getDate()} />
                                    <YAxis stroke="var(--text-secondary)" style={{ fontSize: '0.75rem' }} />
                                    <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                                    <Area type="monotone" dataKey="jobs" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted text-sm text-center">No posting trends available for last 30 days</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-card p-6">
                <h3 className="font-bold text-lg mb-4 text-heading border-b border-border pb-2">Recent Scraper Activity</h3>
                {stats.recentSyncs?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="admin-table w-full text-sm text-left">
                            <thead className="text-secondary bg-bg-secondary text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Fetched</th>
                                    <th className="px-4 py-3 text-right">New</th>
                                    <th className="px-4 py-3 text-right">Duplicates</th>
                                    <th className="px-4 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentSyncs.map(s => (
                                    <tr key={s._id} className="border-b border-border hover:bg-bg-card-hover transition-colors">
                                        <td className="px-4 py-3 font-semibold text-heading">{s.source}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'completed' ? 'bg-success-light text-success' : s.status === 'running' ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">{s.jobsFetched}</td>
                                        <td className="px-4 py-3 text-right text-success font-bold">+{s.jobsNew}</td>
                                        <td className="px-4 py-3 text-right text-secondary">{s.jobsDuplicate}</td>
                                        <td className="px-4 py-3 text-xs text-secondary">{new Date(s.startedAt).toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-muted">No recent syncs</p>}
            </div>
        </div>
    );
}
