import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState(['All', 'Electronics', 'Fashion', 'Home & Living']);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-white border border-slate-200/80 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/60 via-purple-50/40 to-pink-50/30 z-0"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-24 max-w-2xl">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150">
            Welcome to ShopEZ
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 font-sans leading-tight">
            Elevate Your <span className="bg-gradient-to-r from-indigo-650 to-pink-600 bg-clip-text text-transparent">Shopping Experience</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8">
            Discover handpicked premium electronics, apparel, and lifestyle accessories designed to fit your unique daily routine.
          </p>
          <a
            href="#catalog"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/30"
          >
            Explore Catalog
          </a>
        </div>
      </div>

      {/* Catalog Search & Filters */}
      <div id="catalog" className="scroll-mt-20 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800">Our Products</h2>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400 rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all shadow-sm focus:shadow-md"
            />
            <button type="submit" className="absolute left-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                (cat === 'All' && !selectedCategory) || selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-350'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-[380px] border border-slate-200/60 animate-pulse flex flex-col p-4 space-y-4">
                <div className="bg-slate-100 rounded-xl aspect-square flex-grow"></div>
                <div className="bg-slate-100 h-4 rounded w-3/4"></div>
                <div className="bg-slate-100 h-4 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="bg-slate-100 h-6 rounded w-1/4"></div>
                  <div className="bg-slate-100 h-9 rounded-xl w-9"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/60">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
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
    </div>
  );
};

export default Home;
