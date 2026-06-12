import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      if (user.isBlocked) {
        res.status(403);
        return res.json({ message: 'Your account has been blocked by an administrator.' });
      }

      if (await user.matchPassword(password)) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses || [],
          wishlist: user.wishlist || [],
          token: generateToken(user._id),
        });
      } else {
        res.status(401);
        res.json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(401);
      res.json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, address } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      res.json({ message: 'User already exists' });
      return;
    }

    const defaultAddress = address ? [
      {
        label: 'Home',
        name: name,
        street: address.street || '',
        city: address.city || '',
        postalCode: address.postalCode || '',
        country: address.country || ''
      }
    ] : [];

    const user = await User.create({
      name,
      email,
      password,
      addresses: defaultAddress,
      wishlist: []
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      res.json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
        wishlist: user.wishlist
      });
    } else {
      res.status(404);
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
        wishlist: updatedUser.wishlist,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      res.json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500);
    res.json({ message: error.message });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { label, name, street, city, postalCode, country } = req.body;
    user.addresses.push({ label, name, street, city, postalCode, country });
    const updatedUser = await user.save();
    res.status(251).json(updatedUser.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const editUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { label, name, street, city, postalCode, country } = req.body;
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    address.label = label || address.label;
    address.name = name || address.name;
    address.street = street || address.street;
    address.city = city || address.city;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;

    const updatedUser = await user.save();
    res.json(updatedUser.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.addressId);
    const updatedUser = await user.save();
    res.json(updatedUser.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Filter out null populated values (deleted/missing products)
    const activeWishlist = (user.wishlist || []).filter(item => item !== null);
    res.json(activeWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const prodId = req.params.productId;
    const index = user.wishlist.indexOf(prodId);

    if (index === -1) {
      user.wishlist.push(prodId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    const activeWishlist = (populatedUser.wishlist || []).filter(item => item !== null);
    res.json(activeWishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Block or unblock user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin users cannot be blocked' });
    }

    user.isBlocked = req.body.isBlocked !== undefined ? req.body.isBlocked : !user.isBlocked;
    await user.save();
    
    res.json({ message: `User status changed. isBlocked: ${user.isBlocked}`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply to become a seller
// @route   POST /api/users/seller/apply
// @access  Private
const applySeller = async (req, res) => {
  const { storeName, description, logo, banner } = req.body;
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const existingSeller = await Seller.findOne({ user: req.user._id });
    if (existingSeller) {
      if (existingSeller.status === 'approved') {
        res.status(400);
        return res.json({ message: 'You are already an approved seller' });
      }
      // Allow re-applying if rejected or update if pending
      existingSeller.storeName = storeName || existingSeller.storeName;
      existingSeller.description = description || existingSeller.description;
      existingSeller.logo = logo || existingSeller.logo;
      existingSeller.banner = banner || existingSeller.banner;
      existingSeller.status = 'pending';
      const updated = await existingSeller.save();
      return res.status(200).json(updated);
    }

    const sellerInfo = await Seller.create({
      user: req.user._id,
      storeName,
      description,
      logo,
      banner,
      status: 'pending'
    });

    res.status(201).json(sellerInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller profile
// @route   GET /api/users/seller/profile
// @access  Private
const getSellerProfile = async (req, res) => {
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const sellerInfo = await Seller.findOne({ user: req.user._id });
    if (sellerInfo) {
      res.json(sellerInfo);
    } else {
      res.status(404).json({ message: 'Seller profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller profile
// @route   PUT /api/users/seller/profile
// @access  Private
const updateSellerProfile = async (req, res) => {
  const { storeName, description, logo, banner, payoutInfo } = req.body;
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const sellerInfo = await Seller.findOne({ user: req.user._id });
    if (sellerInfo) {
      sellerInfo.storeName = storeName || sellerInfo.storeName;
      sellerInfo.description = description !== undefined ? description : sellerInfo.description;
      sellerInfo.logo = logo || sellerInfo.logo;
      sellerInfo.banner = banner || sellerInfo.banner;
      if (payoutInfo) {
        sellerInfo.payoutInfo = {
          bankAccount: payoutInfo.bankAccount !== undefined ? payoutInfo.bankAccount : sellerInfo.payoutInfo.bankAccount,
          routingNumber: payoutInfo.routingNumber !== undefined ? payoutInfo.routingNumber : sellerInfo.payoutInfo.routingNumber
        };
      }
      const updated = await sellerInfo.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Seller profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sellers (Admin)
// @route   GET /api/users/admin/sellers
// @access  Private/Admin
const getSellers = async (req, res) => {
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const sellers = await Seller.find({}).populate('user', 'name email');
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve seller application
// @route   PUT /api/users/admin/sellers/:id/approve
// @access  Private/Admin
const approveSeller = async (req, res) => {
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const sellerInfo = await Seller.findById(req.params.id);
    if (!sellerInfo) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }
    sellerInfo.status = 'approved';
    await sellerInfo.save();

    // Update user role to seller
    const user = await User.findById(sellerInfo.user);
    if (user) {
      user.role = 'seller';
      await user.save();
    }

    res.json({ message: 'Seller approved successfully', seller: sellerInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject seller application
// @route   PUT /api/users/admin/sellers/:id/reject
// @access  Private/Admin
const rejectSeller = async (req, res) => {
  try {
    const Seller = (await import('../models/Seller.js')).default;
    const sellerInfo = await Seller.findById(req.params.id);
    if (!sellerInfo) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }
    sellerInfo.status = 'rejected';
    await sellerInfo.save();

    // Reset user role to customer if they were seller
    const user = await User.findById(sellerInfo.user);
    if (user && user.role === 'seller') {
      user.role = 'customer';
      await user.save();
    }

    res.json({ message: 'Seller application rejected', seller: sellerInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
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
};
