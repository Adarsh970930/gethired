import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineRefresh } from 'react-icons/hi';

export default function AdminSources() {
    const [sources, setSources] = useState([]);
    const [logs, setLogs] = useState([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsPagination, setLogsPagination] = useState({});

    const [sourcesLoading, setSourcesLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncingSource, setSyncingSource] = useState(null);

    useEffect(() => {
        loadSources();
        // Setup polling for logs if sync is running
        const interval = setInterval(loadLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadLogs(logsPage);
    }, [logsPage]);

    async function loadSources() {
        setSourcesLoading(true);
        try {
            const res = await axios.get('/api/admin/sources');
            setSources(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load scraper sources');
        } finally {
            setSourcesLoading(false);
        }
    }

    async function loadLogs(page = 1) {
        setLogsLoading(true);
        try {
            const res = await axios.get(`/api/admin/logs?page=${page}&limit=5`);
            setLogs(res.data.data || []);
            setLogsPagination(res.data.pagination || {});
        } catch (err) {
            console.error('Failed to load sync logs', err);
        } finally {
            setLogsLoading(false);
        }
    }

    async function handleSyncAll() {
        setSyncLoading(true);
        try {
            await axios.post('/api/admin/jobs/sync');
            toast.success('Full system sync initiated! 🔄');
            loadLogs(1);
        } catch (err) {
            toast.error('Failed to start sync');
        } finally {
            setSyncLoading(false);
        }
    }

    async function handleSyncSource(source) {
        setSyncingSource(source);
        try {
            await axios.post(`/api/admin/jobs/sync/${source}`);
            toast.success(`Sync started for ${source}`);
            loadLogs(1);
        } catch (err) {
            toast.error(`Failed to sync ${source}`);
        } finally {
            setSyncingSource(null);
        }
    }

    async function handleToggleSource(sourceId) {
        try {
            const res = await axios.put(`/api/admin/sources/${sourceId}/toggle`);
            setSources(sources.map(s => s._id === sourceId ? { ...s, isActive: res.data.data.isActive } : s));
            toast.success(res.data.message);
        } catch (err) {
            toast.error('Failed to toggle source');
        }
    }

    return (
        <div className="admin-page animate-fade-in flex flex-col gap-8">
            {/* Header section */}
            <div className="admin-page-header flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Aggregator Sources</h1>
                    <p className="text-sm text-secondary">Manage and trigger the backend web scrapers</p>
                </div>
                <button className="btn btn-primary flex gap-2 items-center px-4 py-2" onClick={handleSyncAll} disabled={syncLoading}>
                    <HiOutlineRefresh className={`${syncLoading ? 'animate-spin' : ''}`} size={18} />
                    {syncLoading ? 'Syncing...' : 'Sync All Sources'}
                </button>
            </div>

            {/* Sources Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b border-border pb-8">
                {sourcesLoading ? (
                    <div className="col-span-full p-8 text-center text-muted border border-border rounded-lg bg-bg-card">Loading sources...</div>
                ) : sources.map(source => (
                    <div key={source._id} className="admin-card p-6 flex flex-col justify-between h-full bg-gradient-to-b from-bg-card to-bg-secondary border border-border rounded-xl">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-bold text-xl text-heading tracking-wide">{source.displayName || source.name}</h3>
                                <button onClick={() => handleToggleSource(source._id)} className={`px-3 py-1.5 border hover:opacity-80 transition-opacity rounded-full flex items-center gap-1.5 text-xs uppercase font-black tracking-widest ${source.isActive ? 'bg-success-light text-success border-success/30' : 'bg-danger-light text-danger border-danger/30'}`}>
                                    <div className={`w-2 h-2 rounded-full ${source.isActive ? 'bg-success' : 'bg-danger'}`}></div>
                                    {source.isActive ? 'Active' : 'Disabled'}
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm py-2 border-b border-border border-opacity-50">
                                    <span className="text-secondary font-medium">Last Run</span>
                                    <span className="text-heading font-mono text-xs">{source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleString('en-IN') : 'Never'}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-border border-opacity-50">
                                    <span className="text-secondary font-medium">Successful Syncs</span>
                                    <span className="text-success font-bold">{source.stats?.successfulSyncs || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-border border-opacity-50">
                                    <span className="text-secondary font-medium">Failed Syncs</span>
                                    <span className="text-danger font-bold">{source.stats?.failedSyncs || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-secondary text-sm">Jobs Fetched</span>
                                    <span className="text-heading font-bold">{source.totalJobsFetched?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full btn btn-ghost justify-center border border-border hover:border-accent hover:bg-accent-light text-accent transition-all py-2 flex gap-2 items-center" 
                            disabled={syncingSource === source.name}
                            onClick={() => handleSyncSource(source.name)}>
                            <HiOutlineRefresh className={syncingSource === source.name ? 'animate-spin' : ''} size={18} /> 
                            {syncingSource === source.name ? 'Syncing...' : 'Force Sync Now'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Sync Logs Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold text-heading">System Sync Logs</h2>
                    <p className="text-sm text-secondary">Diagnostic history of scraper runs</p>
                </div>

                <div className="admin-card overflow-hidden">
                    {logsLoading && logs.length === 0 ? (
                        <div className="p-8 text-center text-muted">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-muted">No sync logs available. Run a sync to generate logs.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-table w-full text-sm text-left">
                                <thead className="bg-bg-secondary text-secondary text-xs uppercase border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4">Run Time</th>
                                        <th className="px-6 py-4">Source</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Fetched</th>
                                        <th className="px-6 py-4 text-center">New</th>
                                        <th className="px-6 py-4 text-center">Duplicate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log._id} className="border-b border-border hover:bg-bg-card-hover transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs text-heading">{new Date(log.startedAt).toLocaleString('en-IN')}</span>
                                                    {log.completedAt && (
                                                        <span className="text-[0.65rem] text-muted">Time taken: {Math.round((new Date(log.completedAt) - new Date(log.startedAt)) / 1000)}s</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-heading">{log.source}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === 'completed' ? 'bg-success-light text-success' : log.status === 'running' ? 'bg-warning-light text-warning' : 'bg-danger-light text-danger'}`}>
                                                    {log.status.toUpperCase()}
                                                </span>
                                                {log.errors?.length > 0 && (
                                                    <div className="text-[0.65rem] text-danger mt-1 max-w-[150px] truncate" title={log.errors[0]}>
                                                        {log.errors[0]}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-heading">{log.jobsFetched}</td>
                                            <td className="px-6 py-4 text-center font-bold text-success">+{log.jobsNew}</td>
                                            <td className="px-6 py-4 text-center text-secondary">{log.jobsDuplicate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logsPagination?.pages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-secondary mt-2">
                        <div>
                            Showing log page <span className="text-heading font-medium">{logsPage}</span> of {logsPagination.pages}
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-bg-card border border-border rounded hover:border-accent disabled:opacity-50" disabled={logsPage <= 1} onClick={() => setLogsPage(p => p - 1)}>
                                Prev
                            </button>
                            <button className="px-3 py-1 bg-bg-card border border-border rounded hover:border-accent disabled:opacity-50" disabled={logsPage >= logsPagination.pages} onClick={() => setLogsPage(p => p + 1)}>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
