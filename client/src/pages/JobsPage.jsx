import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import { SkeletonCard } from '../components/Skeleton';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';

export default function JobsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const [filters, setFilters] = useState(() => ({
        q: searchParams.get('q') || '',
        jobType: searchParams.get('jobType') || '',
        experienceLevel: searchParams.get('experienceLevel') || '',
        category: searchParams.get('category') || '',
        workMode: searchParams.get('workMode') || '',
        sort: searchParams.get('sort') || 'newest',
        isInternational: searchParams.get('isInternational') === 'true',
    }));

    const limit = 15;

    useEffect(() => {
        fetchJobs();
        if (isAuthenticated) fetchBookmarks();
    }, [page]);

    useEffect(() => {
        setPage(1);
        fetchJobs();
    }, [filters.q, filters.jobType, filters.experienceLevel, filters.category, filters.workMode, filters.sort, filters.isInternational]);

    async function fetchJobs() {
        setLoading(true);
        try {
            const params = { page, limit, sort: filters.sort };
            if (filters.q) params.q = filters.q;
            if (filters.jobType) params.jobType = filters.jobType;
            if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
            if (filters.category) params.category = filters.category;
            if (filters.isInternational) params.isInternational = 'true';

            const endpoint = filters.q ? '/api/jobs/search' : '/api/jobs';
            const res = await axios.get(endpoint, { params });

            setJobs(res.data.data || []);
            setTotal(res.data.pagination?.total || res.data.data?.length || 0);

            // Update URL
            const newParams = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) newParams[k] = v; });
            if (page > 1) newParams.page = page;
            setSearchParams(newParams, { replace: true });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }

    async function fetchBookmarks() {
        try {
            const res = await axios.get('/api/bookmarks/ids');
            setBookmarkedIds(new Set(res.data.data || []));
        } catch (err) { /* silent */ }
    }

    async function handleBookmark(jobId) {
        if (!isAuthenticated) {
            toast.error('Please login to save jobs');
            return;
        }
        try {
            if (bookmarkedIds.has(jobId)) {
                await axios.delete(`/api/bookmarks/${jobId}`);
                setBookmarkedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
                toast.success('Bookmark removed');
            } else {
                await axios.post(`/api/bookmarks/${jobId}`);
                setBookmarkedIds(prev => new Set(prev).add(jobId));
                toast.success('Job saved!');
            }
        } catch (err) {
            toast.error('Failed to update bookmark');
        }
    }

    function setFilter(key, value) {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
            <SEO
                title={filters.q ? `${filters.q} Jobs` : 'Browse Jobs'}
                description={filters.q ? `Search results for ${filters.q} jobs in India & abroad.` : 'Browse thousands of engineering jobs from FAANG, WITCH, Indian startups and global companies.'}
            />
            {/* Search & Filters */}
            <div className="filter-bar">
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <HiOutlineSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search jobs, skills, companies..."
                            value={filters.q}
                            onChange={(e) => setFilter('q', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={fetchJobs}>
                        <HiOutlineSearch /> Search
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: filters.isInternational ? 'var(--accent)' : 'transparent', color: filters.isInternational ? '#fff' : 'inherit', border: filters.isInternational ? '1px solid var(--accent)' : '1px solid var(--border)' }}>
                        <input
                            type="checkbox"
                            checked={filters.isInternational}
                            onChange={(e) => setFilter('isInternational', e.target.checked)}
                            style={{ display: 'none' }}
                        />
                        🌏 International
                    </label>
                </div>

                <select className="form-select" value={filters.jobType} onChange={(e) => setFilter('jobType', e.target.value)}>
                    <option value="">All Job Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                </select>

                <select className="form-select" value={filters.experienceLevel} onChange={(e) => setFilter('experienceLevel', e.target.value)}>
                    <option value="">All Experience</option>
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead/Manager</option>
                    <option value="lead">Lead/Manager</option>
                </select>



                <select className="form-select" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="engineering">Engineering</option>
                    <option value="data-science">Data Science</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="product">Product</option>
                    <option value="devops">DevOps</option>
                </select>

                <select className="form-select" value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="salary_high">Highest Salary</option>
                    <option value="company">Company A-Z</option>
                </select>
            </div>

            {/* Results count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Showing <strong style={{ color: 'var(--text-primary)' }}>{jobs.length}</strong> of{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</strong> jobs
                </div>
                {Object.values(filters).some(v => v && v !== 'newest') && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ q: '', jobType: '', experienceLevel: '', category: '', workMode: '', sort: 'newest' })}>
                        ✕ Clear Filters
                    </button>
                )}
            </div>

            {/* Job List */}
            {loading ? (
                <div className="jobs-grid">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : jobs.length > 0 ? (
                <>
                    <div className="jobs-grid">
                        {jobs.map(job => (
                            <JobCard
                                key={job._id}
                                job={job}
                                isBookmarked={bookmarkedIds.has(job._id)}
                                onBookmark={handleBookmark}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                let p;
                                if (totalPages <= 7) p = i + 1;
                                else if (page <= 4) p = i + 1;
                                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                                else p = page - 3 + i;
                                return (
                                    <button
                                        key={p}
                                        className={`pagination-btn ${p === page ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                className="pagination-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <div className="empty-state-title">No jobs found</div>
                    <div className="empty-state-text">Try adjusting your search or filters</div>
                </div>
            )}
        </div>
    );
}
