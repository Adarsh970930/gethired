/**
 * Seed Sources Script
 * Run: node scripts/seedSources.js
 * 
 * Initializes source records in the database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { connectDB, disconnectDB } = require('../config/database');
const Source = require('../models/Source');
const { sources } = require('../config/sources');
const logger = require('../utils/logger');

async function main() {
    try {
        await connectDB();
        logger.info('📡 Connected to database');

        for (const [name, sourceConfig] of Object.entries(sources)) {
            const result = await Source.findOneAndUpdate(
                { name },
                {
                    name: sourceConfig.name,
                    displayName: sourceConfig.displayName,
                    type: sourceConfig.type,
                    baseUrl: sourceConfig.baseUrl,
                    isActive: sourceConfig.isActive,
                    rateLimit: sourceConfig.rateLimit,
                },
                { upsert: true, new: true }
            );
            logger.info(`✅ Seeded source: ${result.displayName} (${result.name})`);
        }

        logger.info(`\n🎉 All ${Object.keys(sources).length} sources seeded successfully!`);
    } catch (error) {
        logger.error('❌ Seeding failed:', error.message);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

main();
