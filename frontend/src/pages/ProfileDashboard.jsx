import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  User, 
  MapPin, 
  ClipboardList, 
  MessageSquare, 
  ShieldCheck, 
  Key, 
  Trash2, 
  Edit, 
  Plus, 
  Loader2, 
  X,
  Calendar,
  CheckCircle,
  Truck
} from 'lucide-react';

const ProfileDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // null means adding
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    name: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'USA'
  });

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // User reviews state
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Seller portal states
  const [sellerProfile, setSellerProfile] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    logo: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
  });
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  const fetchSellerProfile = async () => {
    setSellerLoading(true);
    try {
      const { data } = await api.get('/api/users/seller/profile');
      setSellerProfile(data);
      if (data) {
        setStoreForm({
          storeName: data.storeName || '',
          description: data.description || '',
          logo: data.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=80',
          banner: data.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
        });
      }
    } catch (err) {
      console.error('No seller profile found');
      setSellerProfile(null);
    } finally {
      setSellerLoading(false);
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreSubmitting(true);
    try {
      const { data } = await api.post('/api/users/seller/apply', storeForm);
      setSellerProfile(data);
      showToast('Seller application submitted successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Application submission failed', 'error');
    } finally {
      setStoreSubmitting(false);
    }
  };

  // Load addresses
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const { data } = await api.get('/api/users/profile');
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Load orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await api.get('/api/orders/myorders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setProfileName(user.name || '');
    setProfileEmail(user.email || '');
    fetchAddresses();
    fetchOrders();
    fetchSellerProfile();
  }, [user]);

  // Profile Save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profilePassword !== profileConfirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        password: profilePassword || undefined
      });
      showToast('Profile updated successfully!', 'success');
      setProfilePassword('');
      setProfileConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Profile update failed', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Open address modal for add
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: 'Home',
      name: user?.name || '',
      street: '',
      city: '',
      postalCode: '',
      country: 'USA'
    });
    setShowAddressModal(true);
  };

  // Open address modal for edit
  const handleOpenEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      name: addr.name,
      street: addr.street,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country
    });
    setShowAddressModal(true);
  };

  // Address Submit (Add/Edit)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        const { data } = await api.put(`/api/users/addresses/${editingAddress._id}`, addressForm);
        setAddresses(data);
        showToast('Address updated successfully!', 'success');
      } else {
        const { data } = await api.post('/api/users/addresses', addressForm);
        setAddresses(data);
        showToast('New address saved!', 'success');
      }
      setShowAddressModal(false);
    } catch (err) {
      showToast('Address saving failed', 'error');
    }
  };

  // Address Delete
  const handleAddressDelete = async (addrId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const { data } = await api.delete(`/api/users/addresses/${addrId}`);
      setAddresses(data);
      showToast('Address deleted.', 'success');
    } catch (err) {
      showToast('Address deletion failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 dark:bg-slate-900 transition-colors text-slate-800 dark:text-slate-100 text-left">
      <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        User Profile Settings
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar tabs selection */}
        <div className="w-full lg:w-64 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 rounded-3xl p-5 space-y-2.5 shadow-sm flex-shrink-0 font-semibold">
          {[
            { id: 'profile', label: 'My Settings', icon: User },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'orders', label: 'Order History', icon: ClipboardList },
            { id: 'seller-portal', label: 'Seller Portal', icon: ShieldCheck }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all ${
                  isActive 
                    ? 'bg-indigo-650 text-white shadow shadow-indigo-600/10' 
                    : 'text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:text-slate-800'
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic content rendering column */}
        <div className="flex-grow w-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-750 p-6 md:p-8 rounded-[32px] shadow-sm min-h-[400px]">
          
          {/* TAB 1: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="max-w-md">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-2">
                <Key size={18} className="text-indigo-600" />
                <span>Account Credentials</span>
              </h3>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-750">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Update Password (Optional)</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={profileConfirmPassword}
                        onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 text-xs rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-3 px-6 rounded-xl transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5 mt-6"
                >
                  {profileLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                  <span>Save Profile Changes</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Multiple Address Manager */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-600" />
                  <span>My Addresses</span>
                </h3>
                <button
                  onClick={handleOpenAddAddress}
                  className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-2 px-3.5 rounded-xl transition-all flex items-center gap-1 shadow-md shadow-indigo-650/15"
                >
                  <Plus size={12} />
                  <span>Add Address</span>
                </button>
              </div>

              {addressesLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-450" /></div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No addresses saved yet. Add your Home/Office address for quicker checkout.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="bg-slate-50 dark:bg-slate-850/80 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-750 flex justify-between shadow-sm relative group hover:border-indigo-300 transition-colors">
                      <div className="space-y-1 text-xs">
                        <span className="inline-block bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-650 dark:text-slate-300 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md mb-2">
                          {addr.label}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-150">{addr.name}</h4>
                        <p className="text-slate-550 dark:text-slate-400 font-semibold leading-relaxed mt-1">
                          {addr.street}, {addr.city}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">{addr.postalCode}, {addr.country}</p>
                      </div>

                      <div className="flex flex-col gap-1.5 self-start">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 text-indigo-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleAddressDelete(addr._id)}
                          className="p-1.5 text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Order History List */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-3">
                <ClipboardList size={18} className="text-indigo-600" />
                <span>My Purchase History</span>
              </h3>

              {ordersLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-slate-450" /></div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-slate-450 text-xs">
                  You haven't placed any orders yet. Go shop some products!
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const trackingSteps = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                    const currentStepIdx = trackingSteps.indexOf(order.deliveryStatus);
                    return (
                      <div key={order._id} className="bg-slate-50/50 dark:bg-slate-850/30 p-5 md:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-750 shadow-sm text-xs">
                        {/* Order Meta Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-750 pb-3.5 mb-4 font-semibold text-slate-500">
                          <div className="flex gap-4 items-center">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Placed On</p>
                              <p className="text-slate-700 dark:text-slate-350">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Total Amount</p>
                              <p className="text-slate-800 dark:text-slate-200 font-extrabold">${order.totalPrice.toFixed(2)}</p>
                            </div>
                            {order.couponApplied?.code && (
                              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 text-[10px] uppercase font-bold">
                                Coupon: {order.couponApplied.code}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/25 px-2.5 py-1 rounded text-[10px] uppercase">
                              ID: {order._id}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="space-y-3.5 mb-6">
                          {order.orderItems.map((item, i) => (
                            <div key={i} className="flex gap-3 items-center justify-between">
                              <div className="flex gap-3 items-center">
                                <img src={item.image} alt="" className="w-12 h-12 object-contain bg-white rounded-xl border p-1" />
                                <div>
                                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm truncate max-w-sm">{item.name}</h4>
                                  <p className="text-slate-450 font-bold mt-0.5">Qty: {item.qty} &bull; ${item.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <span className="text-slate-800 dark:text-slate-100 font-extrabold">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Visual tracking timeline Stepper */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-750">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-6 flex items-center gap-1">
                            <Truck size={12} className="text-indigo-650" />
                            <span>Visual Order Tracking</span>
                          </p>

                          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
                            {/* Horizontal connection line for desktop */}
                            <div className="absolute left-0 top-3.5 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 hidden sm:block z-0" />
                            
                            {trackingSteps.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx;
                              const isCurrent = idx === currentStepIdx;
                              return (
                                <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-1.5 z-10 w-full sm:w-28 relative">
                                  {/* Dot */}
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                    isCompleted 
                                      ? 'bg-indigo-650 border-indigo-650 text-white shadow shadow-indigo-600/10' 
                                      : 'bg-white dark:bg-slate-850 border-slate-250 dark:border-slate-700 text-slate-400'
                                  }`}>
                                    {isCompleted ? <CheckCircle size={14} className="fill-indigo-650" /> : <span className="font-bold text-xs">{idx + 1}</span>}
                                  </div>
                                  
                                  {/* Label */}
                                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                                    isCurrent ? 'text-indigo-650 dark:text-indigo-400' : isCompleted ? 'text-slate-750 dark:text-slate-250' : 'text-slate-400'
                                  }`}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Seller Portal */}
          {activeTab === 'seller-portal' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-750 pb-3">
                <ShieldCheck size={18} className="text-indigo-650" />
                <span>Seller Portal Onboarding</span>
              </h3>

              {sellerLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-indigo-650" />
                </div>
              ) : !sellerProfile ? (
                <div className="max-w-xl text-left">
                  <p className="text-xs text-slate-550 dark:text-slate-400 mb-6 leading-relaxed">
                    Apply to become a vendor on **shopEZ**. Once your store application is approved by our administration team, you will receive full access to the vendor analytics dashboard, order fulfillment registry, and catalog inventories.
                  </p>

                  <form onSubmit={handleStoreSubmit} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Name</label>
                      <input
                        type="text"
                        required
                        value={storeForm.storeName}
                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                        placeholder="e.g. My Premium Boutique"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Description</label>
                      <textarea
                        required
                        rows={3}
                        value={storeForm.description}
                        onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                        placeholder="Describe your brand, items, shipping policies..."
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Logo URL</label>
                        <input
                          type="url"
                          value={storeForm.logo}
                          onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Banner URL</label>
                        <input
                          type="url"
                          value={storeForm.banner}
                          onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={storeSubmitting}
                      className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-3 px-6 rounded-xl transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5 mt-6"
                    >
                      {storeSubmitting ? <Loader2 size={12} className="animate-spin" /> : null}
                      <span>Submit Application</span>
                    </button>
                  </form>
                </div>
              ) : sellerProfile.status === 'pending' ? (
                <div className="max-w-xl text-left bg-slate-50 dark:bg-slate-850/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-750">
                  <div className="flex items-center gap-2.5 text-amber-500 mb-4 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Application Status: Pending Review</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 mb-4 leading-relaxed font-semibold">
                    Thank you for applying! Your shop application for **{sellerProfile.storeName}** is currently awaiting review by an admin. We are verifying your details and will activate your account shortly.
                  </p>
                  <div className="text-xs space-y-1 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Shop details submitted:</p>
                    <p className="text-slate-500"><span className="font-bold">Name:</span> {sellerProfile.storeName}</p>
                    <p className="text-slate-550 truncate"><span className="font-bold">Description:</span> {sellerProfile.description}</p>
                  </div>
                </div>
              ) : sellerProfile.status === 'approved' ? (
                <div className="max-w-xl text-left bg-emerald-50/50 dark:bg-emerald-950/10 p-6 rounded-2xl border border-emerald-150 text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-600 mb-4 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Application Status: Approved</span>
                  </div>
                  <p className="text-slate-550 dark:text-slate-400 mb-6 font-semibold leading-relaxed">
                    Congratulations! Your brand store **{sellerProfile.storeName}** is fully active. You have been granted Seller privileges to customize your catalog listings and manage incoming product orders.
                  </p>
                  <button
                    onClick={() => navigate('/seller')}
                    className="bg-indigo-650 hover:bg-indigo-500 text-white font-bold uppercase py-3 px-6 rounded-xl transition-all shadow shadow-indigo-650/15"
                  >
                    Launch Seller Dashboard
                  </button>
                </div>
              ) : (
                <div className="max-w-xl text-left bg-rose-50/50 dark:bg-rose-950/10 p-6 rounded-2xl border border-rose-150">
                  <div className="flex items-center gap-2.5 text-rose-600 mb-4 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Application Status: Rejected</span>
                  </div>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mb-6 font-semibold leading-relaxed">
                    We regret to inform you that your vendor application was not approved. This can happen due to missing store policies or branding criteria. You are welcome to update your information and submit a new application below.
                  </p>
                  
                  <form onSubmit={handleStoreSubmit} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Name</label>
                      <input
                        type="text"
                        required
                        value={storeForm.storeName}
                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                        placeholder="e.g. My Premium Boutique"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Description</label>
                      <textarea
                        required
                        rows={3}
                        value={storeForm.description}
                        onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                        placeholder="Describe your brand, items, shipping policies..."
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Logo URL</label>
                        <input
                          type="url"
                          value={storeForm.logo}
                          onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Banner URL</label>
                        <input
                          type="url"
                          value={storeForm.banner}
                          onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={storeSubmitting}
                      className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-3 px-6 rounded-xl transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5 mt-6"
                    >
                      {storeSubmitting ? <Loader2 size={12} className="animate-spin" /> : null}
                      <span>Resubmit Application</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Address Form modal popup */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 p-6 relative flex flex-col shadow-2xl">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-750 pb-3">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Label</label>
                  <select
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Staging">Staging</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  placeholder="e.g. 123 Wall St"
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Country</label>
                <input
                  type="text"
                  required
                  value={addressForm.country}
                  onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-xl p-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-750 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all shadow shadow-indigo-600/10"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileDashboard;
