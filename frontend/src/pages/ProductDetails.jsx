import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Star, ArrowLeft, Plus, Minus, MessageSquare, ShieldAlert } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    setQty(Math.max(1, Math.min(val, product.stockQuantity)));
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment) return;
    setReviewSubmitLoading(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      await api.post(`/api/products/${id}/reviews`, { rating, comment });
      setComment('');
      setRating(5);
      setReviewSuccess(true);
      fetchProductDetails();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="bg-slate-200 h-6 w-24 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-200 rounded-2xl aspect-square"></div>
          <div className="space-y-6">
            <div className="bg-slate-200 h-8 rounded w-3/4"></div>
            <div className="bg-slate-200 h-6 rounded w-1/4"></div>
            <div className="bg-slate-200 h-24 rounded"></div>
            <div className="bg-slate-200 h-10 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 text-lg mb-4">Product not found.</p>
        <Link to="/" className="inline-flex items-center space-x-2 text-indigo-600 hover:underline">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/" className="inline-flex items-center space-x-2 text-slate-500 hover:text-indigo-650 transition-colors mb-8">
        <ArrowLeft size={16} />
        <span className="text-sm font-semibold">Back to Shop</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Product Image */}
        <div className="bg-white rounded-3xl overflow-hidden aspect-square bg-slate-50 flex items-center justify-center border border-slate-200/80 shadow-sm">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details Info */}
        <div className="flex flex-col justify-center">
          <span className="text-sm font-bold tracking-wider uppercase text-pink-600 mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(product.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }
                />
              ))}
            </div>
            <span className="text-sm text-slate-700 font-bold">{product.averageRating.toFixed(1)}</span>
            <span className="text-slate-355 text-sm">|</span>
            <span className="text-sm text-slate-500">{product.numReviews} Reviews</span>
          </div>

          <div className="border-t border-b border-slate-200/80 py-4 mb-6">
            <span className="text-3xl font-extrabold text-slate-800">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Stock & Cart actions */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 font-semibold">Availability:</span>
              <span className={`text-sm font-bold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stockQuantity} available)`}
              </span>
            </div>

            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-500 font-semibold">Quantity:</span>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQtyChange(qty - 1)}
                    className="p-3 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-slate-700 font-bold text-sm">{qty}</span>
                  <button
                    onClick={() => handleQtyChange(qty + 1)}
                    className="p-3 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full md:w-auto md:px-12 py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-650/15 hover:shadow-indigo-600/30'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-slate-200 pt-12">
        {/* Review Form */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <MessageSquare size={20} className="text-indigo-600" />
            <span>Submit a Review</span>
          </h2>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              {reviewSuccess && (
                <div className="bg-emerald-50 text-emerald-650 border border-emerald-150 p-3 rounded-lg text-xs font-semibold">
                  Review submitted successfully!
                </div>
              )}
              {reviewError && (
                <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-lg text-xs flex items-center space-x-1.5 font-semibold">
                  <ShieldAlert size={14} />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Rating selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={24} className={num <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Comment
                </label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400 rounded-xl p-3 outline-none text-sm transition-all"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25"
              >
                {reviewSubmitLoading ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-slate-500 text-sm mb-4">Please log in to write a review for this product.</p>
              <Link
                to="/login"
                className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer Reviews</h2>

          {reviews.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
              <p className="text-slate-500 text-sm">There are no reviews for this product yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{rev.name}</h4>
                      <span className="text-xs text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Stars */}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
