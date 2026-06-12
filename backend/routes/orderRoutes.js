import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderDeliveryStatus,
  getSellerOrders,
  updateSellerOrderDeliveryStatus,
} from '../controllers/orderController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/seller').get(protect, seller, getSellerOrders);
router.route('/seller/:id/fulfill').put(protect, seller, updateSellerOrderDeliveryStatus);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderDeliveryStatus);

export default router;
