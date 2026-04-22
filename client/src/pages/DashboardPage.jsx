import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineBookmark, HiOutlineClipboardList, HiOutlineCheck, HiOutlineClock, HiOutlineXCircle, HiOutlineStar } from 'react-icons/hi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import AtsScannerWidget from '../components/AtsScannerWidget';
import SEO from '../components/SEO';

export default function DashboardPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [applications, setApplications] = useState([]);
    const [appStats, setAppStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (user?.role === 'admin') { navigate('/admin'); return; }
        fetchDashboard();
    }, [isAuthenticated, user, navigate]);

    async function fetchDashboard() {
        setLoading(true);
        try {
            const [bRes, aRes] = await Promise.all([
                axios.get('/api/bookmarks?limit=5'),
                axios.get('/api/applications?limit=5'),
            ]);
            setBookmarks(bRes.data.data?.bookmarks || []);
            setApplications(aRes.data.data?.applications || []);
            setAppStats(aRes.data.data?.stats || {});
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }

    if (!isAuthenticated || user?.role === 'admin') return null;

    const totalApps = Object.values(appStats).reduce((s, n) => s + n, 0);
    const statusIcons = {
        applied: <HiOutlineClock style={{ color: 'var(--info)' }} />,
        interviewing: <HiOutlineStar style={{ color: 'var(--warning)' }} />,
        offered: <HiOutlineCheck style={{ color: 'var(--success)' }} />,
        rejected: <HiOutlineXCircle style={{ color: 'var(--danger)' }} />,
    };

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <SEO title="Dashboard" description="Your Get Hired dashboard — track applications, saved jobs, and interview progress." noIndex />
            {/* Welcome */}
            <div className="page-header" style={{ border: 'none', paddingBottom: '8px' }}>
                <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="page-subtitle">Here's your job search activity at a glance</p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid">
                <div className="card dashboard-stat">
                    <div className="dashboard-stat-icon" style={{ background: 'var(--info-light)' }}>
                        <HiOutlineClipboardList style={{ color: 'var(--info)' }} />
                    </div>
                    <div className="dashboard-stat-value">{totalApps}</div>
                    <div className="dashboard-stat-label">Applications</div>
                </div>
                <div className="card dashboard-stat">
                    <div className="dashboard-stat-icon" style={{ background: 'var(--warning-light)' }}>
                        <HiOutlineBookmark style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="dashboard-stat-value">{bookmarks.length}+</div>
                    <div className="dashboard-stat-label">Saved Jobs</div>
                </div>
                <div className="card dashboard-stat">
                    <div className="dashboard-stat-icon" style={{ background: 'var(--success-light)' }}>
                        <HiOutlineCheck style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="dashboard-stat-value">{appStats.interviewing || 0}</div>
                    <div className="dashboard-stat-label">Interviewing</div>
                </div>
                <div className="card dashboard-stat">
                    <div className="dashboard-stat-icon" style={{ background: 'var(--accent-light)' }}>
                        <HiOutlineStar style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="dashboard-stat-value">{appStats.offered || 0}</div>
                    <div className="dashboard-stat-label">Offers</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {/* ATS Scanner Widget Top Section */}
                    <AtsScannerWidget />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                        {/* Recent Bookmarks */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📌 Saved Jobs</h2>
                            <Link to="/saved" className="btn btn-ghost btn-sm">View All →</Link>
                        </div>
                        {bookmarks.length > 0 ? (
                            <div className="jobs-grid">
                                {bookmarks.map(b => b.job && (
                                    <JobCard key={b._id} job={b.job} compact />
                                ))}
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                                <p className="text-muted">No saved jobs yet. <Link to="/jobs">Browse jobs</Link></p>
                            </div>
                        )}
                    </div>

                    {/* Recent Applications */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📋 Applications</h2>
                            <Link to="/applications" className="btn btn-ghost btn-sm">View All →</Link>
                        </div>
                        {applications.length > 0 ? (
                            <div className="jobs-grid">
                                {applications.map(app => app.job && (
                                    <div key={app._id} className="card" style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{app.job.title}</div>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{app.job.company?.name}</div>
                                            </div>
                                            <span className={`badge badge-${app.status === 'applied' ? 'info' : app.status === 'interviewing' ? 'warning' : app.status === 'offered' || app.status === 'accepted' ? 'success' : 'danger'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
                                <p className="text-muted">No tracked applications. <Link to="/jobs">Start applying</Link></p>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}
