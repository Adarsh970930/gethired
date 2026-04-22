const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * API Rate Limiter for public endpoints
 */
const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for admin/sync endpoints
 */
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: {
        success: false,
        error: 'Too many admin requests. Max 1000 per 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, adminLimiter };
