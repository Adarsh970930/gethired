const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authRequired } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, skills } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters.',
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'An account with this email already exists.',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            skills: skills || [],
        });

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An account with this email already exists.',
            });
        }
        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.',
        });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.',
            });
        }

        // Find user with password field (+password overrides select: false)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account has been deactivated.',
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password.',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
        });
    }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authRequired, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile.',
        });
    }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authRequired, async (req, res) => {
    try {
        const allowedUpdates = ['name', 'bio', 'skills', 'preferences', 'avatar'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update profile.',
        });
    }
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password', authRequired, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Current password and new password are required.',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'New password must be at least 6 characters.',
            });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect.',
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to change password.',
        });
    }
});

module.exports = router;
