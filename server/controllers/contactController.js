const Contact = require('../models/Contact');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new contact message
// @route   POST /api/contact
// @access  Public
exports.createContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('Creating contact message with req.user:', req.user);

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    console.log('Contact created:', contact);

    // If user is logged in, associate with user
    if (req.user) {
      console.log('Associating contact with user:', req.user.id);
      contact.user = req.user.id;
      await contact.save();
      console.log('Contact after user association:', contact);
    }

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    console.error('Error creating contact message:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin only)
exports.getContactMessages = async (req, res, next) => {
  try {
    const contacts = await Contact.find().populate('user', 'name email').populate('response');

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get contact messages for a specific user
// @route   GET /api/contact/user
// @access  Private (User only)
exports.getUserContactMessages = async (req, res, next) => {
  try {
    console.log('Fetching contact messages for user:', req.user.id);
    
    // Fetch original messages sent by the user and populate their responses
    const originalMessages = await Contact.find({ user: req.user.id }).populate('response');
    
    console.log('Found messages:', originalMessages);
    
    res.status(200).json({
      success: true,
      count: originalMessages.length,
      data: originalMessages
    });
  } catch (err) {
    console.error('Error in getUserContactMessages:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// DEBUG: Temporary route to check all contacts
exports.debugAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().populate('user', 'name email').populate('response');
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};