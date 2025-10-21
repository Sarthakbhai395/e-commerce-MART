// Test script to verify user blocking functionality
const mongoose = require('mongoose');
const User = require('./models/User');
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

// Test blocking functionality
const testBlocking = async () => {
  await connectDB();
  
  try {
    // Find a test user (you can replace this with an actual user email)
    const user = await User.findOne({ email: "testuser@example.com" });
    
    if (user) {
      console.log("Found user:", user.name);
      console.log("Current blocked status:", user.isBlocked);
      
      // Toggle blocked status
      user.isBlocked = !user.isBlocked;
      await user.save();
      
      console.log("Updated blocked status to:", user.isBlocked);
    } else {
      console.log("No test user found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

testBlocking();