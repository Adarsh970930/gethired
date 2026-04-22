const mongoose = require('mongoose');
const { JOB_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, SALARY_PERIODS } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        // Company Information
        company: {
            name: { type: String, required: true, trim: true, index: true },
            logo: { type: String, default: '' },
            website: { type: String, default: '' },
            verified: { type: Boolean, default: false },
        },

        // Descriptions
        description: { type: String, default: '' },
        shortDescription: { type: String, default: '' },

        // Job Classification
        jobType: {
            type: String,
            enum: Object.values(JOB_TYPES),
            default: JOB_TYPES.FULL_TIME,
            index: true,
        },
        experienceLevel: {
            type: String,
            enum: Object.values(EXPERIENCE_LEVELS),
            default: EXPERIENCE_LEVELS.MID,
            index: true,
        },
        category: {
            type: String,
            enum: Object.values(JOB_CATEGORIES),
            default: JOB_CATEGORIES.OTHER,
            index: true,
        },

        // Location
        location: {
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
            remote: { type: Boolean, default: false, index: true },
            hybrid: { type: Boolean, default: false },
        },
        isInternational: { type: Boolean, default: false, index: true },

        // Salary
        salary: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            currency: { type: String, default: 'INR' },
            period: {
                type: String,
                enum: Object.values(SALARY_PERIODS),
                default: SALARY_PERIODS.YEARLY,
            },
        },

        // Source Information
        source: {
            name: { type: String, required: true, index: true },
            url: { type: String, default: '' },
            externalId: { type: String, default: '' },
            fetchedAt: { type: Date, default: Date.now },
        },

        // Requirements
        skills: {
            type: [String],
            default: [],
            index: true,
        },
        education: { type: String, default: '' },
        experience: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },

        // Dates
        postedDate: { type: Date, default: Date.now, index: true },
        expiryDate: { type: Date },

        // Search & Display
        tags: { type: [String], default: [] },
        slug: { type: String, index: true },
        applyUrl: { type: String, default: '' },

        // Status
        isActive: { type: Boolean, default: true, index: true },

        // Duplicate Detection
        fingerprint: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound indexes for common queries
jobSchema.index({ jobType: 1, experienceLevel: 1, isActive: 1 });
jobSchema.index({ category: 1, isActive: 1 });
jobSchema.index({ 'location.remote': 1, isActive: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ postedDate: -1 });
jobSchema.index({ 'company.name': 1, isActive: 1 });

// Text index for full-text search
jobSchema.index({
    title: 'text',
    'company.name': 'text',
    description: 'text',
    skills: 'text',
    tags: 'text',
}, {
    weights: {
        title: 10,
        'company.name': 5,
        skills: 3,
        tags: 2,
        description: 1,
    },
});

// Virtual for formatted salary
jobSchema.virtual('salaryFormatted').get(function () {
    if (!this.salary || (!this.salary.min && !this.salary.max)) return 'Not disclosed';

    const formatNum = (n) => {
        if (n >= 10000000) return `${(n / 10000000).toFixed(1)} Cr`;
        if (n >= 100000) return `${(n / 100000).toFixed(1)} LPA`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toString();
    };

    const curr = this.salary.currency || 'INR';
    const symbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[curr] || curr;

    if (this.salary.min && this.salary.max && this.salary.min !== this.salary.max) {
        return `${symbol}${formatNum(this.salary.min)} - ${symbol}${formatNum(this.salary.max)} ${this.salary.period}`;
    }
    return `${symbol}${formatNum(this.salary.min || this.salary.max)} ${this.salary.period}`;
});

// Static method: Find active jobs with filters
jobSchema.statics.findWithFilters = async function (filters = {}, options = {}) {
    const {
        q,
        jobType,
        experienceLevel,
        category,
        location,
        remote,
        salaryMin,
        salaryMax,
        skills,
        postedWithin,
        company,
    } = filters;

    const {
        page = 1,
        limit = 20,
        sort = 'newest',
    } = options;

    const query = { isActive: true };

    // Text search
    if (q) {
        query.$text = { $search: q };
    }

    // Enum filters
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (category) query.category = category;

    // Location
    if (location) {
        query.$or = [
            { 'location.city': new RegExp(location, 'i') },
            { 'location.state': new RegExp(location, 'i') },
            { 'location.country': new RegExp(location, 'i') },
        ];
    }

    // Remote
    if (remote === true || remote === 'true') {
        query['location.remote'] = true;
    }

    // International Toggle
    if (filters.isInternational === true || filters.isInternational === 'true') {
        query.isInternational = true;
    } else {
        // Default: Show India/Remote (non-international)
        // If user wants EVERYTHING, they can pass 'all' but for now let's stick to toggle behavior
        query.isInternational = { $ne: true };
    }

    // Salary range
    if (salaryMin) query['salary.max'] = { $gte: parseInt(salaryMin) };
    if (salaryMax) query['salary.min'] = { $lte: parseInt(salaryMax) };

    // Skills (match any)
    if (skills) {
        const skillArr = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        query.skills = { $in: skillArr.map(s => new RegExp(s, 'i')) };
    }

    // Posted within X days
    if (postedWithin) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(postedWithin));
        query.postedDate = { $gte: daysAgo };
    }

    // Company
    if (company) {
        query['company.name'] = new RegExp(company, 'i');
    }

    // Sort options
    let sortObj = {};
    switch (sort) {
        case 'newest':
            sortObj = { postedDate: -1 };
            break;
        case 'oldest':
            sortObj = { postedDate: 1 };
            break;
        case 'salary_high':
            sortObj = { 'salary.max': -1 };
            break;
        case 'salary_low':
            sortObj = { 'salary.min': 1 };
            break;
        case 'relevant':
            if (q) sortObj = { score: { $meta: 'textScore' } };
            else sortObj = { postedDate: -1 };
            break;
        case 'company':
            sortObj = { 'company.name': 1 };
            break;
        default:
            sortObj = { postedDate: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
        this.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-description') // Exclude full description in list view
            .lean(),
        this.countDocuments(query),
    ]);

    return {
        jobs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1,
        },
    };
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
