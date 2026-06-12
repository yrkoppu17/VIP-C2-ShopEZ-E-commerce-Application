import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  addUserAddress,
  editUserAddress,
  deleteUserAddress,
  getUserWishlist,
  toggleUserWishlist,
  blockUser,
  applySeller,
  getSellerProfile,
  updateSellerProfile,
  getSellers,
  approveSeller,
  rejectSeller
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist
router.route('/wishlist').get(protect, getUserWishlist);
router.route('/wishlist/:productId').post(protect, toggleUserWishlist);

// Addresses
router.route('/addresses').post(protect, addUserAddress);
router.route('/addresses/:addressId')
  .put(protect, editUserAddress)
  .delete(protect, deleteUserAddress);

// Seller onboarding & settings
router.route('/seller/apply').post(protect, applySeller);
router.route('/seller/profile')
  .get(protect, getSellerProfile)
  .put(protect, updateSellerProfile);

// Admin seller management
router.route('/admin/sellers').get(protect, admin, getSellers);
router.route('/admin/sellers/:id/approve').put(protect, admin, approveSeller);
router.route('/admin/sellers/:id/reject').put(protect, admin, rejectSeller);

// Admin user block/unblock
router.route('/:id/block').put(protect, admin, blockUser);

export default router;
