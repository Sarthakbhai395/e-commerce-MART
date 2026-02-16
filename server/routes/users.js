const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  blockUser,
  unblockUser,
  getSellers
} = require('../controllers/userController');

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/cartController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Admin routes
router.use('/admin', protect, authorize('admin'));

router.route('/admin')
  .get(getUsers)
  .post(createUser);

router.route('/admin/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/admin/:id/block')
  .put(blockUser);

router.route('/admin/:id/unblock')
  .put(unblockUser);

// Sellers route
router.route('/admin/sellers')
  .get(getSellers);

// User profile route (protected but no admin required)
router.route('/profile')
  .put(protect, updateProfile);

// Cart routes (protected)
router.route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart)
  .put(protect, updateCart)
  .delete(protect, clearCart);

router.route('/cart/:productId')
  .delete(protect, removeFromCart);

// Wishlist routes (protected)
router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

router.route('/wishlist/:productId')
  .delete(protect, removeFromWishlist);

module.exports = router;