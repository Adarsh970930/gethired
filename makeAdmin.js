const mongoose = require('mongoose');
const User = require('./models/User');
const { connectDB } = require('./config/database');

async function makeAdmin() {
    await connectDB();
    const user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
        await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        console.log('Admin user created: admin@test.com / password123');
    } else {
        user.role = 'admin';
        await user.save();
        console.log('Existing user promoted to admin: admin@test.com');
    }
    process.exit(0);
}
makeAdmin();
