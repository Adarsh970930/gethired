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
 * The Muse API Scraper
 * API Docs: https://www.themuse.com/developers/api/v2
 * 
 * Free to use, no auth required for basic access
 * Great for company profiles and verified companies
 */
class TheMuseScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('themuse', sourceConfig);
    }

    /**
     * Fetch jobs from The Muse API
     */
    async fetchJobs(query = '', options = {}) {
        const {
            maxPages = this.maxPages,
            category,
            level,
            location,
        } = options;

        const allJobs = [];

        try {
            for (let page = 0; page < maxPages; page++) {
                const params = {
                    page,
                    api_key: '', // Empty string for public access
                };

                // Add filters
                if (category) params.category = category;
                if (level) params.level = level;
                if (location) params.location = location;

                const data = await this.get(this.baseUrl, params);

                if (!data || !data.results || data.results.length === 0) {
                    logger.info(`[themuse] No more results at page ${page}`);
                    break;
                }

                // Filter by query if provided
                let jobs = data.results;
                if (query) {
                    const q = query.toLowerCase();
                    jobs = jobs.filter(job =>
                        (job.name || '').toLowerCase().includes(q) ||
                        (job.contents || '').toLowerCase().includes(q) ||
                        (job.company?.name || '').toLowerCase().includes(q)
                    );
                }

                const normalizedJobs = jobs.map(job => this.normalizeJob(job));
                allJobs.push(...normalizedJobs);

                logger.info(`[themuse] Page ${page}: ${jobs.length} jobs fetched`);

                // Check if there are more pages
                if (data.page_count && page >= data.page_count - 1) break;
            }
        } catch (error) {
            logger.error(`[themuse] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Fetch by experience levels for diverse results
     */
    async fetchByLevels() {
        const levels = [
            'Internship',
            'Entry Level',
            'Mid Level',
            'Senior Level',
            'Management',
        ];

        const allJobs = [];
        for (const level of levels) {
            try {
                const jobs = await this.fetchJobs('', { level, maxPages: 2 });
                allJobs.push(...jobs);
            } catch (error) {
                logger.error(`[themuse] Error fetching level ${level}: ${error.message}`);
            }
        }

        return allJobs;
    }

    /**
     * Normalize The Muse job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.name || '';
        const companyName = rawJob.company?.name || 'Unknown';
        const description = cleanHtml(rawJob.contents || '');

        // Extract location from locations array
        const locations = rawJob.locations || [];
        const locationStr = locations.map(l => l.name).join(', ') || '';
        const isRemote = locations.some(l => (l.name || '').toLowerCase().includes('remote')) ||
            (rawJob.name || '').toLowerCase().includes('remote');

        // Map The Muse levels to our levels
        const experienceLevel = this.mapLevel(rawJob.levels);

        // Determine job type
        let jobType = 'full-time';
        if (rawJob.levels && rawJob.levels.some(l => l.name === 'Internship')) {
            jobType = 'internship';
        }

        return {
            title,
            company: {
                name: companyName,
                logo: rawJob.company?.logo || '',
                website: '',
                verified: true, // The Muse has verified companies
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType,
            experienceLevel,
            category: rawJob.categories?.length
                ? this.mapCategory(rawJob.categories[0].name)
                : detectCategory(title, description),
            location: {
                city: locations[0]?.name?.split(',')[0]?.trim() || '',
                state: locations[0]?.name?.split(',')[1]?.trim() || '',
                country: locations[0]?.name?.split(',').pop()?.trim() || '',
                remote: isRemote,
                hybrid: false,
            },
            salary: {
                min: 0,
                max: 0,
                currency: 'USD',
                period: 'yearly',
            },
            source: {
                name: 'themuse',
                url: rawJob.refs?.landing_page || '',
                externalId: rawJob.id ? rawJob.id.toString() : '',
                fetchedAt: new Date(),
            },
            skills: extractSkills(title, description),
            postedDate: rawJob.publication_date ? new Date(rawJob.publication_date) : new Date(),
            tags: [
                ...(rawJob.categories || []).map(c => c.name),
                ...(rawJob.levels || []).map(l => l.name),
            ],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.refs?.landing_page || '',
            isActive: true,
            fingerprint: generateFingerprint(title, companyName, locationStr),
        };
    }

    mapLevel(levels) {
        if (!levels || levels.length === 0) return 'mid';
        const levelName = levels[0].name || '';
        const map = {
            'Internship': 'fresher',
            'Entry Level': 'fresher',
            'Mid Level': 'mid',
            'Senior Level': 'senior',
            'Management': 'lead',
        };
        return map[levelName] || 'mid';
    }

    mapCategory(categoryName) {
        const map = {
            'Software Engineering': 'engineering',
            'Design & UX': 'design',
            'Data Science': 'data-science',
            'Marketing': 'marketing',
            'Sales': 'sales',
            'Finance': 'finance',
            'Human Resources': 'hr',
            'Customer Service': 'customer-support',
            'Project Management': 'product',
            'Operations': 'operations',
            'Education': 'education',
            'Healthcare': 'healthcare',
            'Legal': 'legal',
            'Writing': 'writing',
        };
        return map[categoryName] || 'other';
    }
}

module.exports = TheMuseScraper;
