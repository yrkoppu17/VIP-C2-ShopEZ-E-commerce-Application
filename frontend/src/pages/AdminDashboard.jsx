import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for Product Add/Edit
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stockQuantity: '',
    images: [''],
  });
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pRes = await api.get('/api/products');
      const oRes = await api.get('/api/orders');
      const uRes = await api.get('/api/users');
      
      setProducts(pRes.data);
      setOrders(oRes.data);
      setUsersList(uRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle open modal for adding
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Electronics',
      stockQuantity: '',
      images: [''],
    });
    setFormError('');
    setShowProductModal(true);
  };

  // Handle open modal for editing
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stockQuantity: product.stockQuantity,
      images: product.images,
    });
    setFormError('');
    setShowProductModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Handle file uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);
    setUploading(true);

    try {
      const { data } = await api.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData({ ...formData, images: [data.image] });
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle Form Submit (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    const productPayload = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      category: formData.category,
      stockQuantity: Number(formData.stockQuantity),
      images: formData.images,
    };

    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct._id}`, productPayload);
      } else {
        await api.post('/api/products', productPayload);
      }
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    }
  };

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/deliver`, { deliveryStatus: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Compute analytics
  const totalSales = orders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.totalPrice, 0);

  // Generate chart data for monthly sales
  const getChartData = () => {
    const monthlySales = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach((m) => {
      monthlySales[m] = 0;
    });

    orders
      .filter((o) => o.paymentStatus === 'Paid')
      .forEach((o) => {
        const date = new Date(o.createdAt);
        const monthName = months[date.getMonth()];
        monthlySales[monthName] += o.totalPrice;
      });

    return {
      labels: months,
      datasets: [
        {
          label: 'Monthly Sales ($)',
          data: months.map((m) => monthlySales[m]),
          fill: false,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#64748B', // Slate 500
          font: {
            family: 'Outfit',
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: '#F1F5F9' }, // Slate 100
        ticks: { color: '#64748B' },
      },
      x: {
        grid: { color: '#F1F5F9' },
        ticks: { color: '#64748B' },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center space-x-2">
        <Loader2 size={24} className="animate-spin text-indigo-650" />
        <span className="text-slate-500 font-bold">Loading Dashboard records...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Admin / Seller Dashboard</h1>

      {/* Tab controls */}
      <div className="flex border-b border-slate-200/80 mb-8 gap-4">
        {['analytics', 'products', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-bold tracking-wide uppercase border-b-2 transition-all ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Card Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sales */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <h3 className="text-2xl font-extrabold text-slate-800">${totalSales.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <DollarSign size={20} />
              </div>
            </div>

            {/* Products */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Products Catalog</span>
                <h3 className="text-2xl font-extrabold text-slate-800">{products.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Package size={20} />
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders Count</span>
                <h3 className="text-2xl font-extrabold text-slate-800">{orders.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <ShoppingCart size={20} />
              </div>
            </div>

            {/* Users */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
                <h3 className="text-2xl font-extrabold text-slate-800">{usersList.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-650">
                <Users size={20} />
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm max-w-4xl">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Monthly Sales Trends</h3>
            <Line data={getChartData()} options={chartOptions} />
          </div>
        </div>
      )}

      {/* 2. Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Catalog Inventory</h3>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/10 flex items-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Create Product</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4">Name</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{p.name}</td>
                      <td className="p-4 font-semibold">${p.price.toFixed(2)}</td>
                      <td className="p-4 text-xs font-bold text-slate-400">{p.category}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${p.stockQuantity === 0 ? 'text-red-550' : 'text-slate-600'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 text-red-500 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* 3. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Customer Order Fulfilments</h3>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Delivery Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="p-4 font-mono text-xs text-indigo-700">{o._id}</td>
                      <td className="p-4 font-bold text-slate-800">{o.user?.name || 'Guest'}</td>
                      <td className="p-4 font-bold text-slate-700">${o.totalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${
                          o.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-650 border-emerald-100' : 'bg-red-50 text-red-650 border-red-100'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${
                          o.deliveryStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-650 border-emerald-100'
                            : o.deliveryStatus === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-amber-50 text-amber-650 border-amber-100'
                        }`}>
                          {o.deliveryStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {o.deliveryStatus !== 'Delivered' && (
                          <select
                            value={o.deliveryStatus}
                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2.5 outline-none text-slate-750 focus:border-indigo-500 shadow-sm"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                        {o.deliveryStatus === 'Delivered' && (
                          <span className="text-emerald-600 flex items-center justify-end text-xs font-bold space-x-1 pr-4">
                            <Check size={14} />
                            <span>Fulfilled</span>
                          </span>
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

      {/* CRUD Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 p-6 relative flex flex-col max-h-[90vh] shadow-2xl">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-655 p-3 rounded-xl text-xs mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-grow">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ShopEZ Sonic Headphones"
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="99.99"
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="10"
                    className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-850 rounded-xl p-3 outline-none text-sm"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Living">Home & Living</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about product materials, warranty, battery etc..."
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm"
                ></textarea>
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Product Image
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={formData.images[0]}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    placeholder="http://unsplash-url... or use upload"
                    className="flex-grow bg-white border border-slate-200 focus:border-indigo-500 text-slate-800 rounded-xl p-3 outline-none text-sm"
                  />
                  <label className="bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold px-3 py-3 rounded-xl cursor-pointer text-xs border border-slate-200 flex items-center justify-center space-x-1 flex-shrink-0 shadow-sm transition-colors">
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={14} />
                        <span>Upload</span>
                      </>
                    )}
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/10"
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

export default AdminDashboard;
