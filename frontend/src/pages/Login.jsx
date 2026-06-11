import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, redirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setSubmitError('');

    try {
      await login(email, password);
    } catch (err) {
      setSubmitError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800">Sign In</h1>
          <p className="text-sm text-slate-500 font-semibold">Welcome back to ShopEZ</p>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-100 text-red-650 p-3.5 rounded-xl text-xs flex items-center space-x-2 font-semibold">
            <ShieldAlert size={16} />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition-all"
              />
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none text-sm transition-all"
              />
              <KeyRound className="absolute left-3.5 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/15"
          >
            <span>{loading ? 'Signing In...' : 'Login'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Accounts:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials('john@gmail.com', '123456')}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-left p-2.5 rounded-xl text-xs transition-colors"
            >
              <div className="font-bold text-indigo-600">Customer Account</div>
              <div className="text-slate-500 truncate">john@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@shopez.com', 'admin123')}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-left p-2.5 rounded-xl text-xs transition-colors"
            >
              <div className="font-bold text-purple-600">Admin Account</div>
              <div className="text-slate-500 truncate">admin@shopez.com</div>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          New to ShopEZ?{' '}
          <Link
            to={redirect !== '/' ? `/register?redirect=${redirect}` : '/register'}
            className="text-indigo-600 hover:underline font-bold"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
