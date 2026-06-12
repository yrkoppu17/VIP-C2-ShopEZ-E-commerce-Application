import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  Loader2,
  Upload,
  Store,
  CreditCard,
  Calendar
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SellerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);

  // Product Modal/Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Electronics',
    stockQuantity: '',
    brand: '',
    images: [''],
  });
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  // Store settings form state
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    logo: '',
    banner: '',
    payoutInfo: {
      bankAccount: '',
      routingNumber: ''
    }
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      // Fetch seller's own products
      const pRes = await api.get(`/api/products?seller=${user._id}`);
      setProducts(pRes.data);

      // Fetch seller's orders
      const oRes = await api.get('/api/orders/seller');
      setOrders(oRes.data);

      // Fetch seller specific analytics
      const aRes = await api.get('/api/analytics/seller');
      setAnalytics(aRes.data);

      // Fetch seller profile
      const profRes = await api.get('/api/users/seller/profile');
      setStoreProfile(profRes.data);
      if (profRes.data) {
        setStoreForm({
          storeName: profRes.data.storeName || '',
          description: profRes.data.description || '',
          logo: profRes.data.logo || '',
          banner: profRes.data.banner || '',
          payoutInfo: {
            bankAccount: profRes.data.payoutInfo?.bankAccount || '',
            routingNumber: profRes.data.payoutInfo?.routingNumber || ''
          }
        });
      }
    } catch (err) {
      console.error('Seller dashboard load error', err);
      showToast('Error loading seller dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  // Product CRUD
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Electronics',
      stockQuantity: '',
      brand: '',
      images: [''],
    });
    setFormError('');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      price: p.price,
      description: p.description,
      category: p.category,
      stockQuantity: p.stockQuantity,
      brand: p.brand || '',
      images: p.images || [''],
    });
    setFormError('');
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product? This action is permanent.')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Product deleted.', 'success');
      fetchSellerData();
    } catch (err) {
      showToast('Delete operation failed', 'error');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    setUploading(true);

    try {
      const { data } = await api.post('/api/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, images: [data.image] });
      showToast('Image uploaded successfully!', 'success');
    } catch (err) {
      showToast('File upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity)
    };

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/api/products', payload);
        showToast('Product created successfully!', 'success');
      }
      setShowProductModal(false);
      fetchSellerData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save operation failed');
    }
  };

  // Order status advancement
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      await api.put(`/api/orders/seller/${orderId}/fulfill`, { deliveryStatus: nextStatus });
      showToast(`Order status advanced to: ${nextStatus}`, 'success');
      fetchSellerData();
    } catch (err) {
      showToast('Fulfillment update failed', 'error');
    }
  };

  // Save profile settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await api.put('/api/users/seller/profile', storeForm);
      showToast('Store profile configurations saved!', 'success');
      fetchSellerData();
    } catch (err) {
      showToast('Store settings update failed', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Analytics Chart Configurations
  const getSalesChartData = () => {
    if (!analytics) return { labels: [], datasets: [] };
    return {
      labels: analytics.months,
      datasets: [
        {
          label: 'Store Earnings ($)',
          data: analytics.salesData,
          fill: false,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.5)',
          tension: 0.35,
        },
      ],
    };
  };

  const getUnitsChartData = () => {
    if (!analytics) return { labels: [], datasets: [] };
    return {
      labels: analytics.months,
      datasets: [
        {
          label: 'Units Shipped',
          data: analytics.unitsData,
          fill: true,
          borderColor: 'rgb(219, 39, 119)',
          backgroundColor: 'rgba(219, 39, 119, 0.05)',
          tension: 0.2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#64748B',
          font: { family: 'Outfit', weight: 'bold' },
        },
      },
    },
    scales: {
      y: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B', font: { family: 'Outfit' } },
      },
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B', font: { family: 'Outfit' } },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center space-x-2 dark:bg-slate-900 transition-colors">
        <Loader2 size={24} className="animate-spin text-indigo-650" />
        <span className="text-slate-500 font-bold dark:text-slate-400">Loading vendor dashboard catalog...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 dark:bg-slate-900 transition-colors text-slate-800 dark:text-slate-100 text-left">
      {/* Banner / Store Header */}
      {storeProfile && (
        <div className="relative h-48 rounded-[32px] overflow-hidden mb-8 shadow-sm border border-slate-200 dark:border-slate-850">
          <img src={storeProfile.banner} alt="" className="w-full h-full object-cover brightness-[0.7]" />
          <div className="absolute bottom-6 left-8 flex items-center gap-4 text-white">
            <img src={storeProfile.logo} alt="" className="w-16 h-16 object-contain rounded-2xl bg-white border-2 border-white shadow-md" />
            <div>
              <h1 className="text-2xl font-black">{storeProfile.storeName}</h1>
              <p className="text-xs text-slate-200/90 mt-1 max-w-lg truncate font-semibold">{storeProfile.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto no-scrollbar font-bold text-xs uppercase tracking-wider">
        {['analytics', 'products', 'orders', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === tab
                ? 'border-indigo-650 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. TAB: Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-fade-slide-up">
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gross Sales</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">${analytics.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Store Catalog</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{analytics.totalProductsCount} Items</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/35 flex items-center justify-center text-indigo-600">
                <Package size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fulfillments</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{orders.length} Orders</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/35 flex items-center justify-center text-pink-650">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Units Shipped</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{analytics.totalUnitsSold} Units</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/35 flex items-center justify-center text-purple-600">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Banner */}
          {analytics.lowStockProductsCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/35 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-500" />
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Low Stock Inventory Warning</h4>
                  <p className="text-slate-500 dark:text-slate-450 mt-0.5">{analytics.lowStockProductsCount} products are below safety levels (Qty &le; 5). Please restock inventory soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm h-80">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Earnings Progression</h3>
              <Line data={getSalesChartData()} options={chartOptions} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm h-80">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Units Dispatched Timeline</h3>
              <Bar data={getUnitsChartData()} options={chartOptions} />
            </div>
          </div>

          {/* Low stock table details */}
          {analytics.lowStockProducts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-750 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Replenishment Priority Ledger</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Remaining Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-750 font-semibold text-slate-600 dark:text-slate-350">
                    {analytics.lowStockProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                        <td className="p-3 text-slate-450">{p.category}</td>
                        <td className="p-3">${p.price.toFixed(2)}</td>
                        <td className="p-3 text-rose-600 font-extrabold">{p.stockQuantity} Left</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TAB: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-fade-slide-up">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Stock Catalog</h3>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl shadow flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Register Product</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-750 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350 font-semibold">
                  {products.map((p) => {
                    const isLowStock = p.stockQuantity <= 5;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <img src={p.images?.[0]} alt="" className="w-8 h-8 object-contain bg-slate-50 border rounded" />
                            <span className="truncate max-w-xs">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-4">${p.price.toFixed(2)}</td>
                        <td className="p-4 text-slate-400">{p.category}</td>
                        <td className="p-4">
                          <span className={`font-extrabold ${
                            p.stockQuantity === 0 ? 'text-red-650' : isLowStock ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'
                          }`}>
                            {p.stockQuantity} {isLowStock ? '⚠️' : ''}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-indigo-650 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-1.5 text-red-505 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                        No catalog listings found. Add your first store product above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fade-slide-up">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Fulfillment Tracker</h3>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-750 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">My Item Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Advance Fulfilment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350 font-semibold">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-mono text-xs text-indigo-750">{o._id}</td>
                      <td className="p-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 space-y-1">
                        {o.orderItems.map((item, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                            <span className="text-slate-400"> (Qty: {item.qty} &bull; ${item.price})</span>
                          </div>
                        ))}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          o.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : o.deliveryStatus === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {o.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {o.deliveryStatus !== 'Delivered' ? (
                          <select
                            value={o.deliveryStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs py-1 px-2 focus:border-indigo-500 font-semibold outline-none"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs pr-4">Fulfilled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                        No orders registered for your products yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: Store Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-xl animate-fade-slide-up">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-750 pb-3 flex items-center gap-2">
            <Store size={18} className="text-indigo-650" />
            <span>Store Settings & Customizations</span>
          </h3>

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Store Brand Name</label>
              <input
                type="text"
                required
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
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
                className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Logo URL</label>
                <input
                  type="url"
                  value={storeForm.logo}
                  onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Banner Image URL</label>
                <input
                  type="url"
                  value={storeForm.banner}
                  onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Payout Banking info */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-750">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1">
                <CreditCard size={12} className="text-indigo-650" />
                <span>Payout Bank Accounts</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bank Routing Number</label>
                  <input
                    type="text"
                    value={storeForm.payoutInfo.routingNumber}
                    onChange={(e) => setStoreForm({
                      ...storeForm,
                      payoutInfo: { ...storeForm.payoutInfo, routingNumber: e.target.value }
                    })}
                    placeholder="e.g. 021000021"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bank Account Number</label>
                  <input
                    type="text"
                    value={storeForm.payoutInfo.bankAccount}
                    onChange={(e) => setStoreForm({
                      ...storeForm,
                      payoutInfo: { ...storeForm.payoutInfo, bankAccount: e.target.value }
                    })}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-3 px-6 rounded-xl transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5 mt-6"
            >
              {settingsSaving ? <Loader2 size={12} className="animate-spin" /> : null}
              <span>Save Config Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* Product CRUD Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 p-6 relative flex flex-col max-h-[90vh] shadow-2xl">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-750">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-755 pb-3">
              {editingProduct ? 'Edit Catalog Product' : 'Register New Product'}
            </h3>

            {formError && <div className="bg-red-50 border border-red-155 text-red-655 p-3 rounded-xl text-xs mb-4">{formError}</div>}

            <form onSubmit={handleProductSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="29.99"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="100"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Watches">Watches</option>
                    <option value="Books">Books</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Sports">Sports</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, sizes..."
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white resize-none"
                />
              </div>

              {/* Image upload file picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Product Image URL / File Upload</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={formData.images[0]}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    placeholder="https://..."
                    className="flex-grow bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none focus:bg-white"
                  />
                  <label className="bg-indigo-650 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase py-3 px-4 rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>Upload File</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-755 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl shadow shadow-indigo-600/10"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
