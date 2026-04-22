const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    status: {
        type: String,
        enum: ['applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'accepted'],
        default: 'applied',
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
        maxlength: 1000,
        default: '',
    },
    resumeUrl: {
        type: String,
        default: '',
    },
    coverLetter: {
        type: String,
        maxlength: 5000,
        default: '',
    },
    timeline: [{
        status: String,
        date: { type: Date, default: Date.now },
        note: String,
    }],
}, {
    timestamps: true,
});

// Ensure a user can only apply to a job once
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
