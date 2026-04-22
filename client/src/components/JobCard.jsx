import { HiOutlineBookmark, HiBookmark, HiOutlineExternalLink } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

function timeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatSalary(salary) {
    if (!salary || (!salary.min && !salary.max)) return null;
    const fmt = (n) => {
        if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };
    const currency = salary.currency === 'INR' ? '₹' : salary.currency === 'EUR' ? '€' : '$';
    if (salary.min && salary.max) return `${currency}${fmt(salary.min)} - ${currency}${fmt(salary.max)}`;
    if (salary.min) return `${currency}${fmt(salary.min)}+`;
    if (salary.max) return `Up to ${currency}${fmt(salary.max)}`;
    return null;
}

const typeEmoji = { 'full-time': '💼', 'part-time': '⏰', 'contract': '📃', 'internship': '🎓', 'freelance': '💻' };
const expColors = { 'fresher': 'tag-exp', 'junior': 'tag-exp', 'mid': 'tag-loc', 'senior': 'tag-type', 'lead': 'tag-type' };

export default function JobCard({ job, isBookmarked, onBookmark, compact }) {
    const navigate = useNavigate();
    const salaryStr = formatSalary(job.salary);

    return (
        <div className="card card-clickable job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
            <div className="job-card-header">
                <div className="job-card-info">
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-company">
                        {job.company?.name || 'Unknown Company'}
                        {job.company?.verified && <span title="Verified">✓</span>}
                    </div>
                </div>
                <div className="job-card-logo">
                    {job.company?.logo ? (
                        <img src={job.company.logo} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = (job.company?.name || 'J')[0]; }} />
                    ) : (
                        (job.company?.name || 'J')[0].toUpperCase()
                    )}
                </div>
            </div>

            <div className="job-card-meta">
                {job.jobType && (
                    <span className="job-card-tag tag-type">
                        {typeEmoji[job.jobType] || '💼'} {job.jobType}
                    </span>
                )}
                {job.experienceLevel && (
                    <span className={`job-card-tag ${expColors[job.experienceLevel] || 'tag-exp'}`}>
                        {job.experienceLevel}
                    </span>
                )}
                {job.location?.remote && (
                    <span className="job-card-tag tag-remote">🌐 Remote</span>
                )}
                {(job.location?.city || job.location?.country) && (
                    <span className="job-card-tag tag-loc">
                        📍 {job.location.city || job.location.country}
                    </span>
                )}
                {job.source?.name && (
                    <span className="job-card-tag tag-source">via {job.source.name}</span>
                )}
            </div>

            {!compact && job.skills?.length > 0 && (
                <div className="job-card-skills">
                    {job.skills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 6 && (
                        <span className="skill-tag">+{job.skills.length - 6}</span>
                    )}
                </div>
            )}

            <div className="job-card-footer">
                <div>
                    {salaryStr ? (
                        <span className="job-card-salary">{salaryStr}</span>
                    ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Not disclosed</span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="job-card-time">{timeAgo(job.postedDate)}</span>
                    <div className="job-card-actions" onClick={(e) => e.stopPropagation()}>
                        {onBookmark && (
                            <button
                                className={`job-card-action-btn ${isBookmarked ? 'bookmarked' : ''}`}
                                onClick={() => onBookmark(job._id)}
                                title={isBookmarked ? 'Remove bookmark' : 'Save job'}
                            >
                                {isBookmarked ? <HiBookmark /> : <HiOutlineBookmark />}
                            </button>
                        )}
                        {job.applyUrl && (
                            <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="job-card-action-btn" title="Apply">
                                <HiOutlineExternalLink />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
