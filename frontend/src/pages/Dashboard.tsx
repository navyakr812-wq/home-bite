import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext_old';
import { api } from '../utils/api';
import DishCard, { Dish } from '../components/DishCard';
import { ListSkeleton } from '../components/Skeletons';
import { User as UserIcon, MapPin, Heart, ShoppingBag, Bell, Check, Clock, Edit3, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ORDER_STATUS_STEPS = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, addAddress, updateProfile, changePassword, deleteAccount } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'wishlist' | 'notifications'>('profile');
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Dish[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Profile Edit
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPic, setEditPic] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security / Password Edit
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  // Delete Account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Address inputs
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Cancel order loading
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditPhone(user.phoneNumber || '');
      setEditPic(user.profilePictureUrl || '');
    }
  }, [user]);

  // Load Orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Load Wishlist Details
  useEffect(() => {
    if (activeTab === 'wishlist' && user) {
      const fetchWishlist = async () => {
        setWishlistLoading(true);
        try {
          const res = await api.get('/auth/profile');
          setWishlistItems(res.data.wishlist || []);
        } catch (err) {
          console.warn('Backend offline, filtering wishlist locally...');
          setWishlistItems([]);
        } finally {
          setWishlistLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [activeTab, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    try {
      await updateProfile({ name: editName, phoneNumber: editPhone, profilePictureUrl: editPic });
      setProfileSuccess(true);
      setEditMode(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile info.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      await changePassword({ oldPassword, newPassword });
      setPassSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to change password. Double check old password.');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    try {
      await deleteAccount(deleteConfirmPassword);
      setShowDeleteModal(false);
      navigate('/auth');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || 'Incorrect password.');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelLoading(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Error cancelling order. Please check backend connection.');
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="font-semibold text-slate-500 animate-pulse">Loading Profile Workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <span className="text-5xl block">🔒</span>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          Please sign in to access your personal dashboard, addresses, wishlist, and orders.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg focus:outline-none"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess(false);

    if (!street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      setAddressError('All address input fields are required.');
      return;
    }

    try {
      await addAddress({
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim()
      });
      setAddressSuccess(true);
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setTimeout(() => setAddressSuccess(false), 4000);
    } catch (err) {
      setAddressError('Error updating addresses list.');
    }
  };

  const getStatusStepIndex = (status: string) => {
    return ORDER_STATUS_STEPS.indexOf(status);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen relative"
    >
      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-md w-full space-y-6 shadow-xl"
          >
            <div className="flex gap-3 text-red-500">
              <ShieldAlert className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="text-lg font-black tracking-tight">Delete Account Permanently?</h3>
                <p className="text-xs text-slate-500 mt-1">This action cannot be undone. You will lose your entire order history, active carts, and wishlist items.</p>
              </div>
            </div>
            
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-red-500 font-semibold"
                  required
                />
              </div>
              {deleteError && <p className="text-xs text-red-500 font-bold">{deleteError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 shrink-0 bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl h-fit space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-lg overflow-hidden shrink-0">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-base truncate">{user.name}</h2>
              <p className="text-xs text-slate-400 font-bold capitalize">{user.role} Account</p>
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          <nav className="flex flex-col gap-2 font-semibold text-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                activeTab === 'profile' ? 'bg-primary text-white shadow-md font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <UserIcon className="w-5 h-5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                activeTab === 'orders' ? 'bg-primary text-white shadow-md font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <ShoppingBag className="w-5 h-5" /> My Orders
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                activeTab === 'addresses' ? 'bg-primary text-white shadow-md font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <MapPin className="w-5 h-5" /> Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                activeTab === 'wishlist' ? 'bg-primary text-white shadow-md font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Heart className="w-5 h-5" /> Wishlist
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                activeTab === 'notifications' ? 'bg-primary text-white shadow-md font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <Bell className="w-5 h-5" /> Notifications
            </button>
          </nav>
        </div>

        {/* Content Pane */}
        <div className="flex-grow bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-xl font-extrabold">Account Profile</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-4 h-4" /> {editMode ? 'Cancel Edit' : 'Edit Details'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md animate-fadeIn">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profile Picture URL</label>
                        <input
                          type="text"
                          value={editPic}
                          onChange={(e) => setEditPic(e.target.value)}
                          placeholder="Image address (HTTPS)"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Full Name</p>
                      <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                      <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                      <p className="text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">{user.phoneNumber || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Role</p>
                      <p className="text-base font-extrabold mt-1 capitalize text-slate-800 dark:text-slate-100">{user.role}</p>
                    </div>
                  </div>
                )}

                {profileSuccess && (
                  <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Profile details saved successfully!
                  </p>
                )}

                {/* Password Change Sub-section */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
                  <h3 className="text-base font-extrabold">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Old Password</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                          required
                        />
                      </div>
                    </div>
                    {passError && <p className="text-xs text-red-500 font-bold">{passError}</p>}
                    {passSuccess && (
                      <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Password changed successfully.
                      </p>
                    )}
                    <button
                      type="submit"
                      className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Account Deletion danger zone */}
                <div className="border-t border-red-200 dark:border-red-950 pt-8 space-y-4">
                  <h3 className="text-base font-extrabold text-red-500">Danger Zone</h3>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <p className="font-extrabold text-sm text-red-500">Delete Account Permanently</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">Immediately remove your active order traces, saved wishlists, and account records.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-3">My Order History</h2>
                
                {ordersLoading ? (
                  <ListSkeleton count={3} />
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm font-semibold">You haven't ordered anything yet.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {orders.map((order) => {
                      const stepIndex = getStatusStepIndex(order.status);
                      const isCancellable = order.status === 'Placed';
                      return (
                        <div
                          key={order._id}
                          className="border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-5 bg-slate-50/50 dark:bg-slate-900/10"
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 text-xs font-semibold">
                            <div>
                              <p className="text-slate-500">Order ID</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">#{order._id}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Total Price</p>
                              <p className="text-sm font-bold text-primary">₹{order.total}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Time Slot</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{order.timeSlot}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Date</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Order Items list */}
                          <div className="space-y-2">
                            {order.items?.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs font-semibold">
                                <div>
                                  <span>{item.name} x {item.quantity}</span>
                                  {item.notes && <p className="text-[10px] text-red-500 font-bold">* Note: {item.notes}</p>}
                                </div>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {order.specialInstructions && (
                            <div className="bg-slate-100 dark:bg-slate-800/50 p-2.5 rounded-xl text-[10px] text-slate-500 font-medium">
                              <strong>Delivery Notes:</strong> {order.specialInstructions}
                            </div>
                          )}

                          {/* Status tracker bar */}
                          {order.status !== 'Cancelled' ? (
                            <div className="pt-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Delivery Status Tracking</p>
                              <div className="relative flex justify-between items-center w-full">
                                <div className="absolute left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-0" />
                                <div
                                  className="absolute left-0 h-1 bg-primary z-0 transition-all duration-500"
                                  style={{ width: `${(stepIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                                />

                                {ORDER_STATUS_STEPS.map((step, idx) => {
                                  const isDone = idx <= stepIndex;
                                  const isActive = idx === stepIndex;
                                  return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center">
                                      <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                          isDone
                                            ? 'bg-primary text-white ring-4 ring-primary/20'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                        }`}
                                      >
                                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                      </div>
                                      <span
                                        className={`text-[9px] mt-2 font-bold absolute top-6 whitespace-nowrap ${
                                          isActive ? 'text-primary' : 'text-slate-400'
                                        }`}
                                      >
                                        {step}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {isCancellable && (
                                <div className="flex justify-end pt-8">
                                  <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    disabled={cancelLoading === order._id}
                                    className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                  >
                                    {cancelLoading === order._id ? 'Cancelling...' : 'Cancel Order'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg w-fit">Order Cancelled</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-3">Delivery Addresses</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((addr, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1 relative">
                      <p className="font-bold text-sm">Saved Address {idx + 1}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                      {addr.isDefault && (
                        <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 uppercase tracking-wider">
                          Default Address
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Address Form */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                  <h3 className="font-bold text-sm">Add New Address</h3>
                  <form onSubmit={handleAddAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          setAddressError('');
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setAddressError('');
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setAddressError('');
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP / Postal Code"
                      value={zipCode}
                      onChange={(e) => {
                        setZipCode(e.target.value);
                        setAddressError('');
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-1 focus:ring-primary font-semibold"
                      required
                    />
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Save Address Details
                      </button>
                    </div>
                  </form>
                  {addressError && <p className="text-xs text-red-500 font-bold">{addressError}</p>}
                  {addressSuccess && (
                    <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Address saved successfully.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: WISHLIST */}
            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-3">My Starred Recipes</h2>

                {wishlistLoading ? (
                  <ListSkeleton count={2} />
                ) : wishlistItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-4">
                    <span className="text-4xl block">❤️</span>
                    <p className="text-sm font-semibold">Your wishlist is empty. Add recipes from the menu!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                    {wishlistItems.map((dish) => (
                      <DishCard key={dish._id} dish={dish} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-3">Inbox Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-primary/5">
                    <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm">Welcome to HomeBite!</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold">
                        Thanks for registering. Explore our kitchen menus and enjoy delicious food cooked directly in neighborhood home kitchens.
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2 block">Just now</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
