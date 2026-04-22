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
    parseLocation,
    cleanHtml,
} = require('../utils/helpers');

/**
 * JSearch API Scraper (via RapidAPI)
 * API Docs: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
 * 
 * Aggregated job search - pulls from Google Jobs, LinkedIn, Indeed, etc.
 * Free tier: 500 requests/month
 * Best for India + global jobs
 */
class JSearchScraper extends BaseScraper {
    constructor(sourceConfig) {
        super('jsearch', sourceConfig);
        this.apiKey = config.apis.jsearch.apiKey;
    }

    /**
     * Check if API key is configured
     */
    isConfigured() {
        return this.apiKey && this.apiKey !== 'your_rapidapi_key';
    }

    /**
     * Fetch jobs from JSearch API
     */
    async fetchJobs(query = 'developer in India', options = {}) {
        if (!this.isConfigured()) {
            logger.warn('[jsearch] API key not configured, skipping...');
            return [];
        }

        const {
            maxPages = Math.min(this.maxPages, 3), // Conservative - limited quota
            datePosted = 'week',
            employmentType,
            remoteOnly = false,
        } = options;

        const allJobs = [];

        try {
            for (let page = 1; page <= maxPages; page++) {
                const url = `${this.baseUrl}/search`;

                const params = {
                    query,
                    page,
                    num_pages: 1,
                    date_posted: datePosted,
                };

                // Optional filters
                if (employmentType) params.employment_types = employmentType;
                if (remoteOnly) params.remote_jobs_only = true;

                const data = await this.get(url, params, {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                });

                if (!data || !data.data || data.data.length === 0) {
                    logger.info(`[jsearch] No more results at page ${page}`);
                    break;
                }

                const normalizedJobs = data.data.map(job => this.normalizeJob(job));
                allJobs.push(...normalizedJobs);

                logger.info(`[jsearch] Page ${page}: ${data.data.length} jobs fetched`);
            }
        } catch (error) {
            logger.error(`[jsearch] Error fetching jobs: ${error.message}`);
        }

        this.logSummary(allJobs.length);
        return allJobs;
    }

    /**
     * Fetch jobs across multiple queries for diversity
     */
    async fetchWithQueries(queries = []) {
        const allJobs = [];

        for (const query of queries) {
            try {
                const jobs = await this.fetchJobs(query, { maxPages: 1 });
                allJobs.push(...jobs);
            } catch (error) {
                logger.error(`[jsearch] Error for query "${query}": ${error.message}`);
            }
        }

        return allJobs;
    }

    /**
     * Normalize JSearch job to unified format
     */
    normalizeJob(rawJob) {
        const title = rawJob.job_title || '';
        const companyName = rawJob.employer_name || 'Unknown';
        const description = cleanHtml(rawJob.job_description || '');
        const city = rawJob.job_city || '';
        const state = rawJob.job_state || '';
        const country = rawJob.job_country || '';
        const locationStr = [city, state, country].filter(Boolean).join(', ');
        const isRemote = rawJob.job_is_remote === true;

        // Salary
        let salaryMin = 0;
        let salaryMax = 0;
        let salaryCurrency = 'USD';
        let salaryPeriod = 'yearly';

        if (rawJob.job_min_salary) salaryMin = rawJob.job_min_salary;
        if (rawJob.job_max_salary) salaryMax = rawJob.job_max_salary;
        if (rawJob.job_salary_currency) salaryCurrency = rawJob.job_salary_currency;
        if (rawJob.job_salary_period) {
            salaryPeriod = rawJob.job_salary_period === 'HOUR' ? 'hourly' :
                rawJob.job_salary_period === 'MONTH' ? 'monthly' : 'yearly';
        }

        // Employment type mapping
        let jobType = detectJobType(title, description);
        if (rawJob.job_employment_type) {
            const typeMap = {
                'FULLTIME': 'full-time',
                'PARTTIME': 'part-time',
                'CONTRACTOR': 'contract',
                'INTERN': 'internship',
                'TEMPORARY': 'contract',
            };
            jobType = typeMap[rawJob.job_employment_type] || jobType;
        }

        // Experience
        let expMin = 0;
        let expMax = 0;
        if (rawJob.job_required_experience) {
            if (rawJob.job_required_experience.required_experience_in_months) {
                expMin = Math.floor(rawJob.job_required_experience.required_experience_in_months / 12);
            }
            if (rawJob.job_required_experience.no_experience_required) {
                expMin = 0;
            }
        }

        // Education
        let education = '';
        if (rawJob.job_required_education) {
            education = rawJob.job_required_education.postgraduate_degree ? 'Post Graduate' :
                rawJob.job_required_education.professional_certification ? 'Professional Certification' :
                    rawJob.job_required_education.associates_degree ? 'Associate Degree' :
                        rawJob.job_required_education.bachelors_degree ? 'Bachelor\'s Degree' :
                            rawJob.job_required_education.high_school ? 'High School' : '';
        }

        // Skills from qualifications
        let skills = extractSkills(title, description);
        if (rawJob.job_required_skills) {
            skills = [...skills, ...rawJob.job_required_skills];
        }

        return {
            title,
            company: {
                name: companyName,
                logo: rawJob.employer_logo || '',
                website: rawJob.employer_website || '',
                verified: rawJob.employer_company_type ? true : false,
            },
            description,
            shortDescription: extractShortDescription(description),
            jobType,
            experienceLevel: detectExperienceLevel(title, description),
            category: detectCategory(title, description),
            location: {
                city,
                state,
                country,
                remote: isRemote,
                hybrid: false,
            },
            salary: {
                min: salaryMin,
                max: salaryMax,
                currency: salaryCurrency,
                period: salaryPeriod,
            },
            source: {
                name: 'jsearch',
                url: rawJob.job_apply_link || '',
                externalId: rawJob.job_id || '',
                fetchedAt: new Date(),
            },
            skills: [...new Set(skills)],
            education,
            experience: {
                min: expMin,
                max: expMax,
            },
            postedDate: rawJob.job_posted_at_datetime_utc
                ? new Date(rawJob.job_posted_at_datetime_utc)
                : new Date(),
            expiryDate: rawJob.job_offer_expiration_datetime_utc
                ? new Date(rawJob.job_offer_expiration_datetime_utc)
                : null,
            tags: rawJob.job_required_skills || [],
            slug: generateSlug(`${title}-${companyName}`),
            applyUrl: rawJob.job_apply_link || rawJob.job_google_link || '',
            isActive: !rawJob.job_offer_expiration_datetime_utc ||
                new Date(rawJob.job_offer_expiration_datetime_utc) > new Date(),
            fingerprint: generateFingerprint(title, companyName, locationStr),
        };
    }
}

module.exports = JSearchScraper;
