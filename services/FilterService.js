const Job = require('../models/Job');
const logger = require('../utils/logger');

/**
 * FilterService
 * Advanced filtering, search, and aggregation for jobs
 */
class FilterService {
    /**
     * Get all available filter options (for frontend dropdowns)
     */
    static async getFilterOptions() {
        try {
            const [
                jobTypes,
                experienceLevels,
                categories,
                locations,
                companies,
                skillCounts,
            ] = await Promise.all([
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$jobType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$category', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                Job.aggregate([
                    { $match: { isActive: true, 'location.city': { $ne: '' } } },
                    { $group: { _id: '$location.city', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 50 },
                ]),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$company.name', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 50 },
                ]),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $unwind: '$skills' },
                    { $group: { _id: '$skills', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 30 },
                ]),
            ]);

            return {
                jobTypes: jobTypes.map(j => ({ value: j._id, label: j._id, count: j.count })),
                experienceLevels: experienceLevels.map(e => ({ value: e._id, label: e._id, count: e.count })),
                categories: categories.map(c => ({ value: c._id, label: c._id, count: c.count })),
                locations: locations.map(l => ({ value: l._id, label: l._id, count: l.count })),
                companies: companies.map(c => ({ value: c._id, label: c._id, count: c.count })),
                trendingSkills: skillCounts.map(s => ({ value: s._id, label: s._id, count: s.count })),
            };
        } catch (error) {
            logger.error('Error getting filter options:', error);
            throw error;
        }
    }

    /**
     * Get dashboard statistics
     */
    static async getStats() {
        try {
            const [
                totalJobs,
                activeJobs,
                totalCompanies,
                jobsByType,
                jobsBySource,
                recentJobs,
                remoteJobs,
            ] = await Promise.all([
                Job.countDocuments(),
                Job.countDocuments({ isActive: true }),
                Job.distinct('company.name', { isActive: true }).then(arr => arr.length),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$jobType', count: { $sum: 1 } } },
                ]),
                Job.aggregate([
                    { $match: { isActive: true } },
                    { $group: { _id: '$source.name', count: { $sum: 1 } } },
                ]),
                Job.countDocuments({
                    isActive: true,
                    postedDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                }),
                Job.countDocuments({ isActive: true, 'location.remote': true }),
            ]);

            return {
                totalJobs,
                activeJobs,
                totalCompanies,
                recentJobs,
                remoteJobs,
                jobsByType: Object.fromEntries(jobsByType.map(j => [j._id, j.count])),
                jobsBySource: Object.fromEntries(jobsBySource.map(s => [s._id, s.count])),
            };
        } catch (error) {
            logger.error('Error getting stats:', error);
            throw error;
        }
    }

    /**
     * Get trending skills across all active jobs
     */
    static async getTrendingSkills(limit = 20) {
        try {
            const skills = await Job.aggregate([
                { $match: { isActive: true } },
                { $unwind: '$skills' },
                { $group: { _id: '$skills', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: limit },
            ]);

            return skills.map(s => ({ skill: s._id, count: s.count }));
        } catch (error) {
            logger.error('Error getting trending skills:', error);
            throw error;
        }
    }

    /**
     * Get all unique locations
     */
    static async getLocations() {
        try {
            const cities = await Job.aggregate([
                { $match: { isActive: true, 'location.city': { $ne: '' } } },
                {
                    $group: {
                        _id: {
                            city: '$location.city',
                            state: '$location.state',
                            country: '$location.country',
                        },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 100 },
            ]);

            return cities.map(c => ({
                city: c._id.city,
                state: c._id.state,
                country: c._id.country,
                count: c.count,
                label: [c._id.city, c._id.state, c._id.country].filter(Boolean).join(', '),
            }));
        } catch (error) {
            logger.error('Error getting locations:', error);
            throw error;
        }
    }

    /**
     * Get all categories with job counts
     */
    static async getCategories() {
        try {
            const categories = await Job.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);

            return categories.map(c => ({
                category: c._id,
                count: c.count,
            }));
        } catch (error) {
            logger.error('Error getting categories:', error);
            throw error;
        }
    }
}

module.exports = FilterService;
