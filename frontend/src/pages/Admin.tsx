import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext_old';
import { api } from '../utils/api';
import { TableSkeleton } from '../components/Skeletons';
import { DollarSign, ShoppingBag, Users, ShieldAlert, Award, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.warn('Backend unavailable, generating mock sales metrics...');
      setAnalytics({
        totalOrders: 32,
        totalChefs: 5,
        totalUsers: 18,
        revenue: 412,
        categoryStats: [
          { category: 'Breakfast', count: 12 },
          { category: 'Lunch', count: 28 },
          { category: 'Dinner', count: 22 },
          { category: 'Snacks', count: 14 },
          { category: 'Desserts', count: 10 }
        ],
        recentOrders: [
          { _id: 'order-101', customer: { name: 'Alice Smith' }, total: 32.5, status: 'Placed', createdAt: new Date().toISOString() },
          { _id: 'order-102', customer: { name: 'David Johnson' }, total: 18.0, status: 'Preparing', createdAt: new Date().toISOString() },
          { _id: 'order-103', customer: { name: 'John Doe' }, total: 42.0, status: 'Out for Delivery', createdAt: new Date().toISOString() }
        ]
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAnalytics();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = 'Placed';
    if (currentStatus === 'Placed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';
    else return;

    setUpdateLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      await fetchAnalytics();
    } catch (err) {
      if (analytics) {
        const updatedOrders = analytics.recentOrders.map((o: any) =>
          o._id === orderId ? { ...o, status: nextStatus } : o
        );
        setAnalytics({ ...analytics, recentOrders: updatedOrders });
      }
    } finally {
      setUpdateLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="font-semibold text-slate-500 animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 text-red-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          This workspace is reserved for HomeBite administrative accounts.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8"
    >
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-sm mt-1">Manage operations, chef validations, and track restaurant sales analytics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>

      {analyticsLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <TableSkeleton />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-semibold">
            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-black">₹{analytics.revenue}</p>
              </div>
            </div>

            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-black">{analytics.totalOrders}</p>
              </div>
            </div>

            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Customers</p>
                <p className="text-2xl font-black">{analytics.totalUsers}</p>
              </div>
            </div>

            <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered Chefs</p>
                <p className="text-2xl font-black">{analytics.totalChefs}</p>
              </div>
            </div>
          </div>

          {/* SVG Sales Analytics Chart */}
          <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
            <h2 className="text-lg font-extrabold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" /> Popular Recipe Categories Distribution
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
              {/* Horizontal Bar Chart */}
              <div className="w-full md:max-w-md space-y-4">
                {analytics.categoryStats?.map((stat: any, i: number) => {
                  const maxCount = Math.max(...analytics.categoryStats.map((s: any) => s.count));
                  const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                  return (
                    <div key={i} className="space-y-1.5 text-xs font-bold">
                      <div className="flex justify-between">
                        <span>{stat.category}</span>
                        <span className="text-slate-400">{stat.count} items cooked</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Decorative Pie Chart representation */}
              <div className="relative w-48 h-48 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary">5 Main</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Recipe Tiers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Status Update Table */}
          <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <h2 className="text-lg font-extrabold border-b border-slate-100 dark:border-slate-800 p-6">Recent Live Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {analytics.recentOrders?.map((order: any) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-bold">#{order._id}</td>
                      <td className="p-4">{order.customer?.name || 'Customer'}</td>
                      <td className="p-4 text-primary font-black">₹{order.total}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-500'
                            : 'bg-orange-100 dark:bg-orange-950 text-orange-500'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {order.status !== 'Delivered' ? (
                          <button
                            onClick={() => handleUpdateStatus(order._id, order.status)}
                            disabled={updateLoading === order._id}
                            className="bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-lg font-bold transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-800 text-[10px] uppercase tracking-wider"
                          >
                            {updateLoading === order._id ? 'Updating...' : 'Advance Status'}
                          </button>
                        ) : (
                          <span className="text-emerald-500 flex items-center justify-end gap-1 font-bold">
                            <CheckCircle className="w-4 h-4" /> Finished
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
    </motion.div>
  );
}
