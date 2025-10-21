// Script to list all users in the database
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

// List all users
const listUsers = async () => {
  await connectDB();
  
  try {
    const users = await User.find({});
    
    console.log("Total users found:", users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Blocked: ${user.isBlocked ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('------------------------');
    });
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

listUsers();