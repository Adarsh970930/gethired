import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HiOutlineSave, HiOutlineClock, HiOutlineDatabase, HiOutlineTrash, HiOutlineSparkles } from 'react-icons/hi';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        syncIntervalHours: 6,
        maxJobsPerSource: 200,
        autoCleanupEnabled: true,
        cleanupAfterDays: 60,
        rateLimitWindowMs: 900000,
        rateLimitMax: 100,
        announcementBanner: '',
        aiProvider: 'gemini',
        geminiApiKey: '',
        groqApiKey: '',
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

                {/* AI & ATS Engine Settings */}
                <div className="admin-card p-6 border-l-4 border-l-accent">
                    <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <HiOutlineSparkles className="text-accent" size={24} />
                        <h2 className="text-xl font-bold text-heading">AI & ATS Engine Configurations</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">Active AI Provider</label>
                            <p className="text-xs text-muted mb-4">Select the engine used to evaluate resumes and assign scores across the platform.</p>
                            
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.aiProvider === 'gemini' ? 'border-accent bg-accent/10' : 'border-border bg-bg-secondary hover:border-accent/40'}`}>
                                    <input type="radio" name="aiProvider" value="gemini" checked={settings.aiProvider === 'gemini'} onChange={handleChange} className="hidden" />
                                    <span className="text-2xl">⚡</span>
                                    <span className={`font-bold ${settings.aiProvider === 'gemini' ? 'text-accent' : 'text-primary'}`}>Gemini AI</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.aiProvider === 'groq' ? 'border-[#f55036] bg-[#f55036]/10' : 'border-border bg-bg-secondary hover:border-[#f55036]/40'}`}>
                                    <input type="radio" name="aiProvider" value="groq" checked={settings.aiProvider === 'groq'} onChange={handleChange} className="hidden" />
                                    <span className="text-2xl">🧠</span>
                                    <span className={`font-bold ${settings.aiProvider === 'groq' ? 'text-[#f55036]' : 'text-primary'}`}>Meta LLaMA-3 (Groq)</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${settings.aiProvider === 'heuristic' ? 'border-success bg-success/10' : 'border-border bg-bg-secondary hover:border-success/40'}`}>
                                    <input type="radio" name="aiProvider" value="heuristic" checked={settings.aiProvider === 'heuristic'} onChange={handleChange} className="hidden" />
                                    <span className="text-2xl">⚙️</span>
                                    <span className={`font-bold ${settings.aiProvider === 'heuristic' ? 'text-success' : 'text-primary'}`}>Local Mode (Basic)</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                            <div className={settings.aiProvider === 'gemini' ? 'opacity-100' : 'opacity-40 grayscale transition-all'}>
                                <label className="block text-sm font-semibold text-secondary mb-2">Google Gemini API Key</label>
                                <input 
                                    type="password" name="geminiApiKey" 
                                    placeholder="AIzaSy..."
                                    value={settings.geminiApiKey} onChange={handleChange}
                                    className="form-input w-full bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-accent" 
                                />
                                <p className="text-[0.65rem] text-muted mt-1 uppercase tracking-wider">Required for Gemini 1.5 Flash</p>
                            </div>
                            <div className={settings.aiProvider === 'groq' ? 'opacity-100' : 'opacity-40 grayscale transition-all'}>
                                <label className="block text-sm font-semibold text-secondary mb-2">Groq LLaMA-3 API Key</label>
                                <input 
                                    type="password" name="groqApiKey" 
                                    placeholder="gsk_..."
                                    value={settings.groqApiKey} onChange={handleChange}
                                    className="form-input w-full bg-bg-input border border-border rounded-lg p-3 text-primary focus:border-[#f55036]" 
                                />
                                <p className="text-[0.65rem] text-muted mt-1 uppercase tracking-wider">Required for Ultra-fast Inferencing</p>
                            </div>
                        </div>
                    </div>
                </div>
                
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
