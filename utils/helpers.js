const crypto = require('crypto');
const { CATEGORY_KEYWORDS, EXPERIENCE_KEYWORDS, TECH_SKILLS } = require('./constants');

/**
 * Generate a fingerprint hash for duplicate detection
 * Uses title + company + location to create a unique identifier
 */
function generateFingerprint(title, company, location) {
    const normalized = `${(title || '').toLowerCase().trim()}|${(company || '').toLowerCase().trim()}|${(location || '').toLowerCase().trim()}`;
    return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Generate URL-friendly slug from string
 */
function generateSlug(str) {
    return (str || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

/**
 * Extract short description from full description
 */
function extractShortDescription(description, maxLength = 200) {
    if (!description) return '';
    // Remove HTML tags
    const text = description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s\w+$/, '') + '...';
}

/**
 * Auto-detect job category from title and description
 */
function detectCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    let bestMatch = 'other';
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                // Title matches are worth more
                score += title.toLowerCase().includes(keyword) ? 3 : 1;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
        }
    }

    return bestMatch;
}

/**
 * Auto-detect experience level from title and description
 */
function detectExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // Check for internship first
    if (text.includes('intern') || text.includes('internship')) {
        return 'fresher';
    }

    let bestMatch = 'mid'; // default to mid-level
    let bestScore = 0;

    for (const [level, keywords] of Object.entries(EXPERIENCE_KEYWORDS)) {
        let score = 0;
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                score += title.toLowerCase().includes(keyword) ? 3 : 1;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = level;
        }
    }

    return bestMatch;
}

/**
 * Auto-detect job type from title, description and other hints
 */
function detectJobType(title, description, hints = {}) {
    const text = `${title} ${description}`.toLowerCase();

    if (hints.jobType) return hints.jobType;

    if (text.includes('intern') || text.includes('internship')) return 'internship';
    if (text.includes('freelance') || text.includes('freelancer')) return 'freelance';
    if (text.includes('contract') || text.includes('contractor')) return 'contract';
    if (text.includes('part-time') || text.includes('part time')) return 'part-time';

    return 'full-time'; // default
}

/**
 * Extract skills from job description
 */
function extractSkills(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const found = [];

    for (const skill of TECH_SKILLS) {
        // Use word boundary check for short skills to avoid false matches
        if (skill.length <= 3) {
            const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i');
            if (regex.test(text)) {
                found.push(formatSkillName(skill));
            }
        } else {
            if (text.includes(skill)) {
                found.push(formatSkillName(skill));
            }
        }
    }

    // Remove duplicates (e.g., "react" and "reactjs")
    return [...new Set(found)];
}

/**
 * Format skill name properly
 */
function formatSkillName(skill) {
    const skillMap = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'python': 'Python',
        'java': 'Java',
        'c++': 'C++',
        'c#': 'C#',
        'go': 'Go',
        'golang': 'Go',
        'rust': 'Rust',
        'ruby': 'Ruby',
        'php': 'PHP',
        'swift': 'Swift',
        'kotlin': 'Kotlin',
        'react': 'React',
        'reactjs': 'React',
        'react.js': 'React',
        'angular': 'Angular',
        'angularjs': 'Angular',
        'vue': 'Vue.js',
        'vuejs': 'Vue.js',
        'vue.js': 'Vue.js',
        'svelte': 'Svelte',
        'next.js': 'Next.js',
        'nextjs': 'Next.js',
        'node.js': 'Node.js',
        'nodejs': 'Node.js',
        'express': 'Express.js',
        'expressjs': 'Express.js',
        'django': 'Django',
        'flask': 'Flask',
        'spring': 'Spring',
        'spring boot': 'Spring Boot',
        'mongodb': 'MongoDB',
        'postgresql': 'PostgreSQL',
        'mysql': 'MySQL',
        'redis': 'Redis',
        'elasticsearch': 'Elasticsearch',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'k8s': 'Kubernetes',
        'aws': 'AWS',
        'azure': 'Azure',
        'gcp': 'GCP',
        'google cloud': 'Google Cloud',
        'terraform': 'Terraform',
        'git': 'Git',
        'github': 'GitHub',
        'graphql': 'GraphQL',
        'rest api': 'REST API',
        'machine learning': 'Machine Learning',
        'deep learning': 'Deep Learning',
        'tensorflow': 'TensorFlow',
        'pytorch': 'PyTorch',
        'react native': 'React Native',
        'flutter': 'Flutter',
        'figma': 'Figma',
        'tailwind': 'Tailwind CSS',
        'bootstrap': 'Bootstrap',
        'html': 'HTML',
        'css': 'CSS',
        'sass': 'Sass',
        'scss': 'Sass',
        'redux': 'Redux',
        'firebase': 'Firebase',
        'linux': 'Linux',
        'nginx': 'Nginx',
        'jenkins': 'Jenkins',
        'jira': 'Jira',
        'postman': 'Postman',
        'nestjs': 'NestJS',
        'fastify': 'Fastify',
        'laravel': 'Laravel',
        'rails': 'Ruby on Rails',
        'ruby on rails': 'Ruby on Rails',
        '.net': '.NET',
        'asp.net': 'ASP.NET',
        'kafka': 'Kafka',
        'rabbitmq': 'RabbitMQ',
    };

    return skillMap[skill] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse salary string into structured object
 */
