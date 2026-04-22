const AdzunaScraper = require('./AdzunaScraper');
const RemotiveScraper = require('./RemotiveScraper');
const ArbeitnowScraper = require('./ArbeitnowScraper');
const TheMuseScraper = require('./TheMuseScraper');
const RemoteOKScraper = require('./RemoteOKScraper');
const JSearchScraper = require('./JSearchScraper');
const { sources } = require('../config/sources');
const logger = require('../utils/logger');

/**
 * Scraper Registry
 * Maps source names to their scraper classes and creates instances
 */
const scraperClasses = {
    adzuna: AdzunaScraper,
    remotive: RemotiveScraper,
    arbeitnow: ArbeitnowScraper,
    themuse: TheMuseScraper,
    remoteok: RemoteOKScraper,
    jsearch: JSearchScraper,
};

/**
 * Create a scraper instance for a given source
 */
function createScraper(sourceName) {
    const ScraperClass = scraperClasses[sourceName];
    const sourceConfig = sources[sourceName];

    if (!ScraperClass) {
        logger.error(`Unknown scraper: ${sourceName}`);
        return null;
    }

    if (!sourceConfig) {
        logger.error(`No config found for: ${sourceName}`);
        return null;
    }

    if (!sourceConfig.isActive) {
        logger.info(`Scraper ${sourceName} is disabled`);
        return null;
    }

    return new ScraperClass(sourceConfig);
}

/**
 * Create all active scraper instances
 */
function createAllScrapers() {
    const scrapers = {};

    for (const [name, config] of Object.entries(sources)) {
        if (config.isActive) {
            const scraper = createScraper(name);
            if (scraper) {
                scrapers[name] = scraper;
            }
        }
    }

    logger.info(`Initialized ${Object.keys(scrapers).length} scrapers: ${Object.keys(scrapers).join(', ')}`);
    return scrapers;
}

/**
 * Get list of all available source names
 */
function getAvailableSources() {
    return Object.keys(scraperClasses);
}

/**
 * Get list of active source names
 */
function getActiveSources() {
    return Object.entries(sources)
        .filter(([_, config]) => config.isActive)
        .map(([name]) => name);
}

module.exports = {
    scraperClasses,
    createScraper,
    createAllScrapers,
    getAvailableSources,
    getActiveSources,
};
