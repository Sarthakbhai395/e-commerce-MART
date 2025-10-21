// Script to block a test seller
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

// Block a test seller
const blockTestSeller = async () => {
  await connectDB();
  
  try {
    // Find the test seller
    const seller = await User.findOne({ email: "seller@example.com" });
    
    if (seller) {
      console.log("Found seller:", seller.name);
      console.log("Current blocked status:", seller.isBlocked);
      
      // Block the seller
      seller.isBlocked = true;
      await seller.save();
      
      console.log("Seller has been blocked successfully!");
      console.log("Updated blocked status:", seller.isBlocked);
    } else {
      console.log("Test seller not found");
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

blockTestSeller();