const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get recent activities
// @route   GET /api/activities
// @access  Private/Admin
exports.getActivities = async (req, res, next) => {
  try {
    // Get last 10 activities, sorted by most recent first
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('admin', 'name email')
      .exec();

    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      let actionText = '';
      let targetText = '';
      
      switch (activity.action) {
        case 'CREATE_PRODUCT':
          actionText = 'created a new product';
          targetText = `Product ID: ${activity.target}`;
          break;
        case 'UPDATE_PRODUCT':
          actionText = 'updated a product';
          targetText = `Product ID: ${activity.target}`;
          break;
        case 'DELETE_PRODUCT':
          actionText = 'deleted a product';
          targetText = `Product ID: ${activity.target}`;
          break;
        case 'BLOCK_USER':
          actionText = 'blocked a user';
          targetText = `User ID: ${activity.target}`;
          break;
        case 'UNBLOCK_USER':
          actionText = 'unblocked a user';
          targetText = `User ID: ${activity.target}`;
          break;
        case 'DELETE_USER':
          actionText = 'deleted a user';
          targetText = `User ID: ${activity.target}`;
          break;
        case 'BLOCK_SELLER':
          actionText = 'blocked a seller';
          targetText = `Seller ID: ${activity.target}`;
          break;
        case 'UNBLOCK_SELLER':
          actionText = 'unblocked a seller';
          targetText = `Seller ID: ${activity.target}`;
          break;
        default:
          actionText = activity.action.toLowerCase().replace('_', ' ');
          targetText = activity.target;
      }

      return {
        id: activity._id,
        admin: activity.admin ? activity.admin.name : 'Unknown Admin',
        action: actionText,
        target: targetText,
        targetType: activity.targetType,
        timestamp: activity.timestamp
      };
    });

    res.status(200).json({
      success: true,
      count: formattedActivities.length,
      data: formattedActivities
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};