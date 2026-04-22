import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineBookmark, HiBookmark, HiOutlineExternalLink, HiOutlineArrowLeft, HiOutlineShare, HiOutlineClock, HiOutlineOfficeBuilding, HiOutlineCurrencyDollar, HiOutlineAcademicCap, HiOutlineGlobe, HiOutlineBriefcase } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Skeleton';
import SEO from '../components/SEO';

export default function JobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        fetchJob();
    }, [id]);

    async function fetchJob() {
        setLoading(true);
        try {
            const res = await axios.get(`/api/jobs/${id}`);
            setJob(res.data.data);
            if (isAuthenticated) {
                try {
                    const bRes = await axios.get(`/api/bookmarks/check/${id}`);
                    setIsBookmarked(bRes.data.data?.isBookmarked);
                } catch { }
            }
        } catch (err) {
            toast.error('Job not found');
            navigate('/jobs');
        } finally {
            setLoading(false);
        }
    }

    async function toggleBookmark() {
        if (!isAuthenticated) { toast.error('Please login to save jobs'); return; }
        try {
            if (isBookmarked) {
                await axios.delete(`/api/bookmarks/${id}`);
                setIsBookmarked(false);
                toast.success('Bookmark removed');
            } else {
                await axios.post(`/api/bookmarks/${id}`);
                setIsBookmarked(true);
                toast.success('Job saved!');
            }
        } catch (err) { toast.error('Failed to update bookmark'); }
    }

    async function trackApplication() {
        if (!isAuthenticated) { toast.error('Please login to track applications'); return; }
        try {
            await axios.post('/api/applications', { jobId: id });
            toast.success('Application tracked! View in Dashboard.');
        } catch (err) {
            if (err.response?.data?.error?.includes('already')) {
                toast.error('Already tracking this application');
            } else { toast.error('Failed to track'); }
        }
    }

    function formatSalary(salary) {
        if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
        const c = salary.currency === 'INR' ? '₹' : salary.currency === 'EUR' ? '€' : '$';
        const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;
        if (salary.min && salary.max) return `${c}${fmt(salary.min)} - ${c}${fmt(salary.max)} / ${salary.period || 'year'}`;
        if (salary.min) return `${c}${fmt(salary.min)}+ / ${salary.period || 'year'}`;
        return 'Not disclosed';
    }

    if (loading) {
        return <SkeletonDetail />;
    }

    if (!job) return null;

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
            <SEO
                title={`${job.title} at ${job.company?.name || 'Company'}`}
                description={`${job.title} — ${job.jobType || ''} ${job.experienceLevel || ''} at ${job.company?.name || 'Company'}. ${job.location?.city ? job.location.city + ', ' : ''}${job.location?.country || ''}. Apply now on Get Hired.`}
            />
            {/* Back button */}
            <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '16px' }}>
                <HiOutlineArrowLeft /> Back to Jobs
            </button>

            <div className="job-detail-grid">
                {/* Main Content */}
                <div className="job-detail-main">
                    {/* Header Card */}
                    <div className="card" style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>{job.title}</h1>
                                <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineOfficeBuilding />
                                    {job.company?.name || 'Unknown Company'}
                                    {job.company?.verified && <span className="badge badge-success">✓ Verified</span>}
                                </div>
                            </div>
                            <div className="job-card-logo" style={{ width: '56px', height: '56px', fontSize: '1.4rem' }}>
                                {job.company?.logo ? (
                                    <img src={job.company.logo} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = (job.company?.name || 'J')[0]; }} />
                                ) : (job.company?.name || 'J')[0].toUpperCase()}
                            </div>
                        </div>

                        <div className="job-card-meta" style={{ marginTop: '16px' }}>
                            {job.jobType && <span className="job-card-tag tag-type">💼 {job.jobType}</span>}
                            {job.experienceLevel && <span className="job-card-tag tag-exp">{job.experienceLevel}</span>}
                            {job.location?.remote && <span className="job-card-tag tag-remote">🌐 Remote</span>}
                            {(job.location?.city || job.location?.country) && <span className="job-card-tag tag-loc">📍 {job.location.city || job.location.country}</span>}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            {job.applyUrl && (
                                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                                    <HiOutlineExternalLink /> Apply Now
                                </a>
                            )}
                            <button className="btn btn-secondary" onClick={toggleBookmark}>
                                {isBookmarked ? <><HiBookmark style={{ color: 'var(--warning)' }} /> Saved</> : <><HiOutlineBookmark /> Save</>}
                            </button>
                            <button className="btn btn-secondary" onClick={trackApplication}>
                                Track
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="card job-detail-section">
                        <h3>Job Description</h3>
                        <div className="job-detail-description" dangerouslySetInnerHTML={{ __html: job.description || '<p>No description provided.</p>' }} />
                    </div>

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                        <div className="card job-detail-section">
                            <h3>Skills & Technologies</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {job.skills.map((skill, i) => (
                                    <span key={i} className="skill-tag" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="job-detail-sidebar">
                    <div className="card job-detail-section">
                        <h3>Job Overview</h3>
                        <div className="detail-item">
                            <HiOutlineCurrencyDollar style={{ fontSize: '1.2rem', color: 'var(--success)' }} />
                            <div>
                                <div className="detail-item-label">Salary</div>
                                <div className="detail-item-value text-success">{formatSalary(job.salary)}</div>
                            </div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineBriefcase style={{ fontSize: '1.2rem', color: 'var(--accent)' }} />
                            <div>
                                <div className="detail-item-label">Job Type</div>
                                <div className="detail-item-value">{job.jobType || 'Not specified'}</div>
                            </div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineAcademicCap style={{ fontSize: '1.2rem', color: 'var(--warning)' }} />
                            <div>
                                <div className="detail-item-label">Experience</div>
                                <div className="detail-item-value">{job.experienceLevel || 'Not specified'}</div>
                            </div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineGlobe style={{ fontSize: '1.2rem', color: 'var(--info)' }} />
                            <div>
                                <div className="detail-item-label">Location</div>
                                <div className="detail-item-value">
                                    {job.location?.city && `${job.location.city}, `}
                                    {job.location?.country || 'Not specified'}
                                    {job.location?.remote && ' (Remote)'}
                                </div>
                            </div>
                        </div>
                        <div className="detail-item">
                            <HiOutlineClock style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }} />
                            <div>
                                <div className="detail-item-label">Posted</div>
                                <div className="detail-item-value">
                                    {job.postedDate ? new Date(job.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {job.source && (
                        <div className="card" style={{ padding: '16px 20px' }}>
                            <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Source</div>
                            <div style={{ fontWeight: 600 }}>{job.source.name}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
