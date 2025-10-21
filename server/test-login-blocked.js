// Test script to verify blocked user cannot login
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Test login for blocked user
const testBlockedUserLogin = async () => {
  await connectDB();
  
  try {
    // Find the blocked test user
    const user = await User.findOne({ email: "test@example.com" }).select('+password');
    
    if (user) {
      console.log("Found user:", user.name);
      console.log("Blocked status:", user.isBlocked);
      
      // Test password match
      const isMatch = await user.matchPassword("123456"); // Assuming this is the password
      console.log("Password match:", isMatch);
      
      // Simulate login check
      if (user.isBlocked) {
        console.log("❌ LOGIN DENIED: User is blocked by admin");
      } else if (!isMatch) {
        console.log("❌ LOGIN DENIED: Invalid credentials");
      } else {
        console.log("✅ LOGIN SUCCESS: User can login");
      }
    } else {
      console.log("Test user not found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

testBlockedUserLogin();