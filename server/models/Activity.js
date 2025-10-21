const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_PRODUCT',
      'UPDATE_PRODUCT',
      'DELETE_PRODUCT',
      'BLOCK_USER',
      'UNBLOCK_USER',
      'DELETE_USER',
      'BLOCK_SELLER',
      'UNBLOCK_SELLER',
      'DELETE_SELLER'
    ]
  },
  target: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['PRODUCT', 'USER', 'SELLER']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);