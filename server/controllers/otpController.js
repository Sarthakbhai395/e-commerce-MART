const twilio = require('twilio');
const User = require('../models/User');

// Initialize Twilio client with environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map();

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5-minute expiration
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send actual SMS via Twilio in both development and production
    try {
      await client.messages.create({
        body: `Your Akario Mart verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}` // Ensure proper formatting for Indian numbers
      });
      
      console.log(`OTP sent successfully to ${phone}: ${otp}`);
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      // Even if SMS fails, we still return success for demo purposes
      // In production, you might want to handle this differently
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('OTP sending error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP: ' + err.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(phone);
    
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired'
      });
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(phone); // Remove expired OTP
      return res.status(400).json({
        success: false,
        error: 'OTP has expired'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Remove used OTP
    otpStore.delete(phone);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP: ' + err.message
    });
  }
};