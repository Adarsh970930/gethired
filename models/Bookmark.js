const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
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
    notes: {
        type: String,
        maxlength: 500,
        default: '',
    },
}, {
    timestamps: true,
});

// Ensure a user can only bookmark a job once
bookmarkSchema.index({ user: 1, job: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
