import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CreditCard, Truck, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Shipping details state
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [saveAddress, setSaveAddress] = useState(false);

  // Card simulation state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !postalCode || !country) {
      setError('Please fill out all address fields');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setError('Please fill out all payment fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // 1. Simulating payment intent call on backend
      const intentRes = await api.post('/api/payment/create-intent', {
        amount: Math.round(totalPrice * 100),
      });

      const { clientSecret } = intentRes.data;

      // 2. Simulate payment processing logic
      await new Promise((resolve) => setTimeout(resolve, 1500)); // processing delay

      const mockPaymentResult = {
        id: `ch_mock_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: user.email,
      };

      // 3. Save Address to User Profile if checked
      if (saveAddress) {
        await updateProfile({
          name: user.name,
          email: user.email,
          address: { street, city, postalCode, country },
        });
      }

      // 4. Create the order
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
          product: item.product,
        })),
        shippingAddress: { street, city, postalCode, country },
        paymentMethod: 'Card Simulation',
        totalPrice,
        paymentResult: mockPaymentResult,
      };

      const { data } = await api.post('/api/orders', orderData);
      setOrderId(data._id);
      clearCart();
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-slate-550 mb-4 font-semibold">Your cart is empty. Cannot checkout.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl transition-all"
        >
          Go Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-center space-x-4 mb-10">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>1</div>
          <span className={`text-sm font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Shipping</span>
        </div>
        <div className="h-[1px] w-12 bg-slate-200"></div>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>2</div>
          <span className={`text-sm font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Payment</span>
        </div>
        <div className="h-[1px] w-12 bg-slate-200"></div>
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
          }`}>3</div>
          <span className={`text-sm font-bold ${step === 3 ? 'text-slate-800' : 'text-slate-400'}`}>Complete</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-650 p-4 rounded-xl text-sm mb-6 flex items-center space-x-2 max-w-xl mx-auto font-semibold">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form Side */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2 mb-4">
                <Truck size={20} className="text-indigo-600" />
                <span>Shipping Address</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="123 Main St"
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="USA"
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm transition-all"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="rounded bg-white border-slate-200 text-indigo-650 focus:ring-indigo-500 h-4 w-4"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-slate-500 font-semibold select-none">
                    Save address to my profile
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-650/10 hover:shadow-indigo-600/30"
              >
                Proceed to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center space-x-2">
                  <CreditCard size={20} className="text-indigo-600" />
                  <span>Stripe Card Simulation</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  Edit Address
                </button>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs space-y-2 text-slate-650">
                <p className="font-bold text-indigo-600">💳 Mock Details for Successful Sandbox Checkout:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Card Number: <span className="font-mono text-slate-800 font-semibold">4242 4242 4242 4242</span></li>
                  <li>Expiry: <span className="font-mono text-slate-800 font-semibold">12/29</span>, CVC: <span className="font-mono text-slate-800 font-semibold">123</span></li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 font-mono rounded-xl p-3 outline-none text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/29"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 font-mono rounded-xl p-3 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 font-mono rounded-xl p-3 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 pt-2 justify-center">
                  <Lock size={12} />
                  <span>Payments encrypted securely via mock gateway API</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-650/15"
              >
                <span>{loading ? 'Processing Mock Stripe Charge...' : `Pay $${totalPrice.toFixed(2)}`}</span>
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-800">Order Placed Successfully!</h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
                  Thank you for shopping with ShopEZ. Your payment was validated, and your inventory items have been dispatched.
                </p>
                <p className="text-xs text-slate-450 font-semibold">
                  Order Reference: <span className="font-mono text-indigo-600 font-bold">{orderId}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => navigate('/my-orders')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-650/10"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-650 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Side */}
        {step !== 3 && (
          <div className="lg:col-span-1">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3">
                Items Summary
              </h3>
              
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {cartItems.map((item) => (
                  <div key={item.product} className="flex justify-between items-center text-sm gap-2">
                    <span className="text-slate-500 font-medium line-clamp-1 flex-grow">
                      {item.name} <span className="text-xs font-bold text-indigo-600">x{item.qty}</span>
                    </span>
                    <span className="font-bold text-slate-700 whitespace-nowrap">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-slate-500 text-xs font-semibold">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">Total Price</span>
                  <span className="text-lg font-extrabold text-indigo-650">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
