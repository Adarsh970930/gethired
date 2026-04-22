import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiOutlineBookmark, HiBookmark, HiOutlineExternalLink, HiOutlineArrowLeft, HiOutlineShare, HiOutlineClock, HiOutlineOfficeBuilding, HiOutlineCurrencyDollar, HiOutlineAcademicCap, HiOutlineGlobe, HiOutlineBriefcase, HiOutlineSparkles, HiOutlineUpload, HiX, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from '../components/Skeleton';
import SEO from '../components/SEO';

export default function JobDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    
    // ATS Scanner State
    const [showAtsModal, setShowAtsModal] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsResult, setAtsResult] = useState(null);

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
    async function handleAtsScan(e) {
        e.preventDefault();
        if (!resumeFile) return toast.error("Please select a PDF resume file first.");
        
        setAtsLoading(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', job.description || job.title);

        try {
            const res = await axios.post('/api/resume/ats-check', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAtsResult(res.data.data);
            toast.success("ATS Analysis Complete!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to analyze resume.");
        } finally {
            setAtsLoading(false);
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
                        {user?.role !== 'admin' && (
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
                                <button className="btn outline-none focus:outline-none transition-all flex items-center justify-center gap-2 border border-accent bg-accent/10 hover:bg-accent text-accent hover:text-white px-4 rounded-lg font-bold" onClick={() => setShowAtsModal(true)}>
                                    <HiOutlineSparkles size={20} /> Review ATS Setup
                                </button>
                            </div>
                        )}
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

            {/* ATS Smart Scanner Modal */}
            {showAtsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-bg-secondary">
                            <h2 className="text-lg font-bold text-heading flex items-center gap-2">
                                <HiOutlineSparkles className="text-accent" /> AI ATS Scanner
                            </h2>
                            <button onClick={() => { setShowAtsModal(false); setAtsResult(null); setResumeFile(null); }} className="text-secondary hover:text-primary transition-colors">
                                <HiX size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {!atsResult ? (
                                <div className="space-y-6">
                                    <p className="text-sm text-secondary">Our AI algorithm will compare your resume against this job posting ({job.title}) and provide a detailed ATS match score and recommendations.</p>
                                    
                                    <div className="border-2 border-dashed border-border hover:border-accent transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer bg-bg-input" onClick={() => document.getElementById('resume-upload').click()}>
                                        <HiOutlineUpload size={40} className="text-muted mb-3" />
                                        <p className="font-semibold text-primary mb-1">{resumeFile ? resumeFile.name : 'Click to Upload Resume'}</p>
                                        <p className="text-xs text-muted">Supports PDF files up to 5MB</p>
                                        <input id="resume-upload" type="file" accept="application/pdf" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                                    </div>
                                    
                                    <button 
                                        className="w-full btn btn-primary flex justify-center py-3 text-base shadow-lg shadow-accent/20"
                                        disabled={!resumeFile || atsLoading}
                                        onClick={handleAtsScan}
                                    >
                                        {atsLoading ? 'Scanning Document with AI...' : 'Scan Resume Now'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex flex-col md:flex-row gap-6 items-center border-b border-border pb-6">
                                        <div className="relative w-32 h-32 flex shrink-0 items-center justify-center rounded-full border-8 border-bg-input">
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                                <circle cx="56" cy="56" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-bg-input transform translate-x-[4px] translate-y-[4px]" />
                                                <circle cx="56" cy="56" r="56" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * atsResult.atsScore) / 100} className={`transform translate-x-[4px] translate-y-[4px] ${atsResult.atsScore >= 75 ? 'text-success' : atsResult.atsScore >= 50 ? 'text-warning' : 'text-danger'} transition-all duration-1000 ease-out`} />
                                            </svg>
                                            <div className="text-center font-black text-3xl text-heading absolute">
                                                {atsResult.atsScore}%
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-heading">Match Complete</h3>
                                            <p className="text-sm text-secondary mt-1">Your resume has a {atsResult.atsScore >= 75 ? 'Strong' : atsResult.atsScore >= 50 ? 'Moderate' : 'Weak'} match against this job description. {atsResult.atsScore < 75 && "Consider addressing the missing keywords below."}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-success/5 border border-success/20 p-4 rounded-xl">
                                            <h4 className="font-bold text-success mb-3 flex items-center gap-2"><HiCheckCircle /> Matched Skills</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.matchedSkills.length > 0 ? atsResult.matchedSkills.map((s, i) => <span key={i} className="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">{s}</span>) : <span className="text-xs text-muted">No specific key matches found.</span>}
                                            </div>
                                        </div>
                                        <div className="bg-danger/5 border border-danger/20 p-4 rounded-xl">
                                            <h4 className="font-bold text-danger mb-3 flex items-center gap-2"><HiXCircle /> Missing Keywords</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {atsResult.missingSkills.length > 0 ? atsResult.missingSkills.map((s, i) => <span key={i} className="px-2 py-1 bg-danger/20 text-danger rounded text-xs font-bold">{s}</span>) : <span className="text-xs text-muted">You have hit the main keywords!</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-heading mb-3">AI Recommendations</h4>
                                        <ul className="space-y-2 text-sm text-secondary list-disc pl-5">
                                            {atsResult.recommendations.map((rec, idx) => (
                                                <li key={idx}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button className="w-full btn btn-secondary mt-4" onClick={() => { setAtsResult(null); setResumeFile(null); }}>Scan Another Resume</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
