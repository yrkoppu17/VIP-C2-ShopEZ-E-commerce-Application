import Product from '../models/Product.js';
import Review from '../models/Review.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const queryObj = {};

    // 1. Keyword search (with simple regex)
    if (req.query.keyword) {
      queryObj.name = {
        $regex: req.query.keyword,
        $options: 'i',
      };
    }

    // 2. Category filter
    if (req.query.category && req.query.category !== 'All' && req.query.category !== '') {
      queryObj.category = req.query.category;
    }

    // 3. Brand filter
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      queryObj.brand = { $in: brands };
    }

    // 4. Price range filter
    if (req.query.priceMin || req.query.priceMax) {
      queryObj.price = {};
      if (req.query.priceMin) queryObj.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) queryObj.price.$lte = Number(req.query.priceMax);
    }

    // 5. Ratings filter
    if (req.query.ratingMin) {
      queryObj.averageRating = { $gte: Number(req.query.ratingMin) };
    }

    // 6. Availability filter
    if (req.query.availability) {
      if (req.query.availability === 'inStock') {
        queryObj.stockQuantity = { $gt: 0 };
      } else if (req.query.availability === 'outOfStock') {
        queryObj.stockQuantity = { $eq: 0 };
      }
    }

    // 7. Discount filter
    if (req.query.discounted === 'true') {
      queryObj.discountPercent = { $gt: 0 };
    }

    // 8. Deal sections filter
    if (req.query.dealType && req.query.dealType !== 'None') {
      queryObj.dealType = req.query.dealType;
    }

    // Sort setup
    let sortObj = {};
    if (req.query.sort) {
      const sortVal = req.query.sort;
      if (sortVal === 'price-asc') sortObj.price = 1;
      else if (sortVal === 'price-desc') sortObj.price = -1;
      else if (sortVal === 'newest') sortObj.createdAt = -1;
      else if (sortVal === 'rating') sortObj.averageRating = -1;
      else if (sortVal === 'popular') sortObj.numReviews = -1;
      else if (sortVal === 'best-selling') sortObj.averageRating = -1; // Default
    } else {
      sortObj.createdAt = -1; // default sort
    }

    // 9. Seller filter
    if (req.query.seller) {
      queryObj.seller = req.query.seller;
    }

    const products = await Product.find(queryObj).sort(sortObj);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Fetch reviews for this product
      const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
      res.json({ product, reviews });
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Security: If user is seller, verify they own the product
      if (req.user.role === 'seller' && product.seller && product.seller.toString() !== req.user._id.toString()) {
        res.status(403);
        return res.json({ message: 'Not authorized to delete this product' });
      }

      await Product.deleteOne({ _id: req.params.id });
      // Clean up reviews too
      await Review.deleteMany({ product: req.params.id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin/Seller
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stockQuantity, images, brand } = req.body;

    const product = new Product({
      name: name || 'Sample Name',
      price: price || 0,
      description: description || 'Sample Description',
      category: category || 'Sample Category',
      stockQuantity: stockQuantity || 0,
      images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
      brand: brand || '',
      averageRating: 0,
      numReviews: 0,
      seller: req.user.role === 'seller' ? req.user._id : undefined
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400);
    res.json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Seller
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stockQuantity, images, brand } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      // Security: If user is seller, verify they own the product
      if (req.user.role === 'seller' && product.seller && product.seller.toString() !== req.user._id.toString()) {
        res.status(403);
        return res.json({ message: 'Not authorized to edit this product' });
      }

      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? price : product.price;
      product.description = description !== undefined ? description : product.description;
      product.category = category !== undefined ? category : product.category;
      product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
      product.images = images !== undefined ? images : product.images;
      product.brand = brand !== undefined ? brand : product.brand;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400);
    res.json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = await Review.findOne({
        product: req.params.id,
        user: req.user._id,
      });

      if (alreadyReviewed) {
        res.status(400);
        res.json({ message: 'Product already reviewed' });
        return;
      }

      // Check if verified purchase
      const Order = (await import('../models/Order.js')).default;
      const hasPurchased = await Order.findOne({
        user: req.user._id,
        paymentStatus: 'Paid',
        'orderItems.product': req.params.id
      });

      const review = new Review({
        name: req.user.name,
        rating: Number(rating),
        comment,
        images: images || [],
        isVerified: !!hasPurchased,
        user: req.user._id,
        product: req.params.id,
      });

      await review.save();

      // Recalculate product rating and count
      const productReviews = await Review.find({ product: req.params.id });
      product.numReviews = productReviews.length;
      product.averageRating =
        productReviews.reduce((acc, item) => item.rating + acc, 0) /
        productReviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404);
      res.json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get autocomplete search suggestions
// @route   GET /api/products/suggestions
// @access  Public
const getProductSuggestions = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.json([]);
    }

    // Suggestions based on name containing the string
    const suggestions = await Product.find({
      name: { $regex: keyword, $options: 'i' }
    })
      .select('name category')
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get related / recommended products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find products in same category, excluding current product
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(8);

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Helpful vote review
// @route   POST /api/products/:id/reviews/:reviewId/vote
// @access  Private
const voteHelpfulReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user._id;

    // Check if user already voted
    const alreadyVotedIdx = review.votedUsers.findIndex(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyVotedIdx !== -1) {
      // Remove vote (toggle off)
      review.votedUsers.splice(alreadyVotedIdx, 1);
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add vote
      review.votedUsers.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();
    res.json({ helpfulVotes: review.helpfulVotes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getProductSuggestions,
  getRelatedProducts,
  voteHelpfulReview,
};
