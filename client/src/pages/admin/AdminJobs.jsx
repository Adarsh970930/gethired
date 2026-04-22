import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePencilAlt, HiOutlineBan, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';

export default function AdminJobs() {
    const [jobs, setJobs] = useState([]);
    const [jobSearch, setJobSearch] = useState('');
    const [jobPage, setJobPage] = useState(1);
    const [jobPagination, setJobPagination] = useState({});
    const [selectedJobs, setSelectedJobs] = useState([]);
    const [editingJob, setEditingJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs(jobPage, jobSearch);
    }, [jobPage]);

    async function loadJobs(page = 1, q = '') {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/jobs?page=${page}&limit=20&q=${encodeURIComponent(q)}`);
            setJobs(res.data.data || []);
            setJobPagination(res.data.pagination || {});
            setSelectedJobs([]); // Reset selection on page change
        } catch (err) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    }

    async function handleBulkAction(action) {
        if (selectedJobs.length === 0) return toast.error('No jobs selected');
        if (!confirm(`Are you sure you want to ${action} ${selectedJobs.length} jobs?`)) return;

        try {
            const res = await axios.post('/api/admin/jobs/bulk', { action, jobIds: selectedJobs });
            toast.success(res.data.message);
            loadJobs(jobPage, jobSearch);
        } catch (err) {
            toast.error(`Bulk ${action} failed`);
        }
    }

    function handleSelectAll(e) {
        if (e.target.checked) setSelectedJobs(jobs.map(j => j._id));
        else setSelectedJobs([]);
    }

    function handleSelectJob(jobId) {
        if (selectedJobs.includes(jobId)) {
            setSelectedJobs(selectedJobs.filter(id => id !== jobId));
        } else {
            setSelectedJobs([...selectedJobs, jobId]);
        }
    }

    async function toggleJobActive(jobId) {
        try {
            const res = await axios.put(`/api/admin/jobs/${jobId}/toggle`);
            toast.success(res.data.message);
            setJobs(jobs.map(j => j._id === jobId ? { ...j, isActive: !j.isActive } : j));
        } catch (err) {
            toast.error('Failed to toggle job');
        }
    }

    async function deleteJob(jobId) {
        if (!confirm('Delete this job permanently?')) return;
        try {
            await axios.delete(`/api/admin/jobs/${jobId}`);
            toast.success('Job deleted');
            setJobs(jobs.filter(j => j._id !== jobId));
        } catch (err) {
            toast.error('Failed to delete job');
        }
    }

    async function handleEditSave(e) {
        e.preventDefault();
        try {
            if (editingJob._id) {
                // Update existing job
                const res = await axios.put(`/api/admin/jobs/${editingJob._id}`, editingJob);
                toast.success(res.data.message);
                setJobs(jobs.map(j => j._id === editingJob._id ? res.data.data : j));
            } else {
                // Create new job
                const res = await axios.post('/api/admin/jobs', editingJob);
                toast.success(res.data.message);
                setJobs([res.data.data, ...jobs]);
            }
            setEditingJob(null);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save job');
        }
    }

    return (
        <div className="admin-page animate-fade-in">
            <div className="admin-page-header flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Job Content Manager</h1>
                    <p className="text-sm text-secondary">View, edit, or remove scraped jobs</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            className="bg-bg-input border border-border rounded-md py-2 px-10 text-sm focus:border-accent outline-none text-primary w-64"
                            placeholder="Search jobs..."
                            value={jobSearch}
                            onChange={(e) => setJobSearch(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { setJobPage(1); loadJobs(1, jobSearch); } }}
                        />
                    </div>
                    <button className="btn btn-ghost py-2 px-4 border border-border" onClick={() => { setJobPage(1); loadJobs(1, jobSearch); }}>Search</button>
                    <button className="btn btn-primary py-2 px-4 flex items-center gap-2" onClick={() => setEditingJob({})}>
                        <HiOutlinePlus /> Add Job
                    </button>
                </div>
            </div>

            {/* Bulk Toolbar */}
            <div className="bg-bg-card border border-border rounded-t-lg p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        className="w-4 h-4 accent-accent cursor-pointer"
                        checked={jobs.length > 0 && selectedJobs.length === jobs.length}
                        onChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-secondary">
                        {selectedJobs.length} selected
                    </span>
                </div>
                {selectedJobs.length > 0 && (
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost text-success hover:bg-success-light hover:text-success" onClick={() => handleBulkAction('activate')}>
                            Activate
                        </button>
                        <button className="btn btn-sm btn-ghost text-warning hover:bg-warning-light hover:text-warning" onClick={() => handleBulkAction('deactivate')}>
                            Deactivate
                        </button>
                        <button className="btn btn-sm btn-ghost text-danger hover:bg-danger-light hover:text-danger flex gap-1 items-center" onClick={() => handleBulkAction('delete')}>
                            <HiOutlineTrash /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Jobs Table */}
            <div className="admin-card border-t-0 rounded-t-none overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-8 text-center text-muted">No jobs found matching your criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="admin-table w-full text-sm text-left">
                            <thead className="bg-bg-secondary text-secondary text-xs uppercase border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 w-10"></th>
                                    <th className="px-4 py-3">Job Details</th>
                                    <th className="px-4 py-3">Company</th>
                                    <th className="px-4 py-3">Source</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(job => (
                                    <tr key={job._id} className="border-b border-border hover:bg-bg-card-hover group">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-accent cursor-pointer"
                                                checked={selectedJobs.includes(job._id)}
                                                onChange={() => handleSelectJob(job._id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 min-w-[250px]">
                                            <div className="font-semibold text-heading truncate max-w-[300px]" title={job.title}>{job.title}</div>
                                            <div className="text-xs text-secondary mt-1 flex gap-2">
                                                <span>{job.jobType}</span>
                                                <span className="text-muted">•</span>
                                                <span>{job.location?.city || job.location?.country || 'Remote'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{job.company?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-xs text-muted">{job.source?.name}</td>
                                        <td className="px-4 py-3">
                                            {job.isActive ?
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-success-light text-success">Active</span> :
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-danger-light text-danger">Inactive</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 rounded hover:bg-accent-light text-accent transaction-colors" title="Edit Job" onClick={() => setEditingJob(job)}>
                                                    <HiOutlinePencilAlt size={16} />
                                                </button>
                                                <button className={`p-1.5 rounded transition-colors ${job.isActive ? 'hover:bg-warning-light text-warning' : 'hover:bg-success-light text-success'}`} title="Toggle Status" onClick={() => toggleJobActive(job._id)}>
                                                    <HiOutlineBan size={16} />
                                                </button>
                                                <button className="p-1.5 rounded hover:bg-danger-light text-danger transition-colors" title="Delete" onClick={() => deleteJob(job._id)}>
                                                    <HiOutlineTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && jobPagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4 text-sm text-secondary">
                    <div>
                        Showing <span className="text-heading font-medium">{jobs.length}</span> results on page <span className="text-heading font-medium">{jobPage}</span> of {jobPagination.pages}
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-bg-card border border-border rounded hover:border-accent disabled:opacity-50" disabled={jobPage <= 1} onClick={() => setJobPage(p => p - 1)}>
                            Prev
                        </button>
                        <button className="px-3 py-1 bg-bg-card border border-border rounded hover:border-accent disabled:opacity-50" disabled={jobPage >= jobPagination.pages} onClick={() => setJobPage(p => p + 1)}>
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Modal (Copied from previous functionality) */}
            {editingJob && (
                <div className="admin-modal-overlay flex justify-center items-center">
                    <div className="admin-modal-content bg-bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-bg-card z-10">
                            <h2 className="text-xl font-bold text-heading">{editingJob._id ? 'Edit Job' : 'Add New Job'}</h2>
                            <button className="text-muted hover:text-heading" onClick={() => setEditingJob(null)}>✕</button>
                        </div>
                        <form onSubmit={handleEditSave} className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm text-secondary mb-1">Job Title</label>
                                    <input className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.title || ''} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm text-secondary mb-1">Company</label>
                                    <input className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.company?.name || ''} onChange={e => setEditingJob({ ...editingJob, company: { ...editingJob.company, name: e.target.value } })} required />
                                </div>
                                <div>
                                    <label className="block text-sm text-secondary mb-1">Apply URL</label>
                                    <input className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.applyUrl || ''} onChange={e => setEditingJob({ ...editingJob, applyUrl: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary mb-1">Category</label>
                                    <select className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.category || ''} onChange={e => setEditingJob({ ...editingJob, category: e.target.value })}>
                                        <option value="">Select Category</option>
                                        <option value="engineering">💻 Engineering</option>
                                        <option value="design">🎨 Design</option>
                                        <option value="data-science">📊 Data Science</option>
                                        <option value="devops">☁️ DevOps</option>
                                        <option value="marketing">📢 Marketing</option>
                                        <option value="sales">🤝 Sales</option>
                                        <option value="finance">💰 Finance</option>
                                        <option value="hr">👥 HR</option>
                                        <option value="product">📦 Product</option>
                                        <option value="customer-support">🎧 Customer Support</option>
                                        <option value="writing">✍️ Writing</option>
                                        <option value="operations">⚙️ Operations</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary mb-1">Experience</label>
                                    <select className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.experienceLevel || ''} onChange={e => setEditingJob({ ...editingJob, experienceLevel: e.target.value })}>
                                        <option value="">Select Level</option>
                                        <option value="fresher">🌱 Fresher</option>
                                        <option value="junior">📗 Junior</option>
                                        <option value="mid">📘 Mid Level</option>
                                        <option value="senior">📕 Senior</option>
                                        <option value="lead">⭐ Lead / Principal</option>
                                        <option value="executive">👔 Executive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-secondary mb-1">City</label>
                                    <input className="form-input w-full bg-bg-input border border-border rounded p-2 text-primary" value={editingJob.location?.city || ''} onChange={e => setEditingJob({ ...editingJob, location: { ...editingJob.location, city: e.target.value } })} />
                                </div>
                                <div className="flex items-center gap-2 mt-4 md:mt-6">
                                    <input type="checkbox" id="isRemote" className="w-4 h-4 accent-accent" checked={editingJob.location?.remote || false} onChange={e => setEditingJob({ ...editingJob, location: { ...editingJob.location, remote: e.target.checked } })} />
                                    <label htmlFor="isRemote" className="text-sm font-medium text-heading cursor-pointer">Remote Job</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
                                <button type="button" className="btn btn-ghost" onClick={() => setEditingJob(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
