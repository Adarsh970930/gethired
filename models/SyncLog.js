const mongoose = require('mongoose');
const { SYNC_STATUS } = require('../utils/constants');

const syncLogSchema = new mongoose.Schema(
    {
        source: {
            type: String,
            required: true,
            index: true,
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: Object.values(SYNC_STATUS),
            default: SYNC_STATUS.RUNNING,
        },
        jobsFetched: {
            type: Number,
            default: 0,
        },
        jobsNew: {
            type: Number,
            default: 0,
        },
        jobsUpdated: {
            type: Number,
            default: 0,
        },
        jobsDuplicate: {
            type: Number,
            default: 0,
        },
        errors: {
            type: [String],
            default: [],
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Auto-delete logs older than 30 days
syncLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

module.exports = SyncLog;
