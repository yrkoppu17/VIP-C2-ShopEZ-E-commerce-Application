import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    paymentResult,
  } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      res.json({ message: 'No order items' });
      return;
    }

    // Verify stock availability and decrement
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        res.json({ message: `Product not found: ${item.name}` });
        return;
      }
      if (product.stockQuantity < item.qty) {
        res.status(400);
        res.json({ message: `Insufficient stock for ${item.name}. Available: ${product.stockQuantity}` });
        return;
      }
    }

    // Decrement stock for each item
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.qty },
      });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: paymentResult && paymentResult.status === 'succeeded' ? 'Paid' : 'Pending',
      paidAt: paymentResult && paymentResult.status === 'succeeded' ? Date.now() : undefined,
      paymentResult: paymentResult || undefined,
      couponApplied: req.body.couponApplied || undefined,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check if user is admin or the owner of the order
      if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
        res.status(403);
        res.json({ message: 'Not authorized to view this order' });
        return;
      }
      res.json(order);
    } else {
      res.status(404);
      res.json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.paymentStatus = 'Paid';
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      res.json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Update order delivery status
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.deliveryStatus = req.body.deliveryStatus || 'Shipped';
      if (order.deliveryStatus === 'Delivered') {
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      res.json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get orders containing seller items
// @route   GET /api/orders/seller
// @access  Private/Seller
const getSellerOrders = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    const productIds = products.map((p) => p._id.toString());

    const orders = await Order.find({
      'orderItems.product': { $in: productIds }
    }).populate('user', 'name email');

    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orderItems = orderObj.orderItems.filter(
        (item) => productIds.includes(item.product.toString())
      );
      return orderObj;
    });

    res.json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update delivery status for order (Seller)
// @route   PUT /api/orders/seller/:id/fulfill
// @access  Private/Seller
const updateSellerOrderDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const products = await Product.find({ seller: req.user._id });
    const productIds = products.map((p) => p._id.toString());
    const hasSellerProduct = order.orderItems.some(
      (item) => productIds.includes(item.product.toString())
    );

    if (!hasSellerProduct && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to fulfill this order' });
    }

    order.deliveryStatus = req.body.deliveryStatus || 'Shipped';
    if (order.deliveryStatus === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderDeliveryStatus,
  getSellerOrders,
  updateSellerOrderDeliveryStatus,
};
