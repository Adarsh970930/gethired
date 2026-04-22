const Joi = require('joi');

/**
 * Validation schemas for API requests
 */
const schemas = {
    // Job search/filter query params
    jobSearch: Joi.object({
        q: Joi.string().max(200).allow(''),
        jobType: Joi.string().valid('internship', 'full-time', 'part-time', 'contract', 'freelance'),
        experienceLevel: Joi.string().valid('fresher', 'junior', 'mid', 'senior', 'lead', 'executive'),
        category: Joi.string().valid(
            'engineering', 'design', 'marketing', 'sales', 'finance', 'hr',
            'operations', 'data-science', 'devops', 'product', 'customer-support',
            'writing', 'legal', 'healthcare', 'education', 'other'
        ),
        location: Joi.string().max(100).allow(''),
        remote: Joi.string().valid('true', 'false'),
        salaryMin: Joi.number().integer().min(0),
        salaryMax: Joi.number().integer().min(0),
        skills: Joi.string().max(500).allow(''),
        postedWithin: Joi.number().integer().min(1).max(365),
        company: Joi.string().max(100).allow(''),
        sort: Joi.string().valid('newest', 'oldest', 'salary_high', 'salary_low', 'relevant', 'company'),
        isInternational: Joi.alternatives().try(Joi.string().valid('true', 'false'), Joi.boolean()),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
    }),

    // Job ID param
    jobId: Joi.object({
        id: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/),
    }),

    // Sync source param
    syncSource: Joi.object({
        source: Joi.string().required().valid(
            'adzuna', 'remotive', 'arbeitnow', 'themuse', 'remoteok', 'jsearch'
        ),
    }),
};

/**
 * Middleware factory for validating request data
 */
function validate(schemaName, property = 'query') {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return next(new Error(`Unknown validation schema: ${schemaName}`));
        }

        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
            });
        }

        // Replace with validated & sanitized values
        req[property] = value;
        next();
    };
}

module.exports = { validate, schemas };
