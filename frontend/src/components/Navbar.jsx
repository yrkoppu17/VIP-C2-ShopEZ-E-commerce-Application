import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ClipboardList, 
  Menu, 
  X, 
  Search, 
  Sun, 
  Moon, 
  ChevronDown, 
  MapPin, 
  BookOpen, 
  Smartphone, 
  ShoppingBag as FootwearIcon, 
  Watch, 
  Book, 
  Tv, 
  Dumbbell, 
  Sparkles, 
  Apple, 
  Compass,
  History
} from 'lucide-react';

const categoriesList = [
  { name: 'Electronics', icon: Tv, description: 'Smartphones, TVs & ANC Headsets' },
  { name: 'Fashion', icon: Smartphone, description: 'Jackets, Tees & Chino Pants' },
  { name: 'Footwear', icon: FootwearIcon, description: 'Sneakers, Loafers & Boots' },
  { name: 'Watches', icon: Watch, description: 'Smartwatches & Quartz Dress' },
  { name: 'Books', icon: Book, description: 'Odysseys, Manuals & Fiction' },
  { name: 'Home Appliances', icon: BookOpen, description: 'Air Fryers, Vacuums & Blenders' },
  { name: 'Sports', icon: Dumbbell, description: 'Yoga Mats, Dumbbells & Tents' },
  { name: 'Beauty', icon: Sparkles, description: 'Serums, Creams & Clay Masks' },
  { name: 'Grocery', icon: Apple, description: 'Honey, Olive Oils & Coffees' },
  { name: 'Accessories', icon: Compass, description: 'Backpacks, Wallets & Suitcases' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Wishlist state
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch Wishlist count
  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const { data } = await api.get('/api/users/wishlist');
          setWishlistCount(data.length);
        } catch (err) {
          console.error('Wishlist error', err);
        }
      } else {
        setWishlistCount(0);
      }
    };
    fetchWishlist();
    
    // Set up polling/interval to sync wishlist changes or register a custom event
    const handleWishlistChange = () => fetchWishlist();
    window.addEventListener('wishlist-updated', handleWishlistChange);
    return () => window.removeEventListener('wishlist-updated', handleWishlistChange);
  }, [user]);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Suggestions API fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const { data } = await api.get(`/api/products/suggestions?keyword=${searchTerm}`);
          setSuggestions(data);
        } catch (error) {
          console.error(error);
        }
      } else {
        setSuggestions([]);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Click outside search auto-close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
      setShowSuggestions(false);
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSuggestionClick = (name) => {
    saveRecentSearch(name);
    setSearchTerm(name);
    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(name)}`);
  };

  const saveRecentSearch = (term) => {
    let updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-1.5">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                ShopEZ
              </span>
            </Link>
          </div>

          {/* Mega Menu Toggle (Desktop) */}
          <div className="hidden lg:block relative">
            <button
              onMouseEnter={() => setMegaMenuOpen(true)}
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-650 dark:hover:text-indigo-400 py-2 transition-colors"
            >
              <span>Categories</span>
              <ChevronDown size={14} className={`transform transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu Dropdown */}
            {megaMenuOpen && (
              <div
                onMouseLeave={() => setMegaMenuOpen(false)}
                className="absolute left-0 mt-2 w-[480px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl p-6 grid grid-cols-2 gap-4 animate-fade-slide-up"
              >
                {categoriesList.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <Link
                      key={cat.name}
                      to={`/?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMegaMenuOpen(false)}
                      className="flex gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <CatIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                          {cat.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Autocomplete Search Bar */}
          <div ref={searchContainerRef} className="flex-grow max-w-md relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium products, brands, formats..."
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-450 rounded-full py-2 pl-10 pr-4 outline-none text-sm transition-all shadow-inner"
              />
              <button type="submit" className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-700">
                <Search size={16} />
              </button>
            </form>

            {/* Search Suggestions & Recents Dropdown */}
            {showSuggestions && (
              <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-750 rounded-2xl shadow-xl p-4 z-50 animate-fade-slide-up">
                {/* Suggestions List */}
                {suggestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 px-2">Suggestions</h5>
                    <div className="space-y-1">
                      {suggestions.map((s) => (
                        <button
                          key={s._id}
                          onClick={() => handleSuggestionClick(s.name)}
                          className="w-full text-left px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-750 dark:text-slate-200 transition-colors"
                        >
                          <span className="font-semibold truncate">{s.name}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-450 px-2 py-0.5 rounded-full">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h5 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <History size={10} />
                        <span>Recent Searches</span>
                      </h5>
                      <button onClick={clearRecentSearches} className="text-[10px] text-red-500 hover:underline">Clear</button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(s)}
                          className="w-full text-left px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl text-xs text-slate-650 dark:text-slate-350 truncate"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions.length === 0 && recentSearches.length === 0 && (
                  <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-2">
                    Type 2+ characters to see suggestions
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Hand Nav */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-650 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-650 dark:text-slate-300 hover:text-pink-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-650 dark:text-slate-300 hover:text-indigo-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              title="Cart"
            >
              <ShoppingBag size={20} />
              {itemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-br from-indigo-500 to-purple-650 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Profile Menu Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
                </button>

                {/* Profile Dropdown Box */}
                {profileDropdownOpen && (
                  <div
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fade-slide-up text-sm font-semibold"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-750 mb-1">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl text-slate-750 dark:text-slate-200"
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl text-slate-750 dark:text-slate-200"
                    >
                      <ClipboardList size={16} />
                      <span>My Orders</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl text-purple-650 dark:text-purple-400"
                      >
                        <LayoutDashboard size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {(user.role === 'seller' || user.role === 'admin') && (
                      <Link
                        to="/seller"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl text-indigo-650 dark:text-indigo-400"
                      >
                        <LayoutDashboard size={16} />
                        <span>Seller Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-bold text-slate-650 dark:text-slate-300 hover:text-indigo-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2 rounded-xl shadow-md shadow-indigo-600/15"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Control Buttons */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            {/* Dark Mode toggle for mobile */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-slate-600 dark:text-slate-300"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Shopping cart for mobile */}
            <Link to="/cart" className="relative p-1.5 text-slate-600 dark:text-slate-300">
              <ShoppingBag size={18} />
              {itemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-slate-900">
                  {itemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-650 dark:text-slate-300 p-1.5"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-4 px-4 space-y-4 shadow-xl z-50 text-sm font-semibold text-slate-700 dark:text-slate-200 animate-fade-slide-up">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-750 text-slate-800 dark:text-slate-100 rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:bg-white"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </form>

          {/* Nav list */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            Shop Home
          </Link>

          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            <span>My Wishlist</span>
            {wishlistCount > 0 && <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>}
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                My Profile
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                My Orders
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-1.5 text-purple-650 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl"
                >
                  Admin Dashboard
                </Link>
              )}

              {(user.role === 'seller' || user.role === 'admin') && (
                <Link
                  to="/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-2 py-1.5 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl"
                >
                  Seller Dashboard
                </Link>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-1.5 text-red-500 hover:text-red-600 py-1.5 px-3 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-slate-600 dark:text-slate-350 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-indigo-600 text-white py-2.5 rounded-xl shadow-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
