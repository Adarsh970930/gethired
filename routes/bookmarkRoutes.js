const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const Job = require('../models/Job');
const { authRequired } = require('../middleware/auth');

/**
 * GET /api/bookmarks
 * Get all bookmarks for current user
 */
router.get('/', authRequired, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;

        const [bookmarks, total] = await Promise.all([
            Bookmark.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('job')
                .lean(),
            Bookmark.countDocuments({ user: req.user._id }),
        ]);

        res.json({
            success: true,
            data: {
                bookmarks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookmarks.',
        });
    }
});

/**
 * POST /api/bookmarks/:jobId
 * Save a job
 */
router.post('/:jobId', authRequired, async (req, res) => {
    try {
        const { jobId } = req.params;
        const { notes } = req.body;

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                error: 'Job not found.',
            });
        }

        // Check if already bookmarked
        const existing = await Bookmark.findOne({ user: req.user._id, job: jobId });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Job already bookmarked.',
            });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            job: jobId,
            notes: notes || '',
        });

        const populated = await bookmark.populate('job');

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Job already bookmarked.',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to bookmark job.',
        });
    }
});

/**
 * DELETE /api/bookmarks/:jobId
 * Remove a bookmark
 */
router.delete('/:jobId', authRequired, async (req, res) => {
    try {
        const result = await Bookmark.findOneAndDelete({
            user: req.user._id,
            job: req.params.jobId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Bookmark not found.',
            });
        }

        res.json({
            success: true,
            message: 'Bookmark removed.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to remove bookmark.',
        });
    }
});

/**
 * GET /api/bookmarks/check/:jobId
 * Check if a job is bookmarked
 */
router.get('/check/:jobId', authRequired, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            user: req.user._id,
            job: req.params.jobId,
        });

        res.json({
            success: true,
            data: { isBookmarked: !!bookmark },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to check bookmark status.',
        });
    }
});

/**
 * GET /api/bookmarks/ids
 * Get all bookmarked job IDs for efficiently checking in frontend
 */
router.get('/ids', authRequired, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id }).select('job').lean();
        const jobIds = bookmarks.map(b => b.job.toString());

        res.json({
            success: true,
            data: jobIds,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookmark IDs.',
        });
    }
});

module.exports = router;
