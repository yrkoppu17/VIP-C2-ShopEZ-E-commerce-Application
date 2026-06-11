import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  Smartphone, 
  Laptop, 
  Watch, 
  Headphones, 
  Sparkles,
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  HelpCircle,
  ArrowRight,
  Star,
  ShoppingCart
} from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Categories list for shortcuts row
  const categoryShortcuts = [
    { name: 'All', icon: Sparkles, label: 'All Products' },
    { name: 'Electronics', icon: Headphones, label: 'Electronics' },
    { name: 'Fashion', icon: Smartphone, label: 'Fashion' }, // using phone/backpack representation
    { name: 'Home & Living', icon: Laptop, label: 'Home & Living' }, // using home desk representation
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?keyword=${searchQuery}`;
        if (selectedCategory && selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const { data } = await api.get(url);
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  // Find a hero product to showcase in the dark card (e.g. Sonic Headphones)
  const heroProduct = products.find(p => p.name.includes('Headphones')) || products[0];
  const otherProducts = products.filter(p => p._id !== heroProduct?._id);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Editorial Title */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 animate-fade-slide-up">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1D1D1F] tracking-tight leading-none">
          Store. <span className="text-[#86868B]">The best way to buy the products you love.</span>
        </h1>
      </div>

      {/* Category Shortcut Menu Row (Staggered Animation) */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center space-x-8 overflow-x-auto no-scrollbar py-4">
          {categoryShortcuts.map((cat, idx) => {
            const IconComponent = cat.icon;
            const isActive = (cat.name === 'All' && !selectedCategory) || selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name === 'All' ? '' : cat.name)}
                style={{ animationDelay: `${idx * 0.05}s` }}
                className="flex flex-col items-center space-y-3 flex-shrink-0 animate-fade-slide-up opacity-0"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-[#1D1D1F] text-white scale-105 shadow-md' 
                    : 'bg-white text-[#86868B] hover:text-[#1D1D1F] shadow-sm'
                }`}>
                  <IconComponent size={24} />
                </div>
                <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* "The Latest" Editorial Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-16 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-8">
          The Latest. <span className="text-[#86868B]">Take a look at what’s new.</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1D1D1F] h-[480px] rounded-[28px] animate-pulse"></div>
            <div className="bg-white h-[480px] rounded-[28px] animate-pulse border border-slate-100"></div>
            <div className="bg-white h-[480px] rounded-[28px] animate-pulse border border-slate-100"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[28px] border border-[#E8E8ED] text-[#86868B]">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Signature Dark Showcase Card (Apple style) */}
            {heroProduct && (
              <div className="md:col-span-1 bg-[#1D1D1F] text-white rounded-[28px] p-8 flex flex-col justify-between h-[480px] shadow-apple-ambient hover:-translate-y-1 hover:shadow-apple-ambient-hover transition-apple overflow-hidden group relative">
                <div>
                  <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">Featured</span>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-2 leading-tight">
                    {heroProduct.name}
                  </h3>
                  <p className="text-[#86868B] text-sm mt-3 leading-relaxed line-clamp-3">
                    {heroProduct.description}
                  </p>
                </div>

                <div className="relative flex-grow flex items-center justify-center py-4">
                  <img
                    src={getImageUrl(heroProduct.images[0])}
                    alt={heroProduct.name}
                    className="h-44 object-contain group-hover:scale-105 transition-apple duration-500"
                  />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-extrabold">${heroProduct.price}</span>
                  <Link
                    to={`/product/${heroProduct._id}`}
                    className="bg-white text-[#1D1D1F] hover:bg-[#F5F5F7] px-4 py-2 rounded-full text-xs font-bold transition-apple-fast flex items-center space-x-1"
                  >
                    <span>View Detail</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Adjacent Bright Variant Boxes (Horizontal scrolling layout or columns) */}
            {otherProducts.slice(0, 2).map((prod) => (
              <div key={prod._id} className="bg-white rounded-[28px] p-8 flex flex-col justify-between h-[480px] border border-[#E8E8ED]/60 shadow-apple-ambient hover:-translate-y-1 hover:shadow-apple-ambient-hover transition-apple overflow-hidden group relative">
                <div>
                  <span className="text-xs font-bold text-[#86868B] uppercase tracking-widest">{prod.category}</span>
                  <h3 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight mt-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-3 leading-relaxed line-clamp-3">
                    {prod.description}
                  </p>
                </div>

                <div className="relative flex-grow flex items-center justify-center py-4">
                  <img
                    src={getImageUrl(prod.images[0])}
                    alt={prod.name}
                    className="h-44 object-contain group-hover:scale-102 transition-apple duration-500"
                  />
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-extrabold text-[#1D1D1F]">${prod.price}</span>
                  <Link
                    to={`/product/${prod._id}`}
                    className="bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] px-4 py-2 rounded-full text-xs font-bold transition-apple-fast flex items-center space-x-1"
                  >
                    <span>Buy</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Horizontal Product Carousel ("Loud and Clear") */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-8">
          Frictionless Audio & Living. <span className="text-[#86868B]">Sound that surrounds you.</span>
        </h2>

        <div className="flex space-x-6 overflow-x-auto no-scrollbar py-4 px-1 scroll-smooth">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white w-[300px] h-[400px] rounded-[28px] flex-shrink-0 animate-pulse border border-[#E8E8ED]"></div>
            ))
          ) : (
            products.map((prod) => (
              <div
                key={prod._id}
                className="bg-white w-[300px] h-[400px] rounded-[28px] p-6 flex flex-col justify-between flex-shrink-0 border border-[#E8E8ED]/60 shadow-apple-ambient hover:-translate-y-1 hover:shadow-apple-ambient-hover transition-apple relative group"
              >
                <div className="aspect-square w-full rounded-2xl bg-[#F5F5F7]/50 flex items-center justify-center overflow-hidden mb-4 border border-[#E8E8ED]/30">
                  <img
                    src={getImageUrl(prod.images[0])}
                    alt={prod.name}
                    className="h-32 object-contain group-hover:scale-102 transition-apple duration-500"
                  />
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">{prod.category}</span>
                    <h4 className="font-extrabold text-[#1D1D1F] text-base leading-tight mt-1 line-clamp-1 group-hover:text-indigo-650 transition-colors">
                      {prod.name}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-base font-extrabold text-slate-800">${prod.price}</span>
                    <Link
                      to={`/product/${prod._id}`}
                      className="bg-[#1D1D1F] text-white hover:bg-slate-800 text-[10px] font-bold px-3 py-2 rounded-full uppercase tracking-wider transition-colors"
                    >
                      Buy
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* "The Store Difference" Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mb-8">
          The ShopEZ Difference. <span className="text-[#86868B]">Why buy from us.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#E8E8ED]/60 p-8 rounded-[28px] shadow-apple-ambient flex flex-col space-y-4 hover:shadow-apple-ambient-hover hover:-translate-y-0.5 transition-apple group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:rotate-[5deg] transition-transform duration-300">
              <Truck size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Fast, Free Shipping</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enjoy standard free delivery on all catalog items with direct order tracking links.
            </p>
          </div>

          <div className="bg-white border border-[#E8E8ED]/60 p-8 rounded-[28px] shadow-apple-ambient flex flex-col space-y-4 hover:shadow-apple-ambient-hover hover:-translate-y-0.5 transition-apple group">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 group-hover:rotate-[-5deg] transition-transform duration-300">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Secure Gateway Checkout</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Simulated 256-bit encrypted card chargebacks built for verified developer review.
            </p>
          </div>

          <div className="bg-white border border-[#E8E8ED]/60 p-8 rounded-[28px] shadow-apple-ambient flex flex-col space-y-4 hover:shadow-apple-ambient-hover hover:-translate-y-0.5 transition-apple group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:rotate-[5deg] transition-transform duration-300">
              <RefreshCw size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Easy Sandbox Returns</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Not completely satisfied? Test refund logs directly inside order history dashboards.
            </p>
          </div>

          <div className="bg-white border border-[#E8E8ED]/60 p-8 rounded-[28px] shadow-apple-ambient flex flex-col space-y-4 hover:shadow-apple-ambient-hover hover:-translate-y-0.5 transition-apple group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:rotate-[-5deg] transition-transform duration-300">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Expert Support Logs</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Get diagnostic answers about integration schemas or database setups instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Search, Filter & List Section (Ensuring complete functionality remains) */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-[#E8E8ED] scroll-mt-20" id="search-section">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-[#1D1D1F] tracking-tight">Search Catalog</h3>
            <p className="text-slate-500 text-sm mt-1">Refine and query all sandbox items instantly.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-slate-800 placeholder-[#86868B] rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all shadow-sm"
            />
            <button type="submit" className="absolute left-3.5 top-3.5 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Filter Details */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white h-[350px] rounded-[28px] border border-[#E8E8ED]"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[28px] border border-[#E8E8ED] text-slate-400">
            No products found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footnote & Structured Navigation Columns */}
      <div className="bg-[#F5F5F7] border-t border-[#E8E8ED] py-16 text-[#86868B] text-xs leading-relaxed">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D1D1F]">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#1D1D1F] transition-colors">Shop Catalog</Link></li>
              <li><Link to="/cart" className="hover:text-[#1D1D1F] transition-colors">Shopping Cart</Link></li>
              <li><Link to="/my-orders" className="hover:text-[#1D1D1F] transition-colors">My Orders</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D1D1F]">Account Services</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-[#1D1D1F] transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-[#1D1D1F] transition-colors">Register Account</Link></li>
              <li><Link to="/my-orders" className="hover:text-[#1D1D1F] transition-colors">Order Logs</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D1D1F]">Administrative Tools</h4>
            <ul className="space-y-2">
              <li><Link to="/admin" className="hover:text-[#1D1D1F] transition-colors">Dashboard Analytics</Link></li>
              <li><Link to="/admin" className="hover:text-[#1D1D1F] transition-colors">Inventory CRUD</Link></li>
              <li><Link to="/admin" className="hover:text-[#1D1D1F] transition-colors">Order Fulfilment</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-[#1D1D1F]">Integrations</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-[#1D1D1F] transition-colors cursor-default">Stripe Checkout Api</span></li>
              <li><span className="hover:text-[#1D1D1F] transition-colors cursor-default">Mongoose Engine</span></li>
              <li><span className="hover:text-[#1D1D1F] transition-colors cursor-default">JSON Web Tokens</span></li>
            </ul>
          </div>
          <div className="space-y-3 col-span-2 md:col-span-1">
            <h4 className="font-bold text-[#1D1D1F]">About ShopEZ</h4>
            <p className="text-slate-500 leading-loose">
              An advanced pairing demonstration showcasing high-aesthetic mock designs, responsive frameworks, and secure role authentication out-of-the-box.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-[#E8E8ED] pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[#86868B]">
          <p>© 2026 ShopEZ Inc. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-[#1D1D1F] transition-colors cursor-default">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-[#1D1D1F] transition-colors cursor-default">Terms of Use</span>
            <span>|</span>
            <span className="hover:text-[#1D1D1F] transition-colors cursor-default">Site Map</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
