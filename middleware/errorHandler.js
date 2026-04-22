const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
    // Log the error
    logger.error('Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: errors,
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format',
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: 'Duplicate entry',
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

module.exports = { errorHandler, notFoundHandler };
