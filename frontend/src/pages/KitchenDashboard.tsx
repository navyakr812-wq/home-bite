import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext_old';
import { api } from '../utils/api';
import { ShieldAlert, RefreshCw, CheckCircle, Clock, Utensils, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KitchenDashboard() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchChefOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/chef');
      setOrders(res.data);
    } catch (err) {
      console.warn('Backend offline, rendering mock kitchen pipeline...');
      const savedOrders = JSON.parse(localStorage.getItem('hb_mock_orders') || '[]');
      // Map mock orders to this chef if any, or seed default mock chef orders
      if (savedOrders.length > 0) {
        setOrders(savedOrders);
      } else {
        setOrders([
          {
            _id: 'mock-k-101',
            customer: { name: 'Sarah Connor', phoneNumber: '+1 555-901-2918' },
            items: [{ name: 'Fluffy Berry Pancakes', quantity: 2, price: 12, notes: 'Double maple syrup' }],
            subtotal: 24,
            deliveryFee: 5,
            packagingFee: 2,
            total: 31,
            status: 'Placed',
            timeSlot: 'ASAP',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'mock-k-102',
            customer: { name: 'John Connor', phoneNumber: '+1 555-802-9988' },
            items: [{ name: 'Signature Butter Chicken', quantity: 1, price: 16, notes: 'Make it mild' }],
            subtotal: 16,
            deliveryFee: 5,
            packagingFee: 2,
            total: 23,
            status: 'Preparing',
            timeSlot: 'ASAP',
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'chef' || user.role === 'admin')) {
      fetchChefOrders();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    setActionLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      await fetchChefOrders();
    } catch (err) {
      // Offline transition support
      const updated = orders.map(o => o._id === orderId ? { ...o, status: nextStatus } : o);
      setOrders(updated);
      localStorage.setItem('hb_mock_orders', JSON.stringify(updated));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="font-semibold text-slate-500 animate-pulse">Loading Kitchen Details...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'chef' && user.role !== 'admin')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 text-red-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          This panel is restricted to verified Home Chef accounts.
        </p>
      </div>
    );
  }

  // Filter orders
  const pendingOrders = orders.filter(o => o.status === 'Placed');
  const activeOrders = orders.filter(o => ['Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.status));
  const completedOrders = orders.filter(o => ['Delivered', 'Completed', 'Cancelled'].includes(o.status));

  const currentTabOrders = 
    selectedTab === 'pending' ? pendingOrders : 
    selectedTab === 'active' ? activeOrders : completedOrders;

  // Stats
  const activeCount = activeOrders.length;
  const pendingCount = pendingOrders.length;
  const completedCount = completedOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length;
  const totalRevenue = completedOrders
    .filter(o => o.status === 'Delivered' || o.status === 'Completed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8"
    >
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kitchen Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Accept incoming orders, track preparation stages, and manage cooking delays</p>
        </div>
        <button
          onClick={fetchChefOrders}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-semibold">
        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Incoming Orders</p>
            <p className="text-2xl font-black">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Cooks</p>
            <p className="text-2xl font-black">{activeCount}</p>
          </div>
        </div>

        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Today</p>
            <p className="text-2xl font-black">{completedCount}</p>
          </div>
        </div>

        <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <span className="text-xl font-black">₹</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kitchen Earnings</p>
            <p className="text-2xl font-black">₹{totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mt-10 mb-8 font-semibold">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`pb-4 px-6 flex items-center gap-2 border-b-2 text-sm transition-all duration-300 ${
            selectedTab === 'pending'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Incoming ({pendingCount})
        </button>
        <button
          onClick={() => setSelectedTab('active')}
          className={`pb-4 px-6 flex items-center gap-2 border-b-2 text-sm transition-all duration-300 ${
            selectedTab === 'active'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Active Prep ({activeCount})
        </button>
        <button
          onClick={() => setSelectedTab('completed')}
          className={`pb-4 px-6 flex items-center gap-2 border-b-2 text-sm transition-all duration-300 ${
            selectedTab === 'completed'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Finished / Past ({completedCount})
        </button>
      </div>

      {/* Orders Grid/List */}
      {ordersLoading ? (
        <div className="text-center py-12 text-slate-400 font-semibold animate-pulse">Loading Kitchen Pipeline...</div>
      ) : currentTabOrders.length === 0 ? (
        <div className="text-center py-16 bg-lightbg-card dark:bg-darkbg-card border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-semibold">
          No orders in this section.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {currentTabOrders.map((order) => (
              <motion.div
                layout
                key={order._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider">Order ID</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">#{order._id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase tracking-wider">Estimated Time Slot</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.timeSlot}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-xs font-medium">
                      <div>
                        <span>{item.name} x {item.quantity}</span>
                        {item.notes && (
                          <p className="text-[10px] text-red-500 font-bold mt-0.5">* Notes: {item.notes}</p>
                        )}
                      </div>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.specialInstructions && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-500 border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-700 dark:text-slate-300">Prep Instructions:</strong> {order.specialInstructions}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-xs font-semibold">
                  <span className="text-slate-400">Customer details: {order.customer?.name} ({order.customer?.phoneNumber || 'N/A'})</span>
                  <span className="text-primary font-black text-sm">₹{order.total}</span>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {order.status === 'Placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                        disabled={actionLoading === order._id}
                        className="flex items-center gap-1 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                        disabled={actionLoading === order._id}
                        className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Accept Order
                      </button>
                    </>
                  )}

                  {order.status === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                      disabled={actionLoading === order._id}
                      className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Ready')}
                      disabled={actionLoading === order._id}
                      className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Mark Ready
                    </button>
                  )}

                  {order.status === 'Ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                      disabled={actionLoading === order._id}
                      className="bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Handover to Delivery
                    </button>
                  )}

                  {order.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                      disabled={actionLoading === order._id}
                      className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Mark Delivered
                    </button>
                  )}

                  {(order.status === 'Delivered' || order.status === 'Completed') && (
                    <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" /> Finished
                    </span>
                  )}

                  {order.status === 'Cancelled' && (
                    <span className="text-red-500 flex items-center gap-1 text-xs font-bold">
                      <XCircle className="w-4 h-4" /> Order Cancelled
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
