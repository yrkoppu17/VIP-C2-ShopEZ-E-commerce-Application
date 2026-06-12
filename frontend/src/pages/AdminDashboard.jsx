import { useState, useEffect } from 'react';
import api from '../utils/api';
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
  Users,
  Trash2,
  Edit,
  Plus,
  X,
  Check,
  Loader2,
  Upload,
  TrendingUp,
  AlertTriangle,
  Lock,
  Unlock,
  Tag,
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

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');

  // Base Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics states
  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);

  // Product CRUD states
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

  // Coupon CRUD states
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    expiryDate: '',
    minPurchaseAmount: '0',
    isActive: true
  });

  // Sellers application states
  const [sellers, setSellers] = useState([]);

  // Customer Orders view state
  const [selectedCustomerOrders, setSelectedCustomerOrders] = useState(null); // null or user object

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const pRes = await api.get('/api/products');
      const oRes = await api.get('/api/orders');
      const uRes = await api.get('/api/users');
      setProducts(pRes.data);
      setOrders(oRes.data);
      setUsersList(uRes.data);

      // Fetch analytics
      const salesRes = await api.get('/api/analytics/sales');
      setSalesAnalytics(salesRes.data);

      const catRes = await api.get('/api/analytics/categories');
      setCategoryAnalytics(catRes.data);

      const topRes = await api.get('/api/analytics/products');
      setTopProducts(topRes.data);

      const invRes = await api.get('/api/analytics/inventory');
      setInventoryReport(invRes.data);

      // Fetch coupons
      const coupRes = await api.get('/api/coupons');
      setCoupons(coupRes.data);

      // Fetch sellers
      const sRes = await api.get('/api/users/admin/sellers');
      setSellers(sRes.data);

    } catch (err) {
      console.error('Admin dashboard load error', err);
      showToast('Error loading dashboard records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (id) => {
    try {
      await api.put(`/api/users/admin/sellers/${id}/approve`);
      showToast('Seller approved successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to approve seller', 'error');
    }
  };

  const handleRejectSeller = async (id) => {
    if (!window.confirm('Reject this seller application?')) return;
    try {
      await api.put(`/api/users/admin/sellers/${id}/reject`);
      showToast('Seller application rejected.', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to reject seller', 'error');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Product CRUD commands
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
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      showToast('Product removed.', 'success');
      fetchDashboardData();
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

  const handleFormSubmit = async (e) => {
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
        showToast('Product updated!', 'success');
      } else {
        await api.post('/api/products', payload);
        showToast('Product created!', 'success');
      }
      setShowProductModal(false);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save operation failed');
    }
  };

  // Coupon CRUD commands
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: '',
      discountType: 'Percentage',
      discountValue: '',
      expiryDate: '',
      minPurchaseAmount: '0',
      isActive: true
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      expiryDate: new Date(c.expiryDate).toISOString().substring(0, 10),
      minPurchaseAmount: c.minPurchaseAmount,
      isActive: c.isActive
    });
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...couponForm,
      discountValue: Number(couponForm.discountValue),
      minPurchaseAmount: Number(couponForm.minPurchaseAmount)
    };

    try {
      if (editingCoupon) {
        await api.put(`/api/coupons/${editingCoupon._id}`, payload);
        showToast('Coupon updated!', 'success');
      } else {
        await api.post('/api/coupons', payload);
        showToast('Coupon created!', 'success');
      }
      setShowCouponModal(false);
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to save coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (cId) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/api/coupons/${cId}`);
      showToast('Coupon deleted.', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Delete operation failed', 'error');
    }
  };

  // Block/Unblock Customer
  const handleToggleBlockCustomer = async (cust) => {
    try {
      const nextBlocked = !cust.isBlocked;
      const { data } = await api.put(`/api/users/${cust._id}/block`, { isBlocked: nextBlocked });
      setUsersList(usersList.map((u) => u._id === cust._id ? { ...u, isBlocked: data.isBlocked } : u));
      showToast(
        data.isBlocked ? `User "${cust.name}" is now blocked.` : `User "${cust.name}" is now unblocked.`,
        'success'
      );
    } catch (err) {
      showToast('Block toggling operation failed', 'error');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/deliver`, { deliveryStatus: newStatus });
      showToast(`Order status updated to: ${newStatus}`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Status update failed', 'error');
    }
  };

  // Compute widgets
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  // Charts data configurations
  const getSalesChartData = () => {
    if (!salesAnalytics) return { labels: [], datasets: [] };
    return {
      labels: salesAnalytics.months,
      datasets: [
        {
          label: 'Revenue ($)',
          data: salesAnalytics.salesData,
          fill: false,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.35,
        },
      ],
    };
  };

  const getCustomerGrowthChartData = () => {
    if (!salesAnalytics) return { labels: [], datasets: [] };
    return {
      labels: salesAnalytics.months,
      datasets: [
        {
          label: 'Active Customers',
          data: salesAnalytics.customerGrowthData,
          fill: true,
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.2,
        },
      ],
    };
  };

  const getCategoryPerformanceChartData = () => {
    if (!categoryAnalytics) return { labels: [], datasets: [] };
    const labels = Object.keys(categoryAnalytics);
    const data = Object.values(categoryAnalytics);
    return {
      labels,
      datasets: [
        {
          label: 'Sales Revenue by Category ($)',
          data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(139, 92, 246, 0.7)',
          ],
          borderWidth: 1,
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
        <span className="text-slate-500 font-bold dark:text-slate-400">Loading administrative ledger records...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 dark:bg-slate-900 transition-colors text-slate-800 dark:text-slate-100 text-left">
      <h1 className="text-3xl font-extrabold text-slate-850 dark:text-slate-100 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        Admin Ledger Dashboard
      </h1>

      {/* Tab controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-4 overflow-x-auto no-scrollbar font-bold text-xs uppercase tracking-wider">
        {['analytics', 'products', 'orders', 'customers', 'coupons', 'sellers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 border-b-2 transition-all flex-shrink-0 ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. TAB: Analytics Charts */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Card Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gross Revenue</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">${totalSales.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Catalog Size</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{products.length} Items</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/35 flex items-center justify-center text-indigo-650">
                <Package size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Orders Dispatched</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{orders.length} Orders</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/35 flex items-center justify-center text-pink-600">
                <ShoppingCart size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Registered Accounts</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">{usersList.length} Users</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/35 flex items-center justify-center text-purple-650">
                <Users size={20} />
              </div>
            </div>
          </div>

          {/* Inventory warning bar if low stock */}
          {inventoryReport && inventoryReport.lowStockProductsCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/35 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-amber-500" />
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Low Stock warnings: {inventoryReport.lowStockProductsCount} products alert.</h4>
                  <p className="text-slate-500 dark:text-slate-450 mt-0.5">Some items in your store catalog inventory have fallen below safety thresholds (Qty &le; 5).</p>
                </div>
              </div>
            </div>
          )}

          {/* Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm h-80">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Revenue Growth Trend</h3>
              <Line data={getSalesChartData()} options={chartOptions} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm h-80">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Category Revenue Breakdown</h3>
              <Bar data={getCategoryPerformanceChartData()} options={chartOptions} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm h-80">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Active Customer Index</h3>
              <Line data={getCustomerGrowthChartData()} options={chartOptions} />
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-750 shadow-sm overflow-hidden flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-4">Bestsellers Summary</h3>
              <div className="overflow-y-auto max-h-56 pr-1 space-y-3">
                {topProducts.map((p, index) => (
                  <div key={p._id} className="flex items-center justify-between text-xs border-b border-slate-50 dark:border-slate-750 pb-2">
                    <div className="flex gap-2.5 items-center">
                      <span className="w-5 text-slate-400 font-bold">#{index + 1}</span>
                      <img src={p.image} alt="" className="w-8 h-8 object-contain" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{p.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-850 dark:text-slate-100">{p.quantitySold} Sold</p>
                      <p className="text-[10px] text-slate-400">${p.revenueGenerated} Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: Products Ledger & Low Stock Warning */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Product Ledger Registry</h3>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl shadow flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Create Product</span>
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350">
                  {products.map((p) => {
                    const isLowStock = p.stockQuantity <= 5;
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                        <td className="p-4 font-semibold">${p.price.toFixed(2)}</td>
                        <td className="p-4 text-xs font-bold text-slate-400">{p.category}</td>
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
                            className="p-1.5 text-red-500 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: Customer block manager & order review */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Store Accounts Manager</h3>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-750 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350 font-semibold">
                  {usersList.map((cust) => (
                    <tr key={cust._id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{cust.name}</td>
                      <td className="p-4">{cust.email}</td>
                      <td className="p-4 text-xs font-extrabold uppercase text-slate-400">{cust.role}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          cust.isBlocked 
                            ? 'bg-rose-50 border-rose-100 text-rose-600' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          {cust.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2.5">
                        {cust.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlockCustomer(cust)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              cust.isBlocked 
                                ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50' 
                                : 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            }`}
                            title={cust.isBlocked ? 'Unblock Account' : 'Block Account'}
                          >
                            {cust.isBlocked ? <Unlock size={14} /> : <Lock size={14} />}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            // Filter orders for this customer
                            const list = orders.filter(o => o.user?._id?.toString() === cust._id.toString() || o.user === cust._id);
                            setSelectedCustomerOrders({ user: cust, list });
                          }}
                          className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-250 text-slate-700 dark:text-slate-250 text-[10px] font-bold uppercase py-1.5 px-2.5 rounded-lg"
                        >
                          View Orders
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: Orders Fulfilments */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Customer Delivery steppers</h3>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-750 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Stepper Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-mono text-xs text-indigo-750">{o._id}</td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{o.user?.name || 'Guest'}</td>
                      <td className="p-4 font-extrabold text-slate-700 dark:text-slate-205">${o.totalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {o.paymentStatus}
                        </span>
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
                            className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs py-1 px-2 focus:border-indigo-500 font-semibold"
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: Coupons Board */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-750 pb-3">
            <h3 className="text-lg font-bold flex items-center gap-1.5">
              <Tag size={18} className="text-indigo-650" />
              <span>Coupon Promo Codes</span>
            </h3>
            <button
              onClick={handleOpenAddCoupon}
              className="bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl shadow flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div key={c._id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-750 flex justify-between shadow-sm relative group">
                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-150 flex items-center gap-2">
                    <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-650 px-2 py-0.5 rounded border border-indigo-150">{c.code}</span>
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </h4>
                  
                  <p>Discount: <span className="text-slate-750 font-bold">{c.discountValue}{c.discountType === 'Percentage' ? '%' : '$'} Off</span></p>
                  <p>Min Purchase: <span className="text-slate-700 font-bold">${c.minPurchaseAmount}</span></p>
                  <p className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 self-start">
                  <button
                    onClick={() => handleOpenEditCoupon(c)}
                    className="p-1.5 text-indigo-600 hover:bg-slate-50 rounded-lg"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(c._id)}
                    className="p-1.5 text-red-500 hover:bg-slate-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB: Sellers Onboarding Approvals */}
      {activeTab === 'sellers' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Seller Onboarding Ledger</h3>

          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-750 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-750 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Store Name</th>
                    <th className="p-4">Owner Name</th>
                    <th className="p-4">Owner Email</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-slate-650 dark:text-slate-350 font-semibold">
                  {sellers.map((sell) => (
                    <tr key={sell._id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-2">
                          <img src={sell.logo} alt="" className="w-7 h-7 object-contain rounded-md bg-slate-50 border" />
                          <span>{sell.storeName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-750 dark:text-slate-250">{sell.user?.name || 'Unknown'}</td>
                      <td className="p-4 text-slate-500">{sell.user?.email || 'N/A'}</td>
                      <td className="p-4 max-w-xs truncate text-slate-450">{sell.description}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sell.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : sell.status === 'rejected' 
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {sell.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {sell.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveSeller(sell._id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg flex items-center gap-0.5 shadow-sm"
                            >
                              <Check size={10} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectSeller(sell._id)}
                              className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase py-1.5 px-3 rounded-lg flex items-center gap-0.5 shadow-sm"
                            >
                              <X size={10} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs pr-4 uppercase tracking-wider text-[10px]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sellers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        No seller applications registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Product CRUD Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 p-6 relative flex flex-col max-h-[90vh] shadow-2xl">
            <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-755 pb-3">
              {editingProduct ? 'Edit Product Catalog Item' : 'Add New Product'}
            </h3>

            {formError && <div className="bg-red-50 border border-red-155 text-red-655 p-3 rounded-xl text-xs mb-4">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Product name"
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="9.99"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="100"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Brand"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  >
                    {['Electronics', 'Fashion', 'Footwear', 'Watches', 'Books', 'Home Appliances', 'Sports', 'Beauty', 'Grocery', 'Accessories'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Upload Cover Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Paste Image URL"
                      value={formData.images[0]}
                      onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                      className="flex-grow bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                    />
                    <label className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 border p-3 rounded-xl cursor-pointer flex items-center justify-center flex-shrink-0">
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Detailed specifications description</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="specs..."
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-805 dark:text-slate-100 rounded-xl p-3 outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-750">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-white dark:bg-slate-800 border hover:bg-slate-5"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-650 text-white px-5 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon CRUD Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-705 p-6 relative shadow-2xl">
            <button onClick={() => setShowCouponModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 border-b border-slate-100 dark:border-slate-750 pb-3">
              {editingCoupon ? 'Edit Discount Coupon' : 'Create Promo Coupon'}
            </h3>

            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs font-semibold text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl p-3 outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Cash ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Min Purchase Limit</label>
                  <input
                    type="number"
                    required
                    value={couponForm.minPurchaseAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchaseAmount: e.target.value })}
                    placeholder="50"
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 rounded-xl p-3 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="rounded bg-slate-50 border-slate-200 text-indigo-650 h-4 w-4"
                />
                <label htmlFor="couponActive" className="text-xs text-slate-500 font-bold select-none">Mark Coupon as Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-755 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="bg-white dark:bg-slate-800 border hover:bg-slate-5"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-650 text-white px-5 rounded-xl">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Orders view modal */}
      {selectedCustomerOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-6 relative flex flex-col max-h-[85vh] shadow-2xl">
            <button
              onClick={() => setSelectedCustomerOrders(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-100 mb-6 border-b border-slate-105 pb-3">
              Purchase history: {selectedCustomerOrders.user.name}
            </h3>

            <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
              {selectedCustomerOrders.list.length === 0 ? (
                <p className="text-slate-400 py-8 text-center">No orders registered for this user.</p>
              ) : (
                selectedCustomerOrders.list.map((order) => (
                  <div key={order._id} className="border p-4 rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850/50">
                    <div className="flex justify-between font-bold text-slate-500 mb-2.5">
                      <span>ID: {order._id}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.name} (x{item.qty})</span>
                          <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between font-extrabold text-slate-800 dark:text-slate-150">
                      <span>Total Amount Paid</span>
                      <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
