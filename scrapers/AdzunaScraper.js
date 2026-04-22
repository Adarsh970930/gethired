const BaseScraper = require('./BaseScraper');
const config = require('../config');
const logger = require('../utils/logger');
const {
    generateFingerprint,
    generateSlug,
    extractShortDescription,
    detectCategory,
    detectExperienceLevel,
    detectJobType,
    extractSkills,
    parseSalary,
    parseLocation,
    cleanHtml,
} = require('../utils/helpers');

/**
 * Adzuna API Scraper
 * API Docs: https://developer.adzuna.com/overview
 * 
 * Supports: India, US, UK, and 7+ countries
 * Free tier: 250 requests/day
 */
class AdzunaScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('adzuna', sourceConfig);
        this.appId = config.apis.adzuna.appId;
        this.appKey = config.apis.adzuna.appKey;
        this.country = config.apis.adzuna.country;
    }

    /**
     * Check if API keys are configured
     */
    isConfigured() {
        return this.appId && this.appKey && this.appId !== 'your_adzuna_app_id';
    }

    /**
     * Fetch jobs from Adzuna API
     */
    async fetchJobs(query = 'developer', options = {}) {
        if (!this.isConfigured()) {
            logger.warn('[adzuna] API keys not configured, skipping...');
            return [];
        }

        const {
            country = this.country,
            page = 1,
            resultsPerPage = 50,
            maxPages = this.maxPages,
            location,
            jobType,
        } = options;

        const allJobs = [];

        try {
            for (let currentPage = page; currentPage <= maxPages; currentPage++) {
                const url = `${this.baseUrl}/${country}/search/${currentPage}`;

                const params = {
                    app_id: this.appId,
                    app_key: this.appKey,
                    results_per_page: resultsPerPage,
                    what: query,
                    content_type: 'application/json',
                };

                // Optional filters
                if (location) params.where = location;
                if (jobType === 'full-time') params.full_time = 1;
                if (jobType === 'part-time') params.part_time = 1;
                if (jobType === 'contract') params.contract = 1;

                const data = await this.get(url, params);

                if (!data || !data.results || data.results.length === 0) {
                    logger.info(`[adzuna] No more results at page ${currentPage}`);
                    break;
                }

                const normalizedJobs = data.results.map(job => this.normalizeJob(job));
                allJobs.push(...normalizedJobs);

                logger.info(`[adzuna] Page ${currentPage}: ${data.results.length} jobs fetched`);

                // Stop if we've gotten all available results
                if (allJobs.length >= (data.count || 0)) break;
            }
        } catch (error) {
            logger.error(`[adzuna] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Normalize Adzuna job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.title || '';
        const companyName = rawJob.company?.display_name || 'Unknown';
        const description = cleanHtml(rawJob.description || '');
        const locationStr = rawJob.location?.display_name || '';

        return {
            title,
            company: {
                name: companyName,
                logo: '',
                website: '',
                verified: false,
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType: detectJobType(title, description, {
                jobType: rawJob.contract_type === 'permanent' ? 'full-time' : rawJob.contract_type,
            }),
            experienceLevel: detectExperienceLevel(title, description),
            category: rawJob.category?.tag ? this.mapAdzunaCategory(rawJob.category.tag) : detectCategory(title, description),
            location: parseLocation(locationStr),
            salary: {
                min: rawJob.salary_min || 0,
                max: rawJob.salary_max || 0,
                currency: this.country === 'in' ? 'INR' : 'USD',
                period: 'yearly',
            },
            source: {
                name: 'adzuna',
                url: rawJob.redirect_url || '',
                externalId: rawJob.id ? rawJob.id.toString() : '',
                fetchedAt: new Date(),
            },
            skills: extractSkills(title, description),
            postedDate: rawJob.created ? new Date(rawJob.created) : new Date(),
            tags: rawJob.category?.label ? [rawJob.category.label] : [],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.redirect_url || '',
            isActive: true,
            fingerprint: generateFingerprint(title, companyName, locationStr),
        };
    }

    /**
     * Map Adzuna's category tags to our categories
     */
    mapAdzunaCategory(tag) {
        const categoryMap = {
            'it-jobs': 'engineering',
            'engineering-jobs': 'engineering',
            'accounting-finance-jobs': 'finance',
            'sales-jobs': 'sales',
            'hr-jobs': 'hr',
            'marketing-jobs': 'marketing',
            'healthcare-nursing-jobs': 'healthcare',
            'teaching-jobs': 'education',
            'legal-jobs': 'legal',
            'creative-design-jobs': 'design',
            'admin-jobs': 'operations',
            'customer-services-jobs': 'customer-support',
            'consultancy-jobs': 'other',
            'logistics-warehouse-jobs': 'operations',
            'manufacturing-jobs': 'operations',
            'trade-construction-jobs': 'other',
            'scientific-qa-jobs': 'engineering',
        };
        return categoryMap[tag] || 'other';
    }
}

module.exports = AdzunaScraper;
