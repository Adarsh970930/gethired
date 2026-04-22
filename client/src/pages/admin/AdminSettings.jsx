import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineSave, HiOutlineClock, HiOutlineDatabase, HiOutlineTrash } from 'react-icons/hi';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        syncIntervalHours: 6,
        maxJobsPerSource: 200,
        autoCleanupEnabled: true,
        cleanupAfterDays: 60,
        rateLimitWindowMs: 900000,
        rateLimitMax: 100,
        announcementBanner: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/settings');
            if (res.data.data) {
                setSettings(res.data.data);
            }
        } catch (err) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.put('/api/admin/settings', settings);
            toast.success('Platform settings updated successfully');
        } catch (err) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) return <div className="p-8 text-center text-muted">Loading settings...</div>;

    return (
        <div className="admin-page animate-fade-in">
            <div className="admin-page-header flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-heading">Platform Settings</h1>
                    <p className="text-sm text-secondary">Dynamically configure the Job Aggregator Engine and Platform rules.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
                
                {/* Aggregator Settings */}
                <div className="admin-card p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <HiOutlineDatabase className="text-accent" size={24} />
                        <h2 className="text-xl font-bold text-heading">Scraper & Engine Config</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">Sync Interval (Hours)</label>
                            <p className="text-xs text-muted mb-2">How often the background scheduler triggers a full sync.</p>
                            <input 
                                type="number" name="syncIntervalHours" 
                                min="1" max="72" required
                                value={settings.syncIntervalHours} onChange={handleChange}
                                className="form-input w-full bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-accent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">Max Jobs Per Source</label>
                            <p className="text-xs text-muted mb-2">Maximum number of jobs to fetch per source during a single sync.</p>
                            <input 
                                type="number" name="maxJobsPerSource" 
                                min="10" max="1000" required
                                value={settings.maxJobsPerSource} onChange={handleChange}
                                className="form-input w-full bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-accent" 
                            />
                        </div>
                    </div>
                </div>

                {/* Data Cleanup Protocol */}
                <div className="admin-card p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <HiOutlineTrash className="text-danger" size={24} />
                        <h2 className="text-xl font-bold text-heading">Data Retention Protocol</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-bg-secondary p-4 rounded-lg border border-border">
                            <div>
                                <h3 className="font-bold text-heading text-sm">Automated Cleanup Module</h3>
                                <p className="text-xs text-muted mt-1">Automatically run daily to deactivate old, unexpired jobs.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="autoCleanupEnabled" checked={settings.autoCleanupEnabled} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                            </label>
                        </div>
                        
                        <div className={settings.autoCleanupEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none transition-opacity'}>
                            <label className="block text-sm font-semibold text-secondary mb-2">Cleanup After (Days)</label>
                            <p className="text-xs text-muted mb-2">Jobs older than this number of days will be automatically marked as inactive.</p>
                            <input 
                                type="number" name="cleanupAfterDays" 
                                min="1" max="365" required={settings.autoCleanupEnabled}
                                value={settings.cleanupAfterDays} onChange={handleChange}
                                className="form-input w-full md:w-1/2 bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-accent" 
                            />
                        </div>
                    </div>
                </div>

                {/* Platform Notifications */}
                <div className="admin-card p-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <HiOutlineClock className="text-warning" size={24} />
                        <h2 className="text-xl font-bold text-heading">Platform Wide Banner</h2>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">Announcement Message</label>
                        <p className="text-xs text-muted mb-2">Optional. Text displayed here will appear as a sticky banner on the user platform.</p>
                        <textarea 
                            name="announcementBanner" rows="2"
                            value={settings.announcementBanner} onChange={handleChange}
                            placeholder="e.g. Scheduled platform maintenance is taking place on Saturday..."
                            className="form-input w-full bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-accent" 
                        ></textarea>
                    </div>
                </div>

                {/* Save Block */}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="btn btn-primary px-8 py-3 text-lg flex items-center gap-2 shadow-lg shadow-accent/20">
                        <HiOutlineSave size={20} />
                        {saving ? 'Saving Config...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
