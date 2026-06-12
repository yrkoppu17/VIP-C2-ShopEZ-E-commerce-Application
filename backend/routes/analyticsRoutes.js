import express from 'express';
import {
  getSalesAnalytics,
  getCategoryAnalytics,
  getTopProductsAnalytics,
  getInventoryReport,
  getSellerAnalytics
} from '../controllers/analyticsController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/sales', protect, admin, getSalesAnalytics);
router.get('/categories', protect, admin, getCategoryAnalytics);
router.get('/products', protect, admin, getTopProductsAnalytics);
router.get('/inventory', protect, admin, getInventoryReport);
router.get('/seller', protect, seller, getSellerAnalytics);

export default router;
