import express from 'express';
import {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getProductSuggestions,
  getRelatedProducts,
  voteHelpfulReview,
} from '../controllers/productController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, seller, createProduct);

// Autocomplete suggestions (must be before /:id)
router.route('/suggestions').get(getProductSuggestions);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, seller, updateProduct)
  .delete(protect, seller, deleteProduct);

router.route('/:id/related').get(getRelatedProducts);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId/vote').post(protect, voteHelpfulReview);

export default router;
