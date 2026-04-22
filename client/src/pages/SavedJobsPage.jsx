import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import SEO from '../components/SEO';

export default function SavedJobsPage() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        fetchBookmarks();
    }, [isAuthenticated, page]);

    async function fetchBookmarks() {
        setLoading(true);
        try {
            const res = await axios.get(`/api/bookmarks?page=${page}&limit=20`);
            setBookmarks(res.data.data?.bookmarks || []);
            setTotal(res.data.data?.pagination?.total || 0);
        } catch (err) {
            toast.error('Failed to load bookmarks');
        } finally { setLoading(false); }
    }

    async function removeBookmark(jobId) {
        try {
            await axios.delete(`/api/bookmarks/${jobId}`);
            setBookmarks(prev => prev.filter(b => b.job?._id !== jobId));
            setTotal(t => t - 1);
            toast.success('Bookmark removed');
        } catch (err) { toast.error('Failed to remove'); }
    }

    if (!isAuthenticated) return null;

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
            <SEO title="Saved Jobs" description="Your bookmarked jobs on Get Hired." noIndex />
            <div className="page-header">
                <h1 className="page-title">📌 Saved Jobs</h1>
                <p className="page-subtitle">{total} jobs saved</p>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : bookmarks.length > 0 ? (
                <div className="jobs-grid">
                    {bookmarks.map(b => b.job && (
                        <JobCard
                            key={b._id}
                            job={b.job}
                            isBookmarked={true}
                            onBookmark={removeBookmark}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🔖</div>
                    <div className="empty-state-title">No saved jobs</div>
                    <div className="empty-state-text">Save jobs you're interested in to find them later</div>
                    <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
                </div>
            )}
        </div>
    );
}
