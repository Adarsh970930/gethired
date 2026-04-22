import JobCard from './JobCard';

export default function JobList({ jobs, loading, onJobClick }) {
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <div className="loading-text">Finding the best jobs for you...</div>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No jobs found</h3>
                <p>Try adjusting your search or filters to find more results</p>
            </div>
        );
    }

    return (
        <div className="jobs-list">
            {jobs.map(job => (
                <JobCard key={job._id} job={job} onClick={() => onJobClick(job._id)} />
            ))}
        </div>
    );
}
