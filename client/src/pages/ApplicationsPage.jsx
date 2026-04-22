import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineCheck, HiOutlineXCircle, HiOutlineStar, HiOutlineClock, HiOutlineTrash } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const statusOptions = ['all', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'accepted'];
const statusColors = {
    applied: 'info', interviewing: 'warning', offered: 'success',
    rejected: 'danger', withdrawn: 'accent', accepted: 'success',
};

export default function ApplicationsPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (user?.role === 'admin') { navigate('/admin'); return; }
        fetchApplications();
    }, [isAuthenticated, user, navigate, filter]);

    async function fetchApplications() {
        setLoading(true);
        try {
            const res = await axios.get(`/api/applications?status=${filter}&limit=50`);
            setApplications(res.data.data?.applications || []);
            setStats(res.data.data?.stats || {});
        } catch (err) {
            toast.error('Failed to load applications');
        } finally { setLoading(false); }
    }

    async function updateStatus(id, status) {
        try {
            await axios.put(`/api/applications/${id}`, { status });
            toast.success(`Status updated to ${status}`);
            fetchApplications();
        } catch (err) { toast.error('Failed to update'); }
    }

    async function deleteApplication(id) {
        if (!confirm('Remove this application?')) return;
        try {
            await axios.delete(`/api/applications/${id}`);
            toast.success('Removed');
            fetchApplications();
        } catch (err) { toast.error('Failed to remove'); }
    }

    if (!isAuthenticated || user?.role === 'admin') return null;
    const totalApps = Object.values(stats).reduce((s, n) => s + n, 0);

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <SEO title="Applications" description="Track and manage your job applications on Get Hired." noIndex />
            <div className="page-header">
                <h1 className="page-title">📋 Application Tracker</h1>
                <p className="page-subtitle">{totalApps} applications tracked</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
                {Object.entries(stats).map(([status, count]) => (
                    <div key={status} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        onClick={() => setFilter(status)}>
                        <span className={`badge badge-${statusColors[status] || 'accent'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                            {status}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{count}</span>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="tabs" style={{ maxWidth: '600px' }}>
                {statusOptions.map(s => (
                    <div key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </div>
                ))}
            </div>

            {/* Applications list */}
            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : applications.length > 0 ? (
                <div className="jobs-grid">
                    {applications.map(app => (
                        <div key={app._id} className="card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/jobs/${app.job?._id}`} style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                                        {app.job?.title || 'Unknown Job'}
                                    </Link>
                                    <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '2px' }}>
                                        {app.job?.company?.name}
                                    </div>
                                </div>
                                <span className={`badge badge-${statusColors[app.status] || 'accent'}`}>
                                    {app.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <select
                                        className="form-select"
                                        value={app.status}
                                        onChange={(e) => updateStatus(app._id, e.target.value)}
                                        style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.8rem' }}
                                    >
                                        {statusOptions.filter(s => s !== 'all').map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteApplication(app._id)}>
                                        <HiOutlineTrash style={{ color: 'var(--danger)' }} />
                                    </button>
                                </div>
                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No applications tracked</div>
                    <div className="empty-state-text">Click "Track" on any job detail page to track your application</div>
                    <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                </div>
            )}
        </div>
    );
}
