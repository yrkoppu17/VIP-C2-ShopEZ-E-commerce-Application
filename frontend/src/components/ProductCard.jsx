import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Helper to format image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="bg-white group rounded-2xl overflow-hidden flex flex-col h-full border border-slate-200/60 hover:border-indigo-300/80 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-indigo-100/30">
      {/* Image container */}
      <div className="relative overflow-hidden aspect-square bg-slate-50/50 flex items-center justify-center border-b border-slate-100">
        <Link to={`/product/${product._id}`} className="w-full h-full">
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
        </Link>
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-650/90 text-white text-xs font-semibold px-2 py-1 rounded-md">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold tracking-wider uppercase text-pink-650 mb-1">
          {product.category}
        </span>
        
        <Link to={`/product/${product._id}`} className="hover:text-indigo-650 transition-colors">
          <h3 className="font-bold text-slate-800 text-lg line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(product.averageRating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200'
                }
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">({product.numReviews || 0})</span>
        </div>

        <p className="text-slate-550 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        {/* Price & Add button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-slate-800 font-extrabold text-xl">
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
