const BaseScraper = require('./BaseScraper');
const logger = require('../utils/logger');
const {
    generateFingerprint,
    generateSlug,
    extractShortDescription,
    detectCategory,
    detectExperienceLevel,
    detectJobType,
    extractSkills,
    cleanHtml,
} = require('../utils/helpers');

/**
 * Arbeitnow API Scraper
 * API Docs: https://www.arbeitnow.com/api/job-board-api
 * 
 * Free, no auth required
 * Supports pagination
 */
class ArbeitnowScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('arbeitnow', sourceConfig);
    }

    /**
     * Fetch jobs from Arbeitnow API
     */
    async fetchJobs(query = '', options = {}) {
        const { maxPages = this.maxPages } = options;
        const allJobs = [];

        try {
            for (let page = 1; page <= maxPages; page++) {
                const url = `${this.baseUrl}`;
                const params = { page };

                const data = await this.get(url, params);

                if (!data || !data.data || data.data.length === 0) {
                    logger.info(`[arbeitnow] No more results at page ${page}`);
                    break;
                }

                // Filter by query if provided
                let jobs = data.data;
                if (query) {
                    const q = query.toLowerCase();
                    jobs = jobs.filter(job =>
                        (job.title || '').toLowerCase().includes(q) ||
                        (job.description || '').toLowerCase().includes(q) ||
                        (job.company_name || '').toLowerCase().includes(q)
                    );
                }

                const normalizedJobs = jobs.map(job => this.normalizeJob(job));
                allJobs.push(...normalizedJobs);

                logger.info(`[arbeitnow] Page ${page}: ${jobs.length} jobs (${normalizedJobs.length} matched)`);

                // Check if there are more pages
                if (!data.links || !data.links.next) break;
            }
        } catch (error) {
            logger.error(`[arbeitnow] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Normalize Arbeitnow job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.title || '';
        const companyName = rawJob.company_name || 'Unknown';
        const description = cleanHtml(rawJob.description || '');
        const locationStr = rawJob.location || '';
        const isRemote = rawJob.remote === true || (locationStr && locationStr.toLowerCase().includes('remote'));

        return {
            title,
            company: {
                name: companyName,
                logo: '',
                website: rawJob.url || '',
                verified: false,
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType: detectJobType(title, description),
            experienceLevel: detectExperienceLevel(title, description),
            category: detectCategory(title, description),
            location: {
                city: locationStr.split(',')[0]?.trim() || '',
                state: locationStr.split(',')[1]?.trim() || '',
                country: locationStr.split(',').pop()?.trim() || '',
                remote: isRemote,
                hybrid: false,
            },
            salary: {
                min: 0,
                max: 0,
                currency: 'EUR',
                period: 'yearly',
            },
            source: {
                name: 'arbeitnow',
                url: rawJob.url || '',
                externalId: rawJob.slug || '',
                fetchedAt: new Date(),
            },
            skills: [
                ...extractSkills(title, description),
                ...(rawJob.tags || []),
            ],
            postedDate: rawJob.created_at ? new Date(rawJob.created_at * 1000) : new Date(),
            tags: rawJob.tags || [],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.url || '',
            isActive: true,
            fingerprint: generateFingerprint(title, companyName, locationStr),
        };
    }
}

module.exports = ArbeitnowScraper;
