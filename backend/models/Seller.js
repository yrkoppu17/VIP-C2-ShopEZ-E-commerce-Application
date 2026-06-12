import mongoose from 'mongoose';

const sellerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rating: {
      type: Number,
      required: true,
      default: 0.0,
    },
    payoutInfo: {
      bankAccount: {
        type: String,
        default: '',
      },
      routingNumber: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
