import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, sellerOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Redirect to home if they are not admin
    return <Navigate to="/" replace />;
  }

  if (sellerOnly && user.role !== 'seller' && user.role !== 'admin') {
    // Redirect to home if they are not seller or admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
