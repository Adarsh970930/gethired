import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineUpload, HiOutlineBriefcase, HiOutlineTrendingUp, HiOutlineLightBulb, HiOutlineStar } from 'react-icons/hi';
import JobCard from './JobCard';

export default function AiCareerCoach() {
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [coachData, setCoachData] = useState(null);
    const [recommendedJobs, setRecommendedJobs] = useState([]);

    async function handleAnalyze(e) {
        e.preventDefault();
        if (!resumeFile) return toast.error("Please click to upload your PDF resume.");
        
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);

        try {
            const res = await axios.post('/api/resume/career-coach', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCoachData(res.data.data);
            setRecommendedJobs(res.data.recommendedJobs || []);
            toast.success("Career Analysis Complete!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to analyze career profile.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HiOutlineSparkles style={{ fontSize: '20px', color: 'white' }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>AI Career Coach</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Discover your true potential & best matched roles</p>
                </div>
            </div>

            {!coachData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div 
                        onClick={() => document.getElementById('coach-resume-upload').click()}
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            padding: '32px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: 'var(--bg-input)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <HiOutlineUpload size={36} className="text-muted" style={{ marginBottom: '12px' }} />
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                            {resumeFile ? resumeFile.name : 'Upload Resume to Reveal Career Path'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF format, Max 5MB</div>
                        <input 
                            id="coach-resume-upload" 
                            type="file" 
                            accept="application/pdf" 
                            style={{ display: 'none' }} 
                            onChange={(e) => setResumeFile(e.target.files[0])} 
                        />
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 'bold' }}
                        disabled={!resumeFile || loading}
                        onClick={handleAnalyze}
                    >
                        {loading ? 'AI is Analyzing Your Profile...' : 'Unlock Career Insights'}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><HiOutlineBriefcase /> Role Predictor</span>
                         <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><HiOutlineTrendingUp /> Growth Trajectory</span>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Header Summary */}
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Level</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{coachData.currentLevel} Professional</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Resume Rating</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: coachData.resumeRating >= 80 ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {coachData.resumeRating}/100 <HiOutlineStar />
                            </div>
                        </div>
                    </div>

                    {/* Strong Matches */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineBriefcase className="text-primary"/> Perfect Fit Roles</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {coachData.strongMatches.map((role, idx) => (
                                <span key={idx} style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '24px', fontWeight: 600, fontSize: '0.9rem' }}>
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Future Growth Roles */}
                    <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineTrendingUp className="text-accent" /> Future Growth Path</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {coachData.futureRoles.map((role, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--heading)' }}>{role.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        <HiOutlineLightBulb style={{ display: 'inline', color: 'var(--warning)' }} /> Skills to acquire: <span style={{ fontWeight: 600 }}>{role.skillsToLearn.join(', ')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live Recommended Jobs */}
                    {recommendedJobs.length > 0 && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🔥 Handpicked Live Jobs for You</h3>
                            </div>
                            <div className="jobs-grid">
                                {recommendedJobs.map((job) => (
                                    <JobCard key={job._id} job={job} compact />
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={() => { setCoachData(null); setResumeFile(null); setRecommendedJobs([]); }}>
                        Evaluate New Resume
                    </button>
                </div>
            )}
        </div>
    );
}
