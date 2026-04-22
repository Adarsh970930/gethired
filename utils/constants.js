/**
 * Constants & Enums for Job Aggregator
 */

const JOB_TYPES = {
    INTERNSHIP: 'internship',
    FULL_TIME: 'full-time',
    PART_TIME: 'part-time',
    CONTRACT: 'contract',
    FREELANCE: 'freelance',
};

const EXPERIENCE_LEVELS = {
    FRESHER: 'fresher',
    JUNIOR: 'junior',
    MID: 'mid',
    SENIOR: 'senior',
    LEAD: 'lead',
    EXECUTIVE: 'executive',
};

const JOB_CATEGORIES = {
    ENGINEERING: 'engineering',
    DESIGN: 'design',
    MARKETING: 'marketing',
    SALES: 'sales',
    FINANCE: 'finance',
    HR: 'hr',
    OPERATIONS: 'operations',
    DATA_SCIENCE: 'data-science',
    DEVOPS: 'devops',
    PRODUCT: 'product',
    CUSTOMER_SUPPORT: 'customer-support',
    WRITING: 'writing',
    LEGAL: 'legal',
    HEALTHCARE: 'healthcare',
    EDUCATION: 'education',
    OTHER: 'other',
};

const SALARY_PERIODS = {
    HOURLY: 'hourly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
};

const SYNC_STATUS = {
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PARTIAL: 'partial',
};

const SORT_OPTIONS = {
    NEWEST: 'newest',
    OLDEST: 'oldest',
    SALARY_HIGH: 'salary_high',
    SALARY_LOW: 'salary_low',
    RELEVANT: 'relevant',
    COMPANY: 'company',
};

/**
 * Keywords used for auto-categorization of jobs
 */
const CATEGORY_KEYWORDS = {
    engineering: [
        'software', 'developer', 'engineer', 'programming', 'coding',
        'backend', 'frontend', 'fullstack', 'full-stack', 'full stack',
        'web developer', 'mobile developer', 'app developer', 'java',
        'python', 'javascript', 'react', 'angular', 'vue', 'node',
        'golang', 'rust', 'c++', 'c#', '.net', 'php', 'ruby',
        'ios developer', 'android developer', 'flutter', 'react native',
        'embedded', 'firmware', 'systems engineer', 'qa engineer',
        'test engineer', 'automation engineer', 'sre', 'platform engineer',
    ],
    design: [
        'designer', 'ui/ux', 'ux', 'ui', 'graphic design', 'visual design',
        'product design', 'interaction design', 'creative', 'figma',
        'sketch', 'adobe', 'illustrator', 'photoshop', 'brand design',
        'motion design', 'animation', 'art director',
    ],
    'data-science': [
        'data scientist', 'data analyst', 'machine learning', 'ml engineer',
        'ai engineer', 'artificial intelligence', 'deep learning', 'nlp',
        'data engineering', 'analytics', 'business intelligence', 'bi analyst',
        'statistician', 'research scientist', 'computer vision',
    ],
    devops: [
        'devops', 'site reliability', 'sre', 'cloud engineer', 'aws',
        'azure', 'gcp', 'kubernetes', 'docker', 'ci/cd', 'infrastructure',
        'platform engineer', 'systems administrator', 'network engineer',
        'security engineer', 'devsecops',
    ],
    marketing: [
        'marketing', 'seo', 'sem', 'content marketing', 'digital marketing',
        'social media', 'growth', 'brand manager', 'campaign', 'ppc',
        'email marketing', 'marketing manager', 'content strategist',
    ],
    sales: [
        'sales', 'business development', 'account executive', 'account manager',
        'sales representative', 'bdr', 'sdr', 'revenue', 'partnerships',
        'client success', 'customer success',
    ],
    finance: [
        'finance', 'accountant', 'financial analyst', 'controller',
        'treasury', 'audit', 'tax', 'cfo', 'bookkeeper', 'payroll',
        'investment', 'banking',
    ],
    hr: [
        'human resources', 'hr manager', 'recruiter', 'talent acquisition',
        'people operations', 'hr business partner', 'compensation',
        'benefits', 'hrbp',
    ],
    product: [
        'product manager', 'product owner', 'program manager',
        'project manager', 'scrum master', 'agile coach', 'pmo',
        'technical program manager',
    ],
    'customer-support': [
        'customer support', 'customer service', 'help desk', 'support engineer',
        'technical support', 'customer experience',
    ],
    writing: [
        'writer', 'content writer', 'technical writer', 'copywriter',
        'editor', 'journalist', 'documentation', 'blog',
    ],
    operations: [
        'operations', 'logistics', 'supply chain', 'procurement',
        'operations manager', 'office manager', 'administrative',
    ],
};

/**
 * Keywords for experience level detection
 */
const EXPERIENCE_KEYWORDS = {
    fresher: [
        'fresher', 'entry level', 'entry-level', 'graduate', 'trainee',
        'new grad', 'campus', '0-1 year', '0 year', 'no experience',
        'recent graduate', 'early career',
    ],
    junior: [
        'junior', 'jr.', 'jr ', 'associate', '1-2 years', '1-3 years',
        '0-2 years', 'beginner',
    ],
    mid: [
        'mid-level', 'mid level', '3-5 years', '2-5 years', '4-6 years',
        'intermediate',
    ],
    senior: [
        'senior', 'sr.', 'sr ', '5+ years', '5-8 years', '6-10 years',
        '8+ years', 'experienced',
    ],
    lead: [
        'lead', 'principal', 'staff', 'architect', '10+ years', '8-12 years',
        'tech lead', 'team lead',
    ],
    executive: [
        'director', 'vp', 'vice president', 'cto', 'ceo', 'cfo', 'coo',
        'chief', 'head of', 'executive', 'svp',
    ],
};

/**
 * Common tech skills for extraction
 */
const TECH_SKILLS = [
    // Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
    'perl', 'dart', 'elixir', 'haskell', 'lua', 'objective-c',
    // Frontend
    'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs',
    'vue.js', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html',
    'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'material ui',
    'jquery', 'webpack', 'vite', 'redux', 'mobx',
    // Backend
    'node.js', 'nodejs', 'express', 'expressjs', 'django', 'flask',
    'fastapi', 'spring', 'spring boot', '.net', 'asp.net', 'rails',
    'ruby on rails', 'laravel', 'nestjs', 'koa', 'fastify', 'gin',
    // Databases
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'firebase', 'sqlite', 'oracle',
    'sql server', 'mariadb', 'neo4j', 'couchdb',
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
    'terraform', 'ansible', 'jenkins', 'ci/cd', 'github actions',
    'gitlab ci', 'circleci', 'nginx', 'apache', 'linux',
    // Data & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'spark', 'hadoop', 'kafka',
    'airflow', 'tableau', 'power bi', 'databricks',
    // Mobile
    'react native', 'flutter', 'swift', 'swiftui', 'kotlin', 'android',
    'ios', 'xamarin',
    // Tools
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
    'figma', 'sketch', 'postman', 'swagger', 'graphql', 'rest api',
    'grpc', 'websockets', 'rabbitmq', 'celery',
];

module.exports = {
    JOB_TYPES,
    EXPERIENCE_LEVELS,
    JOB_CATEGORIES,
    SALARY_PERIODS,
    SYNC_STATUS,
    SORT_OPTIONS,
    CATEGORY_KEYWORDS,
    EXPERIENCE_KEYWORDS,
    TECH_SKILLS,
};
