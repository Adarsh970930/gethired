const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    isSingleton: {
        type: Boolean,
        default: true,
        unique: true,
        required: true
    },
    syncIntervalHours: {
        type: Number,
        default: 6,
        min: 1,
        max: 72
    },
    maxJobsPerSource: {
        type: Number,
        default: 200,
        min: 10,
        max: 1000
    },
    autoCleanupEnabled: {
        type: Boolean,
        default: true
    },
    cleanupAfterDays: {
        type: Number,
        default: 60,
        min: 1,
        max: 365
    },
    rateLimitWindowMs: {
        type: Number,
        default: 900000, // 15 mins
    },
    rateLimitMax: {
        type: Number,
        default: 100
    },
    announcementBanner: {
        type: String,
        default: ''
    },
    // AI & ATS Engine Settings
    aiProvider: {
        type: String,
        enum: ['gemini', 'groq', 'heuristic'],
        default: 'heuristic'
    },
    geminiApiKey: {
        type: String,
        default: ''
    },
    groqApiKey: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Ensure there's only one settings document
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne({ isSingleton: true });
    if (!settings) {
        settings = await this.create({ isSingleton: true });
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
