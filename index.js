const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { connectDB } = require('./config/database');
const jobRoutes = require('./routes/jobRoutes');
const authRoutes = require('./routes/authRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const createAdminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const JobAggregator = require('./services/JobAggregator');
const Scheduler = require('./services/Scheduler');
const logger = require('./utils/logger');

/**
 * ============================================
 * Job Aggregator Module
 * ============================================
 * 
 * Can be used in two ways:
 * 
 * 1. STANDALONE MODE (run as separate server)
 *    $ node index.js
 * 
 * 2. INTEGRATED MODE (plug into existing MERN app)
 *    const jobAggregator = require('./job-aggregator');
 *    app.use('/api', jobAggregator.routes);
 *    jobAggregator.start();
 */

// Create instances
const aggregator = new JobAggregator();
const scheduler = new Scheduler(aggregator);

/**
 * Create and configure Express app (for standalone mode)
 */
function createApp() {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Health check
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            module: 'job-aggregator',
            timestamp: new Date().toISOString(),
        });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/bookmarks', bookmarkRoutes);
    app.use('/api/applications', applicationRoutes);
    app.use('/api/admin', createAdminRoutes(aggregator, scheduler));

    // Serve React static build
    const clientDistPath = path.join(__dirname, 'client', 'dist');
    app.use(express.static(clientDistPath));

    // SPA fallback - any non-API route serves React app
    app.get('*', (req, res) => {
        const indexPath = path.join(clientDistPath, 'index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(404).json({ error: 'Frontend not built. Run: cd client && npm run build' });
            }
        });
    });

    // Error handling (for API routes)
    app.use(errorHandler);

    return app;
}

/**
 * Start the module (connect DB, init scrapers, start scheduler)
 */
async function start(options = {}) {
    const {
        startScheduler = true,
        runInitialSync = false,
    } = options;

    try {
        // Connect to MongoDB
        await connectDB();
        logger.info('✅ Database connected');

        // Initialize scrapers
        aggregator.initialize();
        logger.info('✅ Scrapers initialized');

        // Seed source records if needed
        await seedSources();

        // Start scheduler
        if (startScheduler) {
            scheduler.start();
            logger.info('✅ Scheduler started');
        }

        // Run initial sync if requested
        if (runInitialSync) {
            logger.info('🔄 Running initial sync...');
            // Run in background
            aggregator.syncAll().catch(err => {
                logger.error('Initial sync error:', err.message);
            });
        }

        logger.info('🚀 Job Aggregator module started successfully!');
    } catch (error) {
        logger.error('Failed to start Job Aggregator:', error.message);
        throw error;
    }
}

/**
 * Seed source records in database
 */
async function seedSources() {
    const Source = require('./models/Source');
    const { sources } = require('./config/sources');

    for (const [name, sourceConfig] of Object.entries(sources)) {
        await Source.findOneAndUpdate(
            { name },
            {
                $setOnInsert: {
                    name: sourceConfig.name,
                    displayName: sourceConfig.displayName,
                    type: sourceConfig.type,
                    baseUrl: sourceConfig.baseUrl,
                    isActive: sourceConfig.isActive,
                    rateLimit: sourceConfig.rateLimit,
                },
            },
            { upsert: true }
        );
    }
    logger.info('✅ Sources seeded');
}

/**
 * Standalone server mode
 */
if (require.main === module) {
    const app = createApp();
    const PORT = config.port;

    start({ startScheduler: true, runInitialSync: false }).then(() => {
        app.listen(PORT, () => {
            logger.info(`\n${'='.repeat(50)}`);
            logger.info(`🌐 Job Aggregator Server running on port ${PORT}`);
            logger.info(`   API: http://localhost:${PORT}/api/jobs`);
            logger.info(`   Admin: http://localhost:${PORT}/api/admin`);
            logger.info(`   Health: http://localhost:${PORT}/health`);
            logger.info(`${'='.repeat(50)}\n`);
        });
    }).catch(error => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

/**
 * Export for MERN integration
 */
module.exports = {
    // Express routes (plug into existing app)
    jobRoutes,
    createAdminRoutes,
    routes: jobRoutes, // Alias

    // Services (for direct usage)
    aggregator,
    scheduler,
    JobAggregator,
    Scheduler,

    // Lifecycle
    start,
    createApp,

    // Models (if needed by main app)
    Job: require('./models/Job'),
    Source: require('./models/Source'),
    SyncLog: require('./models/SyncLog'),

    // Database
    connectDB,
};
