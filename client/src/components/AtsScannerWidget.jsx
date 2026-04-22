import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineSparkles, HiOutlineUpload, HiCheckCircle, HiXCircle } from 'react-icons/hi';

export default function AtsScannerWidget() {
    const [resumeFile, setResumeFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [atsLoading, setAtsLoading] = useState(false);
    const [atsResult, setAtsResult] = useState(null);

    async function handleAtsScan(e) {
        e.preventDefault();
        if (!resumeFile) return toast.error("Please click to upload a PDF resume.");
        if (!jobDescription || jobDescription.trim().length < 50) return toast.error("Please paste a valid Job Description (min 50 chars).");
        
        setAtsLoading(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', jobDescription);

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

    return (
        <div className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <HiOutlineSparkles style={{ fontSize: '24px', color: 'var(--accent)' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>AI ATS Resume Scanner</h2>
            </div>

            {!atsResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                        Paste a target Job Description and upload your resume to instantly see your ATS compatibility score and missing keywords.
                    </p>

                    <div 
                        onClick={() => document.getElementById('dashboard-resume-upload').click()}
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: '12px',
                            padding: '24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: 'var(--bg-input)',
                            transition: 'border-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <HiOutlineUpload size={32} className="text-muted" style={{ marginBottom: '8px' }} />
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {resumeFile ? resumeFile.name : 'Click to Upload PDF Resume'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max 5MB</div>
                        <input 
                            id="dashboard-resume-upload" 
                            type="file" 
                            accept="application/pdf" 
                            style={{ display: 'none' }} 
                            onChange={(e) => setResumeFile(e.target.files[0])} 
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Job Description</label>
                        <textarea
                            rows="4"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="form-input"
                            style={{ width: '100%', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}
                        disabled={!resumeFile || atsLoading}
                        onClick={handleAtsScan}
                    >
                        {atsLoading ? 'Scanning with AI Engine...' : 'Scan Resume Match'}
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg-input)" strokeWidth="8" />
                                <circle 
                                    cx="50" cy="50" r="44" fill="none" 
                                    stroke={atsResult.atsScore >= 75 ? 'var(--success)' : atsResult.atsScore >= 50 ? 'var(--warning)' : 'var(--danger)'} 
                                    strokeWidth="8" 
                                    strokeDasharray="276" 
                                    strokeDashoffset={276 - (276 * atsResult.atsScore) / 100} 
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }} 
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                                {atsResult.atsScore}%
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px 0' }}>Match Complete</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Your resume is a {atsResult.atsScore >= 75 ? 'Strong' : atsResult.atsScore >= 50 ? 'Moderate' : 'Weak'} match. You must include missing keywords to bypass filters.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                                <HiCheckCircle /> Matched Skills
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {atsResult.matchedSkills.length > 0 ? atsResult.matchedSkills.map((s, i) => (
                                    <span key={i} style={{ padding: '4px 8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{s}</span>
                                )) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No strong matches found.</span>}
                            </div>
                        </div>
                        
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                                <HiXCircle /> Missing Keywords
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {atsResult.missingSkills.length > 0 ? atsResult.missingSkills.map((s, i) => (
                                    <span key={i} style={{ padding: '4px 8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{s}</span>
                                )) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>You hit the main keywords!</span>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0 0 12px 0' }}>AI Recommendations</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {atsResult.recommendations.map((rec, idx) => (
                                <li key={idx} style={{ marginBottom: '6px' }}>{rec}</li>
                            ))}
                        </ul>
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} onClick={() => { setAtsResult(null); setResumeFile(null); setJobDescription(''); }}>
                        Run New Scan
                    </button>
                </div>
            )}
        </div>
    );
}
