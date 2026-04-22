const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'jobseg_default_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

/**
 * Generate JWT token
 */
function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

/**
 * Verify JWT token and attach user to req
 * Required authentication
 */
async function authRequired(req, res, next) {
    try {
        let token;

        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated. Please log in.',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from DB
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User not found or account deactivated.',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please log in again.',
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Authentication error.',
        });
    }
}

/**
 * Optional authentication - attach user if token present, continue otherwise
 */
async function authOptional(req, res, next) {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user && user.isActive) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently continue without user
    }
    next();
}

/**
 * Admin-only middleware
 */
function adminRequired(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required.',
        });
    }
    next();
}

module.exports = {
    generateToken,
    authRequired,
    authOptional,
    adminRequired,
    JWT_SECRET,
};
