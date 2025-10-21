const express = require('express');
const { getActivities } = require('../controllers/activityController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Admin routes for activities
router.use(protect, authorize('admin'));

router.route('/')
  .get(getActivities);

module.exports = router;