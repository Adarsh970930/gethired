const winston = require('winston');
const path = require('path');
const config = require('../config');

// Custom format for console
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [JobAggregator] ${level}: ${message} ${metaStr}`;
    })
);

// Custom format for file
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
);

const logger = winston.createLogger({
    level: config.logging.level,
    transports: [
        // Console transport - always enabled
        new winston.transports.Console({
            format: consoleFormat,
        }),
        // File transport - for production logging
        new winston.transports.File({
            filename: path.resolve(config.logging.file),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        // Error file transport
        new winston.transports.File({
            filename: path.resolve(
                path.dirname(config.logging.file),
                'error.log'
            ),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 3,
        }),
    ],
});

module.exports = logger;
