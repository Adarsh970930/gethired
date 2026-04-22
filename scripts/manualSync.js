/**
 * Manual Sync Script
 * Run: node scripts/manualSync.js [source]
 * 
 * Examples:
 *   node scripts/manualSync.js          # Sync all sources
 *   node scripts/manualSync.js adzuna   # Sync only Adzuna
 *   node scripts/manualSync.js remotive # Sync only Remotive
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/database');
const JobAggregator = require('../services/JobAggregator');
const logger = require('../utils/logger');

async function main() {
    const source = process.argv[2]; // Optional: specific source

    try {
        // Connect to DB
        await connectDB();
        logger.info('📡 Connected to database');

        // Initialize aggregator
        const aggregator = new JobAggregator();
        aggregator.initialize();

        if (source) {
            // Sync specific source
            logger.info(`🔄 Syncing source: ${source}`);
            const result = await aggregator.syncSource(source);
            logger.info('📊 Result:', JSON.stringify(result, null, 2));
        } else {
            // Sync all sources
            logger.info('🔄 Syncing all sources...');
            const result = await aggregator.syncAll();
            logger.info('📊 Result:', JSON.stringify(result, null, 2));
        }

        logger.info('✅ Sync completed!');
    } catch (error) {
        logger.error('❌ Sync failed:', error.message);
        console.error(error);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

main();
