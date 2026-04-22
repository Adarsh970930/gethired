const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const FilterService = require('../services/FilterService');
const { validate } = require('../middleware/validator');
const { apiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

// Apply rate limiter to all job routes
router.use(apiLimiter);

/**
 * GET /api/jobs
 * List all active jobs with pagination
 */
router.get('/', validate('jobSearch', 'query'), async (req, res, next) => {
    try {
        const { page, limit, sort, ...filters } = req.query;
        const result = await Job.findWithFilters(filters, { page, limit, sort });

        res.json({
            success: true,
            data: result.jobs,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/search
 * Advanced search with all filters
 */
router.get('/search', validate('jobSearch', 'query'), async (req, res, next) => {
    try {
        const { page, limit, sort, ...filters } = req.query;
        const result = await Job.findWithFilters(filters, { page, limit, sort });

        res.json({
            success: true,
            data: result.jobs,
            pagination: result.pagination,
            filters: filters,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/stats
 * Dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await FilterService.getStats();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/filters
 * Get all available filter options for frontend dropdowns
 */
router.get('/filters', async (req, res, next) => {
    try {
        const options = await FilterService.getFilterOptions();
        res.json({
            success: true,
            data: options,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/categories
 * List all categories with counts
 */
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await FilterService.getCategories();
        res.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/locations
 * List all locations with counts
 */
router.get('/locations', async (req, res, next) => {
    try {
        const locations = await FilterService.getLocations();
        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/skills
 * List trending skills
 */
router.get('/skills', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const skills = await FilterService.getTrendingSkills(limit);
        res.json({
            success: true,
            data: skills,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/:id
 * Get full job details by ID
 */
router.get('/:id', validate('jobId', 'params'), async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found',
            });
        }

        res.json({
            success: true,
            data: job,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/:id/similar
 * Get similar jobs based on title, category, and skills
 */
router.get('/:id/similar', validate('jobId', 'params'), async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id).lean();

        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found',
            });
        }

        // Find similar jobs by category and skills
        const similarJobs = await Job.find({
            _id: { $ne: job._id },
            isActive: true,
            $or: [
                { category: job.category },
                { skills: { $in: job.skills.slice(0, 5) } },
                { 'company.name': job.company.name },
            ],
        })
            .sort({ postedDate: -1 })
            .limit(10)
            .select('-description')
            .lean();

        res.json({
            success: true,
            data: similarJobs,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
