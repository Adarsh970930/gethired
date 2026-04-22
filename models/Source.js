const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['api', 'scraper'],
            default: 'api',
        },
        baseUrl: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastSyncAt: {
            type: Date,
        },
        totalJobsFetched: {
            type: Number,
            default: 0,
        },
        config: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        rateLimit: {
            maxRequests: { type: Number, default: 100 },
            perSeconds: { type: Number, default: 3600 },
        },
        stats: {
            successfulSyncs: { type: Number, default: 0 },
            failedSyncs: { type: Number, default: 0 },
            avgJobsPerSync: { type: Number, default: 0 },
            lastError: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

const Source = mongoose.model('Source', sourceSchema);

module.exports = Source;
