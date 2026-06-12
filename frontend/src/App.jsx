import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Wishlist from './pages/Wishlist';
import ProfileDashboard from './pages/ProfileDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
            {/* Header / Navbar */}
            <Navbar />

            {/* Main Application Container */}
            <main className="flex-grow pb-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Client Routes */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Seller Routes */}
                <Route
                  path="/seller"
                  element={
                    <ProtectedRoute sellerOnly={true}>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Administrative Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Premium Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                <p className="font-semibold text-slate-400">ShopEZ • Full-Stack E-commerce Sandbox</p>
                <p>Designed with MongoDB, Express.js, React.js (Vite), and Tailwind CSS.</p>
                <p className="pt-2 text-slate-650">&copy; 2026 ShopEZ Inc. All Rights Reserved.</p>
              </div>
            </footer>
          </div>
        </Router>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
