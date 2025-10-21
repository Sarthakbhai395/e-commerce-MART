const Contact = require('../models/Contact');

// @desc    Get all contact messages for sellers
// @route   GET /api/seller/contact
// @access  Private (Seller only)
exports.getSellerContactMessages = async (req, res, next) => {
  try {
    // Get all contact messages that are original messages from users (not seller responses)
    // and populate both the user and response fields
    const contacts = await Contact.find({ 
      name: { $not: { $regex: 'Seller Response', $options: 'i' } } 
    })
      .populate('user', 'name email')
      .populate('response')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    console.error('Error fetching seller contact messages:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Send a response to a contact message
// @route   POST /api/seller/contact/:id/response
// @access  Private (Seller only)
exports.sendContactResponse = async (req, res, next) => {
  try {
    const { responseMessage } = req.body;
    const contactId = req.params.id;

    // Find the original contact message and populate the user
    const contact = await Contact.findById(contactId).populate('user', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    // Create a response message
    const response = new Contact({
      name: `${req.user.name} (Seller Response)`,
      email: req.user.email,
      subject: `Re: ${contact.subject}`,
      message: responseMessage,
      // Always associate response with the user who sent the original message
      user: contact.user ? contact.user._id : null
    });

    const savedResponse = await response.save();

    // Update the original message with response reference
    contact.response = savedResponse._id;
    await contact.save();

    // Also populate the response before sending it back
    const populatedResponse = await Contact.findById(savedResponse._id).populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedResponse
    });
  } catch (err) {
    console.error('Error sending contact response:', err);
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

// @desc    Get all responses sent by seller
// @route   GET /api/seller/contact/responses
// @access  Private (Seller only)
exports.getSellerContactResponses = async (req, res, next) => {
  try {
    // Get all contact messages that were sent by the seller (have the seller response marker)
    const responses = await Contact.find({ 
      name: { $regex: 'Seller Response', $options: 'i' } 
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (err) {
    console.error('Error fetching seller responses:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/seller/contact/:id
// @access  Private (Seller only)
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const contactId = req.params.id;

    // Find the contact message
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    // Check if it's a response message
    if (contact.name.includes('Seller Response')) {
      // If it's a response, we need to find the original message and remove the response reference
      const originalMessage = await Contact.findOne({ response: contactId });
      if (originalMessage) {
        originalMessage.response = undefined;
        await originalMessage.save();
      }
    } else {
      // If it's an original message and has a response, delete the response as well
      if (contact.response) {
        await Contact.findByIdAndDelete(contact.response);
      }
    }

    // Delete the contact message
    await Contact.findByIdAndDelete(contactId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting contact message:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};