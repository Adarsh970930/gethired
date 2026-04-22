const express = require('express');
const router = express.Router();
const { adminLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');
const { authRequired, adminRequired } = require('../middleware/auth');
const logger = require('../utils/logger');
const AnalyticsService = require('../services/AnalyticsService');
const Job = require('../models/Job');
const User = require('../models/User');
const Source = require('../models/Source');
const SyncLog = require('../models/SyncLog');
const Settings = require('../models/Settings');

/**
 * Admin routes for job sync management
 * These routes need the aggregator instance, so we export a factory function
 */
module.exports = function createAdminRoutes(aggregator, scheduler) {
    // Apply auth and stricter rate limit to admin routes
    router.use(authRequired);
    router.use(adminRequired);
    router.use(adminLimiter);

    /**
     * POST /api/admin/jobs/sync
     * Trigger manual sync of all sources
     */
    router.post('/jobs/sync', async (req, res, next) => {
        try {
            logger.info('🔄 Manual full sync triggered via API');

            // Run sync in background, respond immediately
            res.json({
                success: true,
                message: 'Full sync started. Check /api/admin/jobs/sync/status for progress.',
            });

            // Start sync after response is sent
            aggregator.syncAll().catch(error => {
                logger.error('Background sync failed:', error.message);
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/admin/jobs/sync/:source
     * Trigger sync for a specific source
     */
    router.post('/jobs/sync/:source', validate('syncSource', 'params'), async (req, res, next) => {
        try {
            const { source } = req.params;
            logger.info(`🔄 Manual sync triggered for: ${source}`);

            res.json({
                success: true,
                message: `Sync started for ${source}. Check /api/admin/jobs/sync/status for progress.`,
            });

            aggregator.syncSource(source).catch(error => {
                logger.error(`Background sync for ${source} failed:`, error.message);
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/jobs/sync/status
     * Get sync status and recent logs
     */
    router.get('/jobs/sync/status', async (req, res, next) => {
        try {
            const status = await aggregator.getSyncStatus();
            const schedulerStatus = scheduler ? scheduler.getStatus() : { isStarted: false };

            res.json({
                success: true,
                data: {
                    sync: status,
                    scheduler: schedulerStatus,
                },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * DELETE /api/admin/jobs/expired
     * Clean up expired/old jobs
     */
    router.delete('/jobs/expired', async (req, res, next) => {
        try {
            const result = await aggregator.cleanupExpiredJobs();
            res.json({
                success: true,
                message: `Cleaned up ${result.deactivated} expired/old jobs`,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/sources
     * List all source configurations and their status
     */
    router.get('/sources', async (req, res, next) => {
        try {
            const sources = await Source.find().lean();
            res.json({
                success: true,
                data: sources,
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/sources/:id/toggle
     * Toggle a source's active status
     */
    router.put('/sources/:id/toggle', async (req, res, next) => {
        try {
            const source = await Source.findById(req.params.id);
            if (!source) return res.status(404).json({ success: false, error: 'Source not found' });

            source.isActive = !source.isActive;
            await source.save();

            res.json({ success: true, data: source, message: `Source ${source.name} ${source.isActive ? 'enabled' : 'disabled'}` });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/admin/scheduler/start
     * Start the scheduler
     */
    router.post('/scheduler/start', (req, res) => {
        if (scheduler) {
            scheduler.start();
            res.json({
                success: true,
                message: 'Scheduler started',
                data: scheduler.getStatus(),
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Scheduler not initialized',
            });
        }
    });

    /**
     * POST /api/admin/scheduler/stop
     * Stop the scheduler
     */
    router.post('/scheduler/stop', (req, res) => {
        if (scheduler) {
            scheduler.stop();
            res.json({
                success: true,
                message: 'Scheduler stopped',
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Scheduler not initialized',
            });
        }
    });

    // ==========================================
    //   USER MANAGEMENT (Admin Panel)
    // ==========================================

    /**
     * GET /api/admin/users
     * List all users
     */
    router.get('/users', async (req, res, next) => {
        try {
            const users = await User.find()
                .select('-password')
                .sort({ createdAt: -1 })
                .lean();
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/users/:id/role
     * Toggle user role between user/admin
     */
    router.put('/users/:id/role', async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            user.role = user.role === 'admin' ? 'user' : 'admin';
            await user.save();

            res.json({ success: true, data: user, message: `User role changed to ${user.role}` });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/users/:id/deactivate
     * Toggle user active status
     */
    router.put('/users/:id/deactivate', async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });

            user.isActive = !user.isActive;
            await user.save();

            res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
        } catch (error) {
            next(error);
        }
    });

    // ==========================================
    //   JOB MODERATION (Admin Panel)
    // ==========================================

    /**
     * GET /api/admin/jobs
     * List all jobs with admin details
     */
    router.get('/jobs', async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const q = req.query.q || '';

            const filter = {};
            if (q) {
                filter.$or = [
                    { title: { $regex: q, $options: 'i' } },
                    { 'company.name': { $regex: q, $options: 'i' } },
                ];
            }

            const [jobs, total] = await Promise.all([
                Job.find(filter).sort({ postedDate: -1 }).skip(skip).limit(limit).lean(),
                Job.countDocuments(filter),
            ]);

            res.json({
                success: true,
                data: jobs,
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/jobs/:id/toggle
     * Toggle job active status
     */
    router.put('/jobs/:id/toggle', async (req, res, next) => {
        try {
            const job = await Job.findById(req.params.id);
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

            job.isActive = !job.isActive;
            await job.save();

            res.json({ success: true, data: job, message: `Job ${job.isActive ? 'activated' : 'deactivated'}` });
        } catch (error) {
            next(error);
        }
    });

    /**
     * DELETE /api/admin/jobs/:id
     * Delete a job
     */
    router.delete('/jobs/:id', async (req, res, next) => {
        try {
            const job = await Job.findByIdAndDelete(req.params.id);
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

            res.json({ success: true, message: 'Job deleted' });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/jobs/:id
     * Edit a job fully
     */
    router.put('/jobs/:id', async (req, res, next) => {
        try {
            const updates = req.body;
            // Prevent changing important internal fields directly
            delete updates._id;
            delete updates.fingerprint;
            delete updates.source;

            const job = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
            if (!job) return res.status(404).json({ success: false, error: 'Job not found' });

            res.json({ success: true, data: job, message: 'Job updated successfully' });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/admin/jobs/bulk
     * Bulk actions on jobs (delete, activate, deactivate)
     */
    router.post('/jobs/bulk', async (req, res, next) => {
        try {
            const { action, jobIds } = req.body;
            if (!Array.isArray(jobIds) || jobIds.length === 0) {
                return res.status(400).json({ success: false, error: 'No jobs selected' });
            }

            let result;

            switch (action) {
                case 'delete':
                    result = await Job.deleteMany({ _id: { $in: jobIds } });
                    return res.json({ success: true, message: `Deleted ${result.deletedCount} jobs` });
                case 'activate':
                    result = await Job.updateMany({ _id: { $in: jobIds } }, { $set: { isActive: true } });
                    return res.json({ success: true, message: `Activated ${result.modifiedCount} jobs` });
                case 'deactivate':
                    result = await Job.updateMany({ _id: { $in: jobIds } }, { $set: { isActive: false } });
                    return res.json({ success: true, message: `Deactivated ${result.modifiedCount} jobs` });
                default:
                    return res.status(400).json({ success: false, error: 'Invalid bulk action' });
            }
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/stats
     * Get admin dashboard stats
     */
    router.get('/stats', async (req, res, next) => {
        try {

            const [totalJobs, activeJobs, totalUsers, recentSyncs] = await Promise.all([
                Job.countDocuments(),
                Job.countDocuments({ isActive: true }),
                User.countDocuments(),
                SyncLog.find().sort({ createdAt: -1 }).limit(5).lean(),
            ]);

            res.json({
                success: true,
                data: {
                    totalJobs,
                    activeJobs,
                    inactiveJobs: totalJobs - activeJobs,
                    totalUsers,
                    recentSyncs,
                },
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/analytics
     * Get advanced analytics for dashboard visuals
     */
    router.get('/analytics', async (req, res, next) => {
        try {
            const data = await AnalyticsService.getDashboardStats();
            res.json({
                success: true,
                data
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * POST /api/admin/jobs
     * Create a job manually from the admin panel
     */
    router.post('/jobs', async (req, res, next) => {
        try {
            const jobData = { ...req.body };

            // Set source explicitly for manually added jobs
            if (!jobData.source) {
                jobData.source = {
                    name: 'Manual',
                    url: ''
                };
            }

            // Generate a simple fingerprint if missing
            if (!jobData.fingerprint) {
                jobData.fingerprint = `manual-${Date.now()}`;
            }

            const job = new Job(jobData);
            await job.save();

            res.status(201).json({ success: true, data: job, message: 'Job added successfully' });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/logs
     * Retrieve sync logs with pagination
     */
    router.get('/logs', async (req, res, next) => {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 20;
            const skip = (page - 1) * limit;

            const logs = await SyncLog.find()
                .sort({ startedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await SyncLog.countDocuments();

            res.json({
                success: true,
                data: logs,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    });

    /**
     * GET /api/admin/settings
     * Get platform dynamic settings
     */
    router.get('/settings', async (req, res, next) => {
        try {
            const settings = await Settings.getSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    });

    /**
     * PUT /api/admin/settings
     * Update platform dynamic settings
     */
    router.put('/settings', async (req, res, next) => {
        try {
            const updates = req.body;
            delete updates._id;
            delete updates.isSingleton;

            const settings = await Settings.findOne({ isSingleton: true });
            
            // Check if interval changed
            const oldInterval = settings.syncIntervalHours;
            
            Object.assign(settings, updates);
            await settings.save();

            // Notify scheduler if it exists and interval changed
            if (scheduler && scheduler.updateSyncInterval && settings.syncIntervalHours !== oldInterval) {
                scheduler.updateSyncInterval(settings.syncIntervalHours);
            }

            res.json({ success: true, data: settings, message: 'Settings updated successfully' });
        } catch (error) {
            next(error);
        }
    });

    return router;
};
