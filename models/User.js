const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    avatar: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        maxlength: [300, 'Bio cannot exceed 300 characters'],
        default: '',
    },
    skills: [{
        type: String,
        trim: true,
    }],
    preferences: {
        jobTypes: [{ type: String }],
        locations: [{ type: String }],
        experienceLevels: [{ type: String }],
        categories: [{ type: String }],
        remoteOnly: { type: Boolean, default: false },
        salaryMin: { type: Number, default: 0 },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Return user without sensitive data
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