function parseSalary(salaryStr, currency = 'INR') {
    if (!salaryStr) return null;

    const str = salaryStr.toString().toLowerCase().replace(/,/g, '');

    // Try to find numeric values
    const numbers = str.match(/[\d.]+/g);
    if (!numbers || numbers.length === 0) return null;

    let min = parseFloat(numbers[0]);
    let max = numbers.length > 1 ? parseFloat(numbers[1]) : min;

    // Detect multipliers
    if (str.includes('lpa') || str.includes('lakhs') || str.includes('lakh')) {
        min *= 100000;
        max *= 100000;
    } else if (str.includes('k')) {
        min *= 1000;
        max *= 1000;
    } else if (str.includes('cr') || str.includes('crore')) {
        min *= 10000000;
        max *= 10000000;
    }

    // Detect currency
    if (str.includes('$') || str.includes('usd')) currency = 'USD';
    else if (str.includes('€') || str.includes('eur')) currency = 'EUR';
    else if (str.includes('£') || str.includes('gbp')) currency = 'GBP';
    else if (str.includes('₹') || str.includes('inr') || str.includes('rs')) currency = 'INR';

    // Detect period
    let period = 'yearly';
    if (str.includes('hour') || str.includes('/hr')) period = 'hourly';
    else if (str.includes('month') || str.includes('/mo')) period = 'monthly';

    return { min, max, currency, period };
}

/**
 * Parse location string into structured object
 */
function parseLocation(locationStr) {
    if (!locationStr) return { city: '', state: '', country: '', remote: false, hybrid: false };

    const str = locationStr.toLowerCase().trim();

    const remote = str.includes('remote') || str.includes('work from home') || str.includes('wfh');
    const hybrid = str.includes('hybrid');

    // Clean up the string
    let cleaned = str
        .replace(/remote/gi, '')
        .replace(/hybrid/gi, '')
        .replace(/work from home/gi, '')
        .replace(/wfh/gi, '')
        .replace(/[()]/g, '')
        .trim();

    const parts = cleaned.split(',').map(p => p.trim()).filter(Boolean);

    return {
        city: parts[0] ? capitalizeWords(parts[0]) : '',
        state: parts[1] ? capitalizeWords(parts[1]) : '',
        country: parts[2] ? capitalizeWords(parts[2]) : (parts[1] ? capitalizeWords(parts[1]) : ''),
        remote,
        hybrid,
    };
}

/**
 * Capitalize first letter of each word
 */
function capitalizeWords(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelayMs = 1000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
            await sleep(delay);
        }
    }
}

/**
 * Clean HTML from description
 */
function cleanHtml(html) {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li>/gi, '• ')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Validate URL
 */
function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    generateFingerprint,
    generateSlug,
    extractShortDescription,
    detectCategory,
    detectExperienceLevel,
    detectJobType,
    extractSkills,
    parseSalary,
    parseLocation,
    capitalizeWords,
    sleep,
    retryWithBackoff,
    cleanHtml,
    isValidUrl,
};
