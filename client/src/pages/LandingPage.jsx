import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineBriefcase, HiOutlineGlobe, HiOutlineAcademicCap, HiOutlineOfficeBuilding, HiOutlineClock } from 'react-icons/hi';
import axios from 'axios';
import JobCard from '../components/JobCard';
import SEO from '../components/SEO';

export default function LandingPage() {
    const [stats, setStats] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [statsRes, jobsRes] = await Promise.all([
                axios.get('/api/jobs/stats'),
                axios.get('/api/jobs?limit=6&sort=newest'),
            ]);
            setStats(statsRes.data.data);
            setFeaturedJobs(jobsRes.data.data || []);
        } catch (err) {
            console.error(err);
        }
    }

    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/jobs');
        }
    }

    const categories = [
        { label: 'Software Dev', icon: '💻', query: 'software developer' },
        { label: 'Data Science', icon: '📊', query: 'data science' },
        { label: 'Web Dev', icon: '🌐', query: 'web developer' },
        { label: 'DevOps', icon: '🔧', query: 'devops' },
        { label: 'AI / ML', icon: '🤖', query: 'machine learning' },
        { label: 'Mobile Dev', icon: '📱', query: 'mobile developer' },
        { label: 'Cloud', icon: '☁️', query: 'cloud engineer' },
        { label: 'Cyber Security', icon: '🔒', query: 'security engineer' },
    ];

    const topCompanies = [
        { name: 'Google', type: 'FAANG' },
        { name: 'Amazon', type: 'FAANG' },
        { name: 'Microsoft', type: 'FAANG' },
        { name: 'Apple', type: 'FAANG' },
        { name: 'Meta', type: 'FAANG' },
        { name: 'Wipro', type: 'WITCH' },
        { name: 'Infosys', type: 'WITCH' },
        { name: 'TCS', type: 'WITCH' },
        { name: 'Cognizant', type: 'WITCH' },
        { name: 'HCL Tech', type: 'WITCH' },
        { name: 'Flipkart', type: 'Startup' },
        { name: 'Razorpay', type: 'Startup' },
    ];

    return (
        <>
            <SEO />
            {/* Hero */}
            <section className="hero-section">
                <div className="container">
                    <div style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--accent)' }}>
                        🇮🇳 Built for Indian Engineers & Students
                    </div>
                    <h1 className="hero-title">
                        <span className="gradient-text">Get Hired</span> at Top
                        <br />Companies in India & Abroad
                    </h1>
                    <p className="hero-subtitle">
                        Real-time jobs from FAANG, WITCH, Indian startups & global companies.
                        Freshers to Senior — find your perfect role today.
                    </p>

                    <form onSubmit={handleSearch}>
                        <div className="hero-search">
                            <HiOutlineSearch style={{ marginLeft: '12px', fontSize: '1.4rem', color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search React, Python, Data Analyst, Fresher, DevOps..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="hero-search-btn">
                                <HiOutlineSearch /> Search Jobs
                            </button>
                        </div>
                    </form>

                    {/* Quick search tags */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                        {['Fresher', 'React', 'Python', 'Java', 'Remote', 'Bangalore', 'Mumbai', 'Delhi'].map(tag => (
                            <button key={tag} className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '16px' }}
                                onClick={() => navigate(`/jobs?q=${tag.toLowerCase()}`)}>
                                {tag}
                            </button>
                        ))}
                    </div>

                    {stats && (
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <div className="hero-stat-value">{stats.totalJobs?.toLocaleString()}</div>
                                <div className="hero-stat-label">Active Jobs</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-value">{stats.totalCompanies?.toLocaleString()}</div>
                                <div className="hero-stat-label">Companies</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-value">{stats.remoteJobs?.toLocaleString()}</div>
                                <div className="hero-stat-label">Remote Jobs</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-value">4+</div>
                                <div className="hero-stat-label">Data Sources</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Cards */}
            {stats && (
                <section style={{ padding: '40px 0' }}>
                    <div className="container">
                        <div className="stats-grid">
                            <div className="card stat-card">
                                <div className="stat-icon" style={{ background: 'var(--accent-light)' }}>
                                    <HiOutlineBriefcase style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats.jobsByType?.['full-time'] || 0}</div>
                                    <div className="stat-label">Full-Time Jobs</div>
                                </div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
                                    <HiOutlineAcademicCap style={{ color: 'var(--warning)' }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats.jobsByType?.internship || 0}</div>
                                    <div className="stat-label">Internships</div>
                                </div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-icon" style={{ background: 'var(--info-light)' }}>
                                    <HiOutlineGlobe style={{ color: 'var(--info)' }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats.remoteJobs || 0}</div>
                                    <div className="stat-label">Remote Positions</div>
                                </div>
                            </div>
                            <div className="card stat-card">
                                <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
                                    <HiOutlineOfficeBuilding style={{ color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <div className="stat-value">{stats.totalCompanies || 0}</div>
                                    <div className="stat-label">Companies Hiring</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Top Companies */}
            <section style={{ padding: '40px 0' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center' }}>
                        🏢 Jobs from Top Companies
                    </h2>
                    <p className="text-muted" style={{ textAlign: 'center', marginBottom: '24px' }}>FAANG · WITCH · Indian Startups · MNCs</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                        {topCompanies.map(c => (
                            <div
                                key={c.name}
                                className="card card-clickable"
                                style={{ textAlign: 'center', padding: '16px 8px' }}
                                onClick={() => navigate(`/jobs?q=${encodeURIComponent(c.name)}`)}
                            >
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)' }}>
                                    {c.name.charAt(0)}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{c.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section style={{ padding: '40px 0' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '24px', textAlign: 'center' }}>
                        🎯 Browse by Domain
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                        {categories.map(cat => (
                            <div
                                key={cat.query}
                                className="card card-clickable"
                                style={{ textAlign: 'center', padding: '20px 12px' }}
                                onClick={() => navigate(`/jobs?q=${encodeURIComponent(cat.query)}`)}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{cat.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
                <section style={{ padding: '40px 0 60px' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>🔥 Latest Jobs</h2>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')}>
                                View All →
                            </button>
                        </div>
                        <div className="jobs-grid">
                            {featuredJobs.map(job => (
                                <JobCard key={job._id} job={job} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Why Get Hired */}
            <section style={{ padding: '40px 0', background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>
                        Why <span className="gradient-text">Get Hired</span>?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🇮🇳</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>India-First Focus</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Jobs from Indian cities — Bangalore, Mumbai, Hyderabad, Pune, Delhi, Chennai & more
                            </p>
                        </div>
                        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎓</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Fresher Friendly</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Internships, fresher jobs & entry-level positions at top companies. Perfect for students.
                            </p>
                        </div>
                        <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌍</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>India + Abroad</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                Apply to roles in India or abroad — remote, onsite or hybrid. All in English.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sources */}
            <section style={{ padding: '40px 0' }}>
                <div className="container text-center">
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>Aggregated From Trusted Sources</h2>
                    <p className="text-muted" style={{ marginBottom: '24px' }}>Jobs automatically synced every 6 hours</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                        {['Remotive', 'RemoteOK', 'Arbeitnow', 'The Muse'].map(name => (
                            <div key={name} className="card" style={{ padding: '12px 24px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{name}</span>
                                <span style={{ color: 'var(--success)', marginLeft: '8px', fontSize: '0.75rem' }}>● Live</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
