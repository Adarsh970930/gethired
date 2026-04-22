const BaseScraper = require('./BaseScraper');
const logger = require('../utils/logger');
const {
    generateFingerprint,
    generateSlug,
    extractShortDescription,
    detectCategory,
    detectExperienceLevel,
    extractSkills,
    cleanHtml,
} = require('../utils/helpers');

/**
 * RemoteOK API Scraper
 * API: https://remoteok.com/api
 * 
 * Completely free, no auth needed
 * Returns JSON feed of remote jobs
 */
class RemoteOKScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('remoteok', sourceConfig);
    }

    /**
     * Fetch jobs from RemoteOK API
     */
    async fetchJobs(query = '', options = {}) {
        const allJobs = [];

        try {
            // RemoteOK returns all jobs in a single request
            // First element is a legal notice, skip it
            const data = await this.get(this.baseUrl, {}, {
                'User-Agent': 'JobAggregator/1.0 (contact@yourjobportal.com)',
            });

            if (!data || !Array.isArray(data)) {
                logger.info('[remoteok] No data returned');
                return [];
            }

            // First element is usually a legal/info block, skip it
            let jobs = data.filter(item => item.id && item.position);

            // Filter by query if provided
            if (query) {
                const q = query.toLowerCase();
                jobs = jobs.filter(job =>
                    (job.position || '').toLowerCase().includes(q) ||
                    (job.description || '').toLowerCase().includes(q) ||
                    (job.company || '').toLowerCase().includes(q) ||
                    (job.tags || []).some(tag => tag.toLowerCase().includes(q))
                );
            }

            const normalizedJobs = jobs.map(job => this.normalizeJob(job));
            allJobs.push(...normalizedJobs);

            logger.info(`[remoteok] Fetched ${allJobs.length} jobs`);
        } catch (error) {
            logger.error(`[remoteok] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Normalize RemoteOK job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.position || '';
        const companyName = rawJob.company || 'Unknown';
        const description = cleanHtml(rawJob.description || '');
        const locationStr = rawJob.location || 'Remote, Worldwide';

        // Parse salary from RemoteOK format
        let salaryMin = 0;
        let salaryMax = 0;
        if (rawJob.salary_min) salaryMin = parseInt(rawJob.salary_min);
        if (rawJob.salary_max) salaryMax = parseInt(rawJob.salary_max);

        return {
            title,
            company: {
                name: companyName,
                logo: rawJob.company_logo || rawJob.logo || '',
                website: rawJob.company_url || '',
                verified: false,
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType: rawJob.position?.toLowerCase().includes('intern') ? 'internship' : 'full-time',
            experienceLevel: detectExperienceLevel(title, description),
            category: detectCategory(title, description),
            location: {
                city: '',
                state: '',
                country: locationStr,
                remote: true,
                hybrid: false,
            },
            salary: {
                min: salaryMin,
                max: salaryMax,
                currency: 'USD',
                period: 'yearly',
            },
            source: {
                name: 'remoteok',
                url: rawJob.url ? `https://remoteok.com${rawJob.url}` : '',
                externalId: rawJob.id ? rawJob.id.toString() : '',
                fetchedAt: new Date(),
            },
            skills: [
                ...extractSkills(title, description),
                ...(rawJob.tags || []),
            ],
            postedDate: rawJob.date ? new Date(rawJob.date) : new Date(),
            tags: rawJob.tags || [],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.apply_url || rawJob.url ? `https://remoteok.com${rawJob.url}` : '',
            isActive: true,
            fingerprint: generateFingerprint(title, companyName, 'Remote'),
        };
    }
}

module.exports = RemoteOKScraper;
