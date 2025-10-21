// Script to block a test user
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

// Block a test user
const blockTestUser = async () => {
  await connectDB();
  
  try {
    // Find the test user
    const user = await User.findOne({ email: "test@example.com" });
    
    if (user) {
      console.log("Found user:", user.name);
      console.log("Current blocked status:", user.isBlocked);
      
      // Block the user
      user.isBlocked = true;
      await user.save();
      
      console.log("User has been blocked successfully!");
      console.log("Updated blocked status:", user.isBlocked);
    } else {
      console.log("Test user not found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

blockTestUser();