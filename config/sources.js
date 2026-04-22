/**
 * Job Source Configurations
 * Each source defines how to connect and what jobs to fetch
 */

const sources = {
    adzuna: {
        name: 'adzuna',
        displayName: 'Adzuna',
        type: 'api',
        baseUrl: 'https://api.adzuna.com/v1/api/jobs',
        isActive: true,
        rateLimit: {
            maxRequests: 250,
            perSeconds: 86400, // per day
        },
        supportedCategories: ['internship', 'full-time', 'part-time', 'contract'],
        supportedCountries: ['in', 'us', 'gb', 'au', 'ca', 'de', 'fr'],
        description: 'Global job search engine with strong India coverage',
    },

    remotive: {
        name: 'remotive',
        displayName: 'Remotive',
        type: 'api',
        baseUrl: 'https://remotive.com/api/remote-jobs',
        isActive: true,
        requiresAuth: false,
        rateLimit: {
            maxRequests: 100,
            perSeconds: 3600, // per hour
        },
        supportedCategories: ['full-time', 'contract'],
        description: 'Remote job listings from top companies',
    },

    arbeitnow: {
        name: 'arbeitnow',
        displayName: 'Arbeitnow',
        type: 'api',
        baseUrl: 'https://www.arbeitnow.com/api/job-board-api',
        isActive: true,
        requiresAuth: false,
        rateLimit: {
            maxRequests: 60,
            perSeconds: 3600,
        },
        supportedCategories: ['full-time', 'part-time', 'internship'],
        description: 'European & global job board with free API',
    },

    themuse: {
        name: 'themuse',
        displayName: 'The Muse',
        type: 'api',
        baseUrl: 'https://www.themuse.com/api/public/jobs',
        isActive: true,
        requiresAuth: false,
        rateLimit: {
            maxRequests: 500,
            perSeconds: 3600,
        },
        supportedCategories: ['full-time', 'internship'],
        description: 'Jobs from verified companies with company profiles',
    },

    remoteok: {
        name: 'remoteok',
        displayName: 'RemoteOK',
        type: 'api',
        baseUrl: 'https://remoteok.com/api',
        isActive: true,
        requiresAuth: false,
        rateLimit: {
            maxRequests: 60,
            perSeconds: 3600,
        },
        supportedCategories: ['full-time', 'contract'],
        description: 'Remote-first job board',
    },

    jsearch: {
        name: 'jsearch',
        displayName: 'JSearch',
        type: 'api',
        baseUrl: 'https://jsearch.p.rapidapi.com',
        isActive: true,
        requiresAuth: true,
        rateLimit: {
            maxRequests: 500,
            perSeconds: 2592000, // per month
        },
        supportedCategories: ['internship', 'full-time', 'part-time', 'contract'],
        description: 'Aggregated job search via RapidAPI with global coverage',
    },
};

/**
 * Default search queries to run for each job category
 * These ensure we get diverse results across categories
 */
const defaultSearchQueries = {
    // India-focused queries
    india: [
        'software developer india',
        'engineer bangalore',
        'developer mumbai',
        'software engineer hyderabad',
        'developer pune',
        'engineer delhi',
        'software chennai',
        'react developer india',
        'python developer india',
        'java developer india',
        'data analyst india',
        'devops engineer india',
        'full stack developer india',
    ],
    // WITCH companies
    witch: [
        'wipro',
        'infosys',
        'tcs',
        'cognizant',
        'hcl technologies',
    ],
    // FAANG & Big Tech
    faang: [
        'google',
        'amazon',
        'microsoft',
        'apple',
        'meta',
        'netflix',
    ],
    // Indian startups
    startups: [
        'flipkart',
        'swiggy',
        'razorpay',
        'zerodha',
        'cred',
        'phonepe',
        'zomato',
        'ola',
        'meesho',
        'byju',
    ],
    // Fresher & intern
    fresher: [
        'fresher software engineer',
        'entry level developer',
        'junior developer',
        'graduate trainee',
        'campus placement',
        'associate engineer',
        'software intern',
        'data science intern',
        'web development intern',
    ],
    // Experienced & abroad
    experienced: [
        'senior software engineer',
        'lead developer',
        'software architect',
        'engineering manager',
        'senior data scientist',
        'principal engineer',
    ],
    // Remote / global
    remote: [
        'remote developer',
        'remote engineer',
        'remote india',
        'work from home developer',
    ],
};

module.exports = { sources, defaultSearchQueries };
