const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const { sleep, retryWithBackoff } = require('../utils/helpers');

/**
 * BaseScraper - Abstract base class for all job scrapers
 * Every scraper must extend this and implement fetchJobs()
 */
class BaseScraper {
    constructor(sourceName, sourceConfig) {
        this.sourceName = sourceName;
        this.sourceConfig = sourceConfig;
        this.baseUrl = sourceConfig.baseUrl;
        this.requestCount = 0;
        this.maxPages = config.scraper.maxPagesPerSource;
        this.delayMs = config.scraper.requestDelayMs;
        this.timeout = config.scraper.timeout;

        // Axios instance with defaults
        this.http = axios.create({
            timeout: this.timeout,
            headers: {
                'User-Agent': config.scraper.userAgent,
                'Accept': 'application/json',
            },
        });
    }

    /**
     * Must be implemented by child classes
     * Should return an array of normalized job objects
     */
    async fetchJobs(query, options = {}) {
        throw new Error(`fetchJobs() must be implemented by ${this.sourceName} scraper`);
    }

    /**
     * Make an HTTP GET request with rate limiting and retry
     */
    async get(url, params = {}, headers = {}) {
        return retryWithBackoff(async () => {
            // Rate limiting
            this.requestCount++;
            if (this.requestCount > 1) {
                await sleep(this.delayMs);
            }

            logger.debug(`[${this.sourceName}] GET ${url}`, { params });

            try {
                const response = await this.http.get(url, {
                    params,
                    headers: { ...headers },
                });
                return response.data;
            } catch (error) {
                if (error.response) {
                    logger.error(`[${this.sourceName}] HTTP ${error.response.status}: ${url}`, {
                        status: error.response.status,
                        statusText: error.response.statusText,
                    });
                    // Don't retry on 4xx errors (except 429)
                    if (error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
                        throw error;
                    }
                    // Rate limited - wait longer
                    if (error.response.status === 429) {
                        logger.warn(`[${this.sourceName}] Rate limited, waiting 30s...`);
                        await sleep(30000);
                    }
                }
                throw error;
            }
        }, 3, this.delayMs);
    }

    /**
     * Make an HTTP POST request with rate limiting and retry
     */
    async post(url, data = {}, headers = {}) {
        return retryWithBackoff(async () => {
            this.requestCount++;
            if (this.requestCount > 1) {
                await sleep(this.delayMs);
            }

            logger.debug(`[${this.sourceName}] POST ${url}`);

            try {
                const response = await this.http.post(url, data, {
                    headers: { ...headers },
                });
                return response.data;
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    logger.warn(`[${this.sourceName}] Rate limited, waiting 30s...`);
                    await sleep(30000);
                }
                throw error;
            }
        }, 3, this.delayMs);
    }

    /**
     * Get total request count for this session
     */
    getRequestCount() {
        return this.requestCount;
    }

    /**
     * Reset request counter
     */
    resetRequestCount() {
        this.requestCount = 0;
    }

    /**
     * Log summary of fetch
     */
    logSummary(jobsCount) {
        logger.info(`[${this.sourceName}] Fetched ${jobsCount} jobs in ${this.requestCount} requests`);
    }
}

module.exports = BaseScraper;
