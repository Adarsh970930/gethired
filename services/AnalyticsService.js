const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');

class AnalyticsService {
    /**
     * Get comprehensive analytics dashboard data
     */
    async getDashboardStats() {
        const [
            jobDistribution,
            locationStats,
            dailyGrowth,
            userGrowth
        ] = await Promise.all([
            this.getJobDistribution(),
            this.getLocationStats(),
            this.getDailyGrowth(),
            this.getUserGrowth()
        ]);

        return {
            jobDistribution,
            locationStats,
            dailyGrowth,
            userGrowth
        };
    }

    /**
     * Get job distribution by various facets
     */
    async getJobDistribution() {
        const [bySource, byCategory, byType, byLevel] = await Promise.all([
            Job.aggregate([
                { $group: { _id: '$source.name', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Job.aggregate([
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Job.aggregate([
                { $group: { _id: '$jobType', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Job.aggregate([
                { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        return {
            source: bySource.map(item => ({ name: item._id || 'Unknown', value: item.count })),
            category: byCategory.map(item => ({ name: item._id || 'Uncategorized', value: item.count })),
            jobType: byType.map(item => ({ name: item._id || 'Not Specified', value: item.count })),
            experienceLevel: byLevel.map(item => ({ name: item._id || 'Not Specified', value: item.count }))
        };
    }

    /**
     * Get location-based statistics (focus on India vs International)
     */
    async getLocationStats() {
        const internationalSplit = await Job.aggregate([
            {
                $group: {
                    _id: { $cond: [{ $eq: ['$isInternational', true] }, 'International', 'India'] },
                    count: { $sum: 1 }
                }
            }
        ]);

        const topIndiaCities = await Job.aggregate([
            { $match: { isInternational: { $ne: true } } },
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $match: { _id: { $ne: '' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topInternationalCountries = await Job.aggregate([
            { $match: { isInternational: true } },
            { $group: { _id: '$location.country', count: { $sum: 1 } } },
            { $match: { _id: { $ne: '' } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        return {
            split: internationalSplit.map(item => ({ name: item._id, value: item.count })),
            topIndiaCities: topIndiaCities.map(item => ({ name: item._id, value: item.count })),
            topInternationalCountries: topInternationalCountries.map(item => ({ name: item._id, value: item.count }))
        };
    }

    /**
     * Get daily job posting metrics (Last 30 days)
     */
    async getDailyGrowth() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await Job.aggregate([
            { $match: { postedDate: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$postedDate" } },
                    jobs: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return dailyStats.map(item => ({ date: item._id, jobs: item.jobs }));
    }

    /**
     * Get user growth metrics (Last 30 days)
     */
    async getUserGrowth() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyUsers = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    users: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return dailyUsers.map(item => ({ date: item._id, users: item.users }));
    }
}

module.exports = new AnalyticsService();
