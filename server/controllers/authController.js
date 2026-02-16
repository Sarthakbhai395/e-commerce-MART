const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and role'
      });
    }

    // Special case for predefined admin
    if (email === 'admin@gmail.com' && password === '123456') {
      // Find the predefined admin user
      const user = await User.findOne({ email: 'admin@gmail.com', role: 'admin' }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(401).json({
          success: false,
          error: 'You are blocked by admin'
        });
      }
      
      // Check if password matches (for predefined admin)
      const isMatch = await user.matchPassword(password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Override role to admin for predefined admin
      sendTokenResponse(user, 200, res);
      return;
    }

    // Regular user login
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        error: 'You are blocked by admin'
      });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        error: `Please login as ${user.role}`
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found with this email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url (frontend route, not API route)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // For development, we'll show a success message even if email isn't sent
    // In production, you should configure SMTP settings
    
    // Check if SMTP credentials are configured
    const hasSMTPConfig = process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD;
    
    if (hasSMTPConfig) {
      // Create email message
      const message = `
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 10 minutes.</p>
      `;

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });

      // Mail options
      const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL,
        to: user.email,
        subject: 'Password Reset Request - Akario Mart',
        html: message
      };

      // Send email
      try {
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({
          success: true,
          message: 'Password reset link sent to your email'
        });
      } catch (err) {
        console.error('Email sending error:', err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        // Even if email fails, we'll still return success for development
        // In production, you might want to return an error
        res.status(200).json({
          success: true,
          message: 'Password reset link generated (email delivery failed - check server configuration)'
        });
      }
    } else {
      // No SMTP configured, return success for development
      console.warn('SMTP not configured. For production, please configure SMTP settings in .env file.');
      
      res.status(200).json({
        success: true,
        message: 'Password reset link generated (SMTP not configured for email sending)'
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = require('crypto').createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};