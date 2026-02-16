const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createPredefinedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@gmail.com',
      role: 'admin' 
    });

    if (existingAdmin) {
      console.log('Predefined admin already exists');
      process.exit(0);
    }

    // Create predefined admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: '123456', // This will be hashed by the pre-save hook
      role: 'admin',
      isBlocked: false
    });

    await adminUser.save();
    console.log('Predefined admin created successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: 123456');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createPredefinedAdmin();