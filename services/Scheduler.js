const cron = require('node-cron');
const config = require('../config');
const JobAggregator = require('./JobAggregator');
const Settings = require('../models/Settings');
const logger = require('../utils/logger');

/**
 * Scheduler Service
 * Manages cron jobs for automatic syncing, cleanup, etc.
 */
class Scheduler {
    constructor(aggregator) {
        this.aggregator = aggregator;
        this.jobs = {};
        this.isStarted = false;
    }

    /**
     * Start all scheduled tasks
     */
    async start() {
        if (this.isStarted) {
            logger.warn('Scheduler already started');
            return;
        }

        const settings = await Settings.getSettings();
        const syncCronExpr = `0 */${settings.syncIntervalHours || 6} * * *`;

        // Full sync - interval from DB
        this.jobs.fullSync = cron.schedule(syncCronExpr, async () => {
            logger.info('⏰ [Cron] Starting scheduled full sync...');
            try {
                await this.aggregator.syncAll();
            } catch (error) {
                logger.error('⏰ [Cron] Full sync failed:', error.message);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });

        // Cleanup - daily at 2 AM
        this.jobs.cleanup = cron.schedule(config.scheduler.cleanup, async () => {
            const currentSettings = await Settings.getSettings();
            if (currentSettings.autoCleanupEnabled) {
                logger.info('⏰ [Cron] Starting scheduled cleanup...');
                try {
                    await this.aggregator.cleanupExpiredJobs(currentSettings.cleanupAfterDays);
                } catch (error) {
                    logger.error('⏰ [Cron] Cleanup failed:', error.message);
                }
            } else {
                logger.info('⏰ [Cron] Auto cleanup is disabled in settings.');
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });

        this.isStarted = true;
        logger.info('📅 Scheduler started with the following tasks:');
        logger.info(`   Full Sync: ${syncCronExpr}`);
        logger.info(`   Cleanup: ${config.scheduler.cleanup}`);
    }

    /**
     * Dynamically update the sync interval
     */
    updateSyncInterval(hours) {
        if (this.jobs.fullSync) {
            this.jobs.fullSync.stop();
        }
        
        const syncCronExpr = `0 */${hours || 6} * * *`;
        this.jobs.fullSync = cron.schedule(syncCronExpr, async () => {
            logger.info('⏰ [Cron] Starting scheduled full sync...');
            try {
                await this.aggregator.syncAll();
            } catch (error) {
                logger.error('⏰ [Cron] Full sync failed:', error.message);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        });
        
        logger.info(`📅 Scheduler sync interval updated to: ${syncCronExpr}`);
    }

    /**
     * Stop all scheduled tasks
     */
    stop() {
        for (const [name, job] of Object.entries(this.jobs)) {
            job.stop();
            logger.info(`Stopped cron job: ${name}`);
        }
        this.isStarted = false;
        logger.info('Scheduler stopped');
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isStarted: this.isStarted,
            jobs: Object.entries(this.jobs).map(([name, job]) => ({
                name,
                running: job.running || false,
            })),
            config: {
                fullSync: config.scheduler.fullSync,
                cleanup: config.scheduler.cleanup,
            },
        };
    }
}

module.exports = Scheduler;
