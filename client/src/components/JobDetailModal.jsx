import { useEffect } from 'react';

function formatSalary(salary) {
    if (!salary || (!salary.min && !salary.max)) return 'Not disclosed';
    const fmt = (n) => {
        if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
        if (n >= 100000) return `${(n / 100000).toFixed(1)} LPA`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };
    const sym = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[salary.currency] || '';
    if (salary.min && salary.max && salary.min !== salary.max) {
        return `${sym}${fmt(salary.min)} - ${sym}${fmt(salary.max)} / ${salary.period}`;
    }
    return `${sym}${fmt(salary.min || salary.max)} / ${salary.period}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

export default function JobDetailModal({ job, onClose }) {
    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    if (!job) return null;

    const location = [job.location?.city, job.location?.state, job.location?.country].filter(Boolean).join(', ');
    const typeLabels = {
        'internship': '🎓 Internship',
        'full-time': '💼 Full Time',
        'part-time': '⏰ Part Time',
        'contract': '📝 Contract',
        'freelance': '🆓 Freelance',
    };
    const levelLabels = {
        'fresher': '🌱 Fresher',
        'junior': '📗 Junior',
        'mid': '📘 Mid Level',
        'senior': '📕 Senior',
        'lead': '⭐ Lead',
        'executive': '👔 Executive',
    };

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content">
                <div className="modal-header">
                    <div>
                        <div className="modal-title">{job.title}</div>
                        <div className="modal-company">
                            {job.company?.logo && (
                                <img
                                    src={job.company.logo}
                                    alt={job.company.name}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <span className="modal-company-name">
                                {job.company?.name}
                                {job.company?.verified && ' ✓'}
                            </span>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Tags */}
                    <div className="modal-tags">
                        <span className={`meta-tag type-${job.jobType}`}>
                            {typeLabels[job.jobType] || job.jobType}
                        </span>
                        <span className="meta-tag exp">
                            {levelLabels[job.experienceLevel] || job.experienceLevel}
                        </span>
                        {location && <span className="meta-tag location">📍 {location}</span>}
                        {job.location?.remote && <span className="meta-tag remote">🌍 Remote</span>}
                        {job.location?.hybrid && <span className="meta-tag" style={{ background: 'var(--orange-bg)', color: 'var(--orange)' }}>🏢 Hybrid</span>}
                        <span className="meta-tag salary">💰 {formatSalary(job.salary)}</span>
                    </div>

                    {/* Key Info Grid */}
                    <div className="modal-section">
                        <h4>Job Details</h4>
                        <div className="modal-info-grid">
                            <div className="modal-info-item">
                                <div className="label">Company</div>
                                <div className="value">{job.company?.name}</div>
                            </div>
                            <div className="modal-info-item">
                                <div className="label">Salary</div>
                                <div className="value" style={{ color: 'var(--green)' }}>{formatSalary(job.salary)}</div>
                            </div>
                            <div className="modal-info-item">
                                <div className="label">Experience</div>
                                <div className="value">
                                    {job.experience?.min === 0 && job.experience?.max === 0
                                        ? 'No experience required'
                                        : `${job.experience?.min || 0} - ${job.experience?.max || '?'} years`}
                                </div>
                            </div>
                            <div className="modal-info-item">
                                <div className="label">Education</div>
                                <div className="value">{job.education || 'Not specified'}</div>
                            </div>
                            <div className="modal-info-item">
                                <div className="label">Posted</div>
                                <div className="value">{formatDate(job.postedDate)}</div>
                            </div>
                            <div className="modal-info-item">
                                <div className="label">Source</div>
                                <div className="value">{job.source?.name}</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="modal-section">
                        <h4>Description</h4>
                        <div className="modal-description">{job.description}</div>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="modal-section">
                            <h4>Required Skills</h4>
                            <div className="modal-skills">
                                {job.skills.map((skill, i) => (
                                    <span key={i} className="modal-skill">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Apply Button */}
                    <a
                        href={job.applyUrl || job.source?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <button className="apply-btn">
                            🚀 Apply Now
                        </button>
                    </a>
                </div>
            </div>
        </div>
    );
}
