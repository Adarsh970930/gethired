const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { authRequired } = require('../middleware/auth');

/**
 * GET /api/applications
 * Get applications for current user
 */
router.get('/', authRequired, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { user: req.user._id };
        if (status && status !== 'all') filter.status = status;

        const [applications, total] = await Promise.all([
            Application.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('job')
                .lean(),
            Application.countDocuments(filter),
        ]);

        // Stats
        const stats = await Application.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        const statusCounts = {};
        stats.forEach(s => { statusCounts[s._id] = s.count; });

        res.json({
            success: true,
            data: {
                applications,
                stats: statusCounts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications.',
        });
    }
});

/**
 * POST /api/applications
 * Track a job application
 */
router.post('/', authRequired, async (req, res) => {
    try {
        const { jobId, notes, coverLetter } = req.body;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                error: 'Job ID is required.',
            });
        }

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found.',
            });
        }

        // Check if already applied
        const existing = await Application.findOne({ user: req.user._id, job: jobId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'You have already tracked an application for this job.',
            });
        }

        const application = await Application.create({
            user: req.user._id,
            job: jobId,
            notes: notes || '',
            coverLetter: coverLetter || '',
            timeline: [{ status: 'applied', date: new Date(), note: 'Application submitted' }],
        });

        const populated = await application.populate('job');

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Application already tracked.',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to track application.',
        });
    }
});

/**
 * PUT /api/applications/:id
 * Update application status
 */
router.put('/:id', authRequired, async (req, res) => {
    try {
        const { status, notes } = req.body;
        const validStatuses = ['applied', 'interviewing', 'offered', 'rejected', 'withdrawn', 'accepted'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Status must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const application = await Application.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                error: 'Application not found.',
            });
        }

        if (status) {
            application.status = status;
            application.timeline.push({
                status,
                date: new Date(),
                note: notes || `Status updated to ${status}`,
            });
        }

        if (notes !== undefined) {
            application.notes = notes;
        }

        await application.save();
        const populated = await application.populate('job');

        res.json({
            success: true,
            data: populated,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update application.',
        });
    }
});

/**
 * DELETE /api/applications/:id
 * Remove an application tracking
 */
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const result = await Application.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Application not found.',
            });
        }

        res.json({
            success: true,
            message: 'Application tracking removed.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to remove application.',
        });
    }
});

module.exports = router;
