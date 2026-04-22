require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal',

  // Scraper Settings
  scraper: {
    concurrency: parseInt(process.env.SCRAPER_CONCURRENCY) || 3,
    requestDelayMs: parseInt(process.env.SCRAPER_REQUEST_DELAY_MS) || 1000,
    maxPagesPerSource: parseInt(process.env.SCRAPER_MAX_PAGES_PER_SOURCE) || 5,
    jobsPerPage: parseInt(process.env.SCRAPER_JOBS_PER_PAGE) || 50,
    userAgent: 'Mozilla/5.0 (compatible; JobAggregatorBot/1.0; +https://yourjobportal.com/bot)',
    timeout: 30000, // 30 seconds
  },

  // API Keys
  apis: {
    adzuna: {
      appId: process.env.ADZUNA_APP_ID || '',
      appKey: process.env.ADZUNA_APP_KEY || '',
      country: process.env.ADZUNA_COUNTRY || 'in',
    },
    jsearch: {
      apiKey: process.env.JSEARCH_API_KEY || '',
    },
  },

  // Scheduler Cron Expressions
  scheduler: {
    fullSync: process.env.SYNC_CRON_FULL || '0 */6 * * *',
    cleanup: process.env.SYNC_CRON_CLEANUP || '0 2 * * *',
    stats: process.env.SYNC_CRON_STATS || '0 * * * *',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.API_RATE_LIMIT_MAX) || 100,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/job-aggregator.log',
  },
};

module.exports = config;
