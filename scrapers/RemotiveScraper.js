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
 * Remotive API Scraper
 * API Docs: https://remotive.com/api/remote-jobs (No auth needed!)
 * 
 * Remote-only jobs from top companies
 * Categories: software-dev, design, marketing, customer-support, etc.
 */
class RemotiveScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('remotive', sourceConfig);
    }

    /**
     * Fetch remote jobs from Remotive API
     */
    async fetchJobs(query = '', options = {}) {
        const { category: remotiveCategory, limit = 100 } = options;
        const allJobs = [];

        try {
            const params = {};
            if (query) params.search = query;
            if (remotiveCategory) params.category = remotiveCategory;
            if (limit) params.limit = limit;

            const data = await this.get(this.baseUrl, params);

            if (!data || !data.jobs || data.jobs.length === 0) {
                logger.info('[remotive] No jobs found');
                return [];
            }

            const normalizedJobs = data.jobs.map(job => this.normalizeJob(job));
            allJobs.push(...normalizedJobs);

            logger.info(`[remotive] Fetched ${allJobs.length} jobs`);
        } catch (error) {
            logger.error(`[remotive] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Fetch jobs by Remotive categories
     */
    async fetchAllCategories() {
        const categories = [
            'software-dev',
            'design',
            'marketing',
            'customer-support',
            'data',
            'devops-sysadmin',
            'product',
            'business',
            'finance-legal',
            'hr',
            'writing',
            'qa',
        ];

        const allJobs = [];
        for (const cat of categories) {
            try {
                const jobs = await this.fetchJobs('', { category: cat });
                allJobs.push(...jobs);
            } catch (error) {
                logger.error(`[remotive] Error fetching category ${cat}: ${error.message}`);
            }
        }

        return allJobs;
    }

    /**
     * Normalize Remotive job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.title || '';
        const companyName = rawJob.company_name || 'Unknown';
        const description = cleanHtml(rawJob.description || '');
        const locationStr = rawJob.candidate_required_location || 'Remote';

        return {
            title,
            company: {
                name: companyName,
                logo: rawJob.company_logo || '',
                website: rawJob.company_logo_url || '',
                verified: false,
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType: detectJobType(title, description, {
                jobType: rawJob.job_type ? this.mapJobType(rawJob.job_type) : null,
            }),
            experienceLevel: detectExperienceLevel(title, description),
            category: rawJob.category ? this.mapCategory(rawJob.category) : detectCategory(title, description),
            location: {
                city: '',
                state: '',
                country: locationStr,
                remote: true,
                hybrid: false,
            },
            salary: {
                min: rawJob.salary ? this.extractSalaryMin(rawJob.salary) : 0,
                max: rawJob.salary ? this.extractSalaryMax(rawJob.salary) : 0,
                currency: 'USD',
                period: 'yearly',
            },
            source: {
                name: 'remotive',
                url: rawJob.url || '',
                externalId: rawJob.id ? rawJob.id.toString() : '',
                fetchedAt: new Date(),
            },
            skills: extractSkills(title, description),
            postedDate: rawJob.publication_date ? new Date(rawJob.publication_date) : new Date(),
            tags: rawJob.tags || [],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.url || '',
            isActive: true,
            fingerprint: generateFingerprint(title, companyName, locationStr),
        };
    }

    mapCategory(remotiveCategory) {
        const map = {
            'software-dev': 'engineering',
            'design': 'design',
            'marketing': 'marketing',
            'customer-support': 'customer-support',
            'data': 'data-science',
            'devops-sysadmin': 'devops',
            'product': 'product',
            'business': 'operations',
            'finance-legal': 'finance',
            'hr': 'hr',
            'writing': 'writing',
            'qa': 'engineering',
        };
        return map[remotiveCategory] || 'other';
    }

    mapJobType(type) {
        const map = {
            'full_time': 'full-time',
            'contract': 'contract',
            'part_time': 'part-time',
            'freelance': 'freelance',
            'internship': 'internship',
            'other': 'full-time',
        };
        return map[type] || 'full-time';
    }

    extractSalaryMin(salaryStr) {
        if (!salaryStr) return 0;
        const numbers = salaryStr.replace(/[^0-9.-]/g, ' ').trim().split(/\s+/);
        return numbers[0] ? parseInt(numbers[0]) : 0;
    }

    extractSalaryMax(salaryStr) {
        if (!salaryStr) return 0;
        const numbers = salaryStr.replace(/[^0-9.-]/g, ' ').trim().split(/\s+/);
        return numbers.length > 1 ? parseInt(numbers[1]) : (numbers[0] ? parseInt(numbers[0]) : 0);
    }
}

module.exports = RemotiveScraper;
