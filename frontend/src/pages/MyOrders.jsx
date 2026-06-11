import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ClipboardList, CheckCircle, Clock, Truck } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/myorders');
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle size={14} className="text-emerald-600" />;
      case 'Shipped':
        return <Truck size={14} className="text-indigo-600 animate-pulse" />;
      default:
        return <Clock size={14} className="text-amber-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-650 border-emerald-150';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-amber-50 text-amber-650 border-amber-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="bg-slate-200 h-8 w-48 rounded"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-200 h-28 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 flex items-center space-x-3">
        <ClipboardList className="text-indigo-600" size={28} />
        <span>My Orders</span>
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-6 shadow-sm">
          <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-650/15"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Order Info Left */}
              <div className="space-y-3 flex-grow">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-indigo-700 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    ID: {order._id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5 pt-1">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="text-sm text-slate-650 font-medium">
                      • {item.name} <span className="text-slate-400 font-bold">x{item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Middle */}
              <div className="flex flex-row md:flex-col gap-4 md:items-end flex-shrink-0">
                <div className="flex flex-col md:items-end">
                  <span className="text-xs text-slate-400 font-bold mb-1">Payment Status</span>
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-650 border-emerald-150'
                      : 'bg-red-50 text-red-650 border-red-100'
                  }`}>
                    {order.paymentStatus === 'Paid' && <CheckCircle size={12} />}
                    <span>{order.paymentStatus}</span>
                  </span>
                </div>

                <div className="flex flex-col md:items-end">
                  <span className="text-xs text-slate-400 font-bold mb-1">Delivery Status</span>
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(
                    order.deliveryStatus
                  )}`}>
                    {getStatusIcon(order.deliveryStatus)}
                    <span>{order.deliveryStatus}</span>
                  </span>
                </div>
              </div>

              {/* Total Price Right */}
              <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-row md:flex-col justify-between items-center md:items-end flex-shrink-0 min-w-[120px]">
                <span className="text-sm text-slate-400 font-semibold md:mb-1">Total Paid</span>
                <span className="text-xl font-extrabold text-slate-800">
                  ${order.totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
