import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0.0,
    },
    originalPrice: {
      type: Number,
      default: 0.0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: '',
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    averageRating: {
      type: Number,
      required: true,
      default: 0.0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    storage: {
      type: [String],
      default: [],
    },
    weight: {
      type: [String],
      default: [],
    },
    variants: [
      {
        size: { type: String, default: '' },
        color: { type: String, default: '' },
        storage: { type: String, default: '' },
        weight: { type: String, default: '' },
        stockQuantity: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
      }
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    dealType: {
      type: String,
      enum: ['None', 'TodaysDeals', 'BestDeals', 'MegaSale', 'WeekendOffers', 'ClearanceSale'],
      default: 'None',
    },
    frequentlyBoughtTogether: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
