const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

let isConnected = false;

/**
 * Connect to MongoDB
 * Can use existing connection if already connected (for MERN integration)
 */
const connectDB = async () => {
    if (isConnected) {
        logger.info('Using existing MongoDB connection');
        return;
    }

    // If mongoose is already connected (shared with MERN app), skip
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        logger.info('Using existing mongoose connection from parent app');
        return;
    }

    try {
        const conn = await mongoose.connect(config.mongoUri, {
            // Mongoose 8 defaults are good, but we set these for safety
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        logger.info(`MongoDB connected: ${conn.connection.host}`);

        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            logger.warn('MongoDB disconnected');
        });
    } catch (error) {
        logger.error('MongoDB connection failed:', error.message);
        throw error;
    }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        logger.info('MongoDB disconnected successfully');
    } catch (error) {
        logger.error('MongoDB disconnect error:', error.message);
    }
};

module.exports = { connectDB, disconnectDB };
