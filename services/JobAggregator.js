const { createScraper, createAllScrapers } = require('../scrapers');
const { defaultSearchQueries } = require('../config/sources');
const DuplicateDetector = require('./DuplicateDetector');
const Job = require('../models/Job');
const Source = require('../models/Source');
const SyncLog = require('../models/SyncLog');
const logger = require('../utils/logger');
const config = require('../config');
const Settings = require('../models/Settings');
const { SYNC_STATUS } = require('../utils/constants');

/**
 * JobAggregator Service
 * Main orchestrator that coordinates scrapers, dedup, and storage
 */
class JobAggregator {
    constructor() {
        this.scrapers = {};
        this.isRunning = false;
    }

    /**
     * Initialize all scrapers
     */
    initialize() {
        this.scrapers = createAllScrapers();
        logger.info(`JobAggregator initialized with ${Object.keys(this.scrapers).length} scrapers`);
    }

    /**
     * Run a full sync across all active sources
     */
    async syncAll() {
        if (this.isRunning) {
            logger.warn('Sync already in progress, skipping...');
            return { status: 'skipped', message: 'Sync already in progress' };
        }

        this.isRunning = true;
        const startTime = Date.now();
        const results = {};

        logger.info('🚀 Starting full sync across all sources...');

        try {
            for (const [sourceName, scraper] of Object.entries(this.scrapers)) {
                try {
                    const result = await this.syncSource(sourceName);
                    results[sourceName] = result;
                } catch (error) {
                    logger.error(`Error syncing ${sourceName}:`, error.message);
                    results[sourceName] = {
                        status: 'failed',
                        error: error.message,
                    };
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            logger.info(`✅ Full sync completed in ${duration}s`);

            // Summary
            const totalNew = Object.values(results).reduce((sum, r) => sum + (r.jobsNew || 0), 0);
            const totalFetched = Object.values(results).reduce((sum, r) => sum + (r.jobsFetched || 0), 0);
            const totalDuplicates = Object.values(results).reduce((sum, r) => sum + (r.jobsDuplicate || 0), 0);

            logger.info(`📊 Summary: ${totalFetched} fetched, ${totalNew} new, ${totalDuplicates} duplicates`);

            return {
                status: 'completed',
                duration: `${duration}s`,
                totalFetched,
                totalNew,
                totalDuplicates,
                sources: results,
            };
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Sync a specific source
     */
    async syncSource(sourceName) {
        const scraper = this.scrapers[sourceName] || createScraper(sourceName);

        if (!scraper) {
            throw new Error(`Scraper not found: ${sourceName}`);
        }

        // Create sync log
        const syncLog = await SyncLog.create({
            source: sourceName,
            status: SYNC_STATUS.RUNNING,
        });

        logger.info(`📥 Syncing ${sourceName}...`);

        try {
            const settings = await Settings.getSettings();

            // Fetch jobs with different queries for diversity
            let allJobs = [];

            // Fetch by default search queries for each category
            const queries = this.getQueriesForSource(sourceName);

            for (const query of queries) {
                try {
                    // Compute roughly max pages. Assume average 50 jobs per page.
                    const maxAllowedPages = Math.ceil(settings.maxJobsPerSource / 50);
                    const jobs = await scraper.fetchJobs(query, {
                        maxPages: Math.min(maxAllowedPages, 5),
                    });
                    allJobs.push(...jobs);
                } catch (error) {
                    logger.error(`[${sourceName}] Query "${query}" failed: ${error.message}`);
                    syncLog.errors.push(`Query "${query}": ${error.message}`);
                }
            }

            // For sources with category/level fetching
            if (sourceName === 'remotive' && scraper.fetchAllCategories) {
                try {
                    const catJobs = await scraper.fetchAllCategories();
                    allJobs.push(...catJobs);
                } catch (error) {
                    logger.error(`[${sourceName}] Category fetch failed: ${error.message}`);
                }
            }

            if (sourceName === 'themuse' && scraper.fetchByLevels) {
                try {
                    const levelJobs = await scraper.fetchByLevels();
                    allJobs.push(...levelJobs);
                } catch (error) {
                    logger.error(`[${sourceName}] Level fetch failed: ${error.message}`);
                }
            }

            logger.info(`[${sourceName}] Total raw jobs: ${allJobs.length}`);

            // Deduplicate
            // Filter non-India jobs if not explicitly remote (unless marked as 'international' for the separate toggle)
            const processedJobs = allJobs.map(job => {
                const isIndia = this.isIndiaLocation(job.location);
                return {
                    ...job,
                    isInternational: !isIndia && !job.location.remote, // Flag for toggle
                    // Force India flag if detected
                    location: {
                        ...job.location,
                        country: isIndia ? 'India' : (job.location.country || job.location.city)
                    }
                };
            });

            const { newJobs, duplicateCount } = await DuplicateDetector.filterDuplicates(processedJobs);

            // Save new jobs to DB
            let savedCount = 0;
            let updatedCount = 0;
            const errors = [];

            // Batch insert for performance
            if (newJobs.length > 0) {
                const batchSize = 100;
                for (let i = 0; i < newJobs.length; i += batchSize) {
                    const batch = newJobs.slice(i, i + batchSize);
                    try {
                        // Use insertMany with ordered: false to skip duplicates
                        const result = await Job.insertMany(batch, {
                            ordered: false,
                            rawResult: true,
                        });
                        savedCount += result.insertedCount || batch.length;
                    } catch (error) {
                        // Handle partial insert (some duplicates in batch)
                        if (error.code === 11000 || error.insertedDocs) {
                            savedCount += error.insertedDocs?.length || 0;
                            logger.debug(`[${sourceName}] Batch insert had some duplicates`);
                        } else {
                            errors.push(error.message);
                            logger.error(`[${sourceName}] Batch insert error: ${error.message}`);
                        }
                    }
                }
            }

            // Update sync log
            syncLog.status = errors.length > 0 ? SYNC_STATUS.PARTIAL : SYNC_STATUS.COMPLETED;
            syncLog.completedAt = new Date();
            syncLog.jobsFetched = allJobs.length;
            syncLog.jobsNew = savedCount;
            syncLog.jobsUpdated = updatedCount;
            syncLog.jobsDuplicate = duplicateCount;
            syncLog.errors.push(...errors);
            await syncLog.save();

            // Update source record
            await Source.findOneAndUpdate(
                { name: sourceName },
                {
                    $set: {
                        lastSyncAt: new Date(),
                        'stats.lastError': errors.length > 0 ? errors[0] : '',
                    },
                    $inc: {
                        totalJobsFetched: savedCount,
                        'stats.successfulSyncs': errors.length === 0 ? 1 : 0,
                        'stats.failedSyncs': errors.length > 0 ? 1 : 0,
                    },
                },
                { upsert: true }
            );

            const result = {
                status: errors.length > 0 ? 'partial' : 'completed',
                jobsFetched: allJobs.length,
                jobsNew: savedCount,
                jobsUpdated: updatedCount,
                jobsDuplicate: duplicateCount,
                errors,
            };

            logger.info(`✅ [${sourceName}] Sync complete: ${savedCount} new, ${duplicateCount} duplicates`);

            return result;
        } catch (error) {
            // Update sync log on failure
            syncLog.status = SYNC_STATUS.FAILED;
            syncLog.completedAt = new Date();
            syncLog.errors.push(error.message);
            await syncLog.save();

            // Update source stats
            await Source.findOneAndUpdate(
                { name: sourceName },
                {
                    $set: { 'stats.lastError': error.message },
                    $inc: { 'stats.failedSyncs': 1 },
                },
                { upsert: true }
            );

            throw error;
        }
    }

    /**
     * Get search queries for a source
     * Returns diverse queries to fetch different types of jobs
     */
    getQueriesForSource(sourceName) {
        // Sources that don't need queries (they return all jobs)
        const noQuerySources = ['remoteok', 'arbeitnow'];
        if (noQuerySources.includes(sourceName)) {
            return [''];
        }

        // For sources with search support, use diverse India-focused queries
        const allQueries = [
            // India-specific (highest priority)
            ...defaultSearchQueries.india.slice(0, 5),
            // WITCH companies
            ...defaultSearchQueries.witch.slice(0, 3),
            // FAANG
            ...defaultSearchQueries.faang.slice(0, 3),
            // Indian startups
            ...defaultSearchQueries.startups.slice(0, 3),
            // Freshers
            ...defaultSearchQueries.fresher.slice(0, 3),
            // Experienced / abroad
            ...defaultSearchQueries.experienced.slice(0, 2),
            // Remote
            ...defaultSearchQueries.remote.slice(0, 2),
        ];

        // Limit queries based on source rate limits
        const queryLimits = {
            adzuna: 12,
            jsearch: 4,  // Very limited free tier
            themuse: 10,
            remotive: 8,
        };

        const limit = queryLimits[sourceName] || 8;
        return allQueries.slice(0, limit);
    }

    /**
     * Clean up expired or extremely old un-engaged jobs
     */
    async cleanupExpiredJobs(cleanupDays = 60) {
        try {
            const now = new Date();

            // Deactivate expired jobs
            const expiredResult = await Job.updateMany(
                {
                    isActive: true,
                    expiryDate: { $lt: now },
                },
                { $set: { isActive: false } }
            );

            // Deactivate jobs older than N days with no expiry
            const limitTime = new Date(now.getTime() - cleanupDays * 24 * 60 * 60 * 1000);
            const oldResult = await Job.updateMany(
                {
                    isActive: true,
                    expiryDate: null,
                    postedDate: { $lt: limitTime },
                },
                { $set: { isActive: false } }
            );

            const total = (expiredResult.modifiedCount || 0) + (oldResult.modifiedCount || 0);
            logger.info(`🧹 Cleanup: deactivated ${total} jobs (${expiredResult.modifiedCount} expired, ${oldResult.modifiedCount} old [> ${cleanupDays} days])`);

            return { deactivated: total };
        } catch (error) {
            logger.error('Cleanup error:', error.message);
            throw error;
        }
    }

    /**
     * Get sync status and recent logs
     */
    async getSyncStatus() {
        const [recentLogs, runningSync] = await Promise.all([
            SyncLog.find()
                .sort({ createdAt: -1 })
                .limit(20)
                .lean(),
            SyncLog.findOne({ status: SYNC_STATUS.RUNNING }).lean(),
        ]);

        return {
            isRunning: this.isRunning || !!runningSync,
            recentLogs,
            currentSync: runningSync,
        };
    }

    isIndiaLocation(loc) {
        if (!loc) return false;

        // Convert input to lowercase string
        const locationStr = [loc.city, loc.state, loc.country, loc].join(' ').toLowerCase();

        const INDICATORS = [
            'india', 'in', 'ind',
            // Tier 1 Cities
            'bangalore', 'bengaluru', 'mumbai', 'bombay', 'delhi', 'new delhi', 'ncr', 'gurgaon', 'gurugram',
            'noida', 'hyderabad', 'chennai', 'madras', 'pune', 'kolkata', 'calcutta', 'ahmedabad',
            // Tier 2/3 Cities & States
            'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'vizag',
            'patna', 'vadodara', 'baroda', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut',
            'rajkot', 'kalyan', 'vasai', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai',
            'allahabad', 'prayagraj', 'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur',
            'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur', 'hubli', 'dharwad', 'bareilly', 'moradabad',
            'mysore', 'mysuru', 'tiruchirappalli', 'trichy', 'salem', 'tirupur', 'bhubaneswar', 'warangal', 'cuttack',
            'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'dehradun', 'jammu', 'agartala', 'aizawl', 'imphal',
            'shillong', 'kohima', 'gangtok', 'itanagar', 'panaji', 'goa', 'kerala', 'maharashtra', 'karnataka', 'tamil nadu',
            'telangana', 'andhra pradesh', 'up', 'uttar pradesh', 'mp', 'madhya pradesh', 'gujarat', 'rajasthan', 'punjab',
            'haryana', 'bihar', 'wb', 'west bengal', 'odisha', 'assam'
        ];

        // Use regex for word boundaries to avoid matching "in" in "Berlin"
        return INDICATORS.some(place => {
            const regex = new RegExp(`\\b${place}\\b`, 'i');
            return regex.test(locationStr);
        });
    }
}

module.exports = JobAggregator;
