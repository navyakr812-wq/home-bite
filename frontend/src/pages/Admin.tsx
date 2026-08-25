import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext_old';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { TableSkeleton } from '../components/Skeletons';
import { 
  DollarSign, ShoppingBag, Users, ShieldAlert, Award, TrendingUp, CheckCircle, 
  RefreshCw, ChefHat, Plus, Edit, Trash2, Ban, Play, Eye, EyeOff, ClipboardList, Package,
  Search, SlidersHorizontal, Upload, X, AlertTriangle, CreditCard, Landmark, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const formatError = (err: any, fallbackMessage: string): string => {
  if (err && err.response) {
    const status = err.response.status;
    const method = err.config?.method?.toUpperCase() || '';
    const url = err.config?.url || '';
    const msg = err.response.data?.message || err.response.data?.error || err.message;
    const validationDetails = err.response.data?.errors 
      ? ` - Details: ${JSON.stringify(err.response.data.errors)}`
      : '';
    return `[${status}] ${method} ${url}: ${msg}${validationDetails}`;
  }
  return err.message ? `${fallbackMessage} (${err.message})` : fallbackMessage;
};

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'chefs' | 'menu' | 'users' | 'orders' | 'payments'>('analytics');
  
  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [chefs, setChefs] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // Loading states
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [chefsLoading, setChefsLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Search & Filter states
  const [chefSearch, setChefSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterChef, setMenuFilterChef] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('');
  const [menuFilterVeg, setMenuFilterVeg] = useState('');
  const [menuFilterAvailable, setMenuFilterAvailable] = useState('');
  
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('');

  // Modals state
  const [showChefModal, setShowChefModal] = useState(false);
  const [editingChef, setEditingChef] = useState<any>(null);
  const [chefForm, setChefForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    cuisine: '',
    specialties: '',
    deliveryTime: '30-45 mins',
    avatarUrl: '',
    coverImageUrl: '',
    contact: ''
  });

  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Lunch',
    vegIndicator: 'Veg',
    imageUrl: '',
    prepTime: '25 mins',
    ingredients: '',
    allergens: '',
    discount: '0',
    isAvailable: true,
    chefId: ''
  });

  // Image Uploading variables
  const [uploadProgress, setUploadProgress] = useState(false);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      showNotification('error', formatError(err, 'Failed to retrieve real-time analytics data.'));
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchChefs = async () => {
    setChefsLoading(true);
    try {
      const res = await api.get('/admin/chefs');
      setChefs(res.data);
    } catch (err) {
      console.error('Error fetching chefs:', err);
      showNotification('error', formatError(err, 'Could not load home chef directory.'));
    } finally {
      setChefsLoading(false);
    }
  };

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await api.get('/dishes');
      setMenuItems(res.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      showNotification('error', formatError(err, 'Error fetching food dishes from menu.'));
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsersList(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      showNotification('error', formatError(err, 'Failed to retrieve registered users.'));
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrdersList(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      showNotification('error', formatError(err, 'Could not load order transactions.'));
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadTabData = () => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'chefs') fetchChefs();
    if (activeTab === 'menu') {
      fetchMenu();
      fetchChefs();
    }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'orders' || activeTab === 'payments') fetchOrders();
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadTabData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        openAuthModal(undefined, () => {
          navigate('/');
        });
      } else if (user.role !== 'admin') {
        alert('Access denied: Admin privileges required.');
        navigate('/');
      }
    }
  }, [user, loading, openAuthModal, navigate]);

  // Firebase Storage File Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'chef' | 'food') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    if (file.size > 2 * 1024 * 1024) {
      showNotification('error', 'File size exceeds the maximum 2MB limit.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showNotification('error', 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setUploadProgress(true);
    try {
      const storageRef = ref(storage, `homebite/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      if (type === 'chef') {
        setChefForm(prev => ({ ...prev, avatarUrl: url }));
      } else {
        setFoodForm(prev => ({ ...prev, imageUrl: url }));
      }
      showNotification('success', 'Image uploaded successfully!');
    } catch (err) {
      console.error('File upload error:', err);
      showNotification('error', 'Upload failed. Please try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  // --- Chef CRUD Handlers ---
  const handleOpenChefModal = (chef: any = null) => {
    if (chef) {
      setEditingChef(chef);
      setChefForm({
        name: chef.user?.name || '',
        email: chef.user?.email || '',
        password: '',
        bio: chef.bio || '',
        cuisine: chef.specialties?.[0] || '',
        specialties: chef.specialties?.join(', ') || '',
        deliveryTime: chef.deliveryTime || '30-45 mins',
        avatarUrl: chef.avatarUrl || '',
        coverImageUrl: chef.coverImageUrl || '',
        contact: chef.user?.phoneNumber || ''
      });
    } else {
      setEditingChef(null);
      setChefForm({
        name: '',
        email: '',
        password: '',
        bio: '',
        cuisine: '',
        specialties: '',
        deliveryTime: '30-45 mins',
        avatarUrl: '',
        coverImageUrl: '',
        contact: ''
      });
    }
    setShowChefModal(true);
  };

  const handleChefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChef) {
        await api.put(`/admin/chefs/${editingChef._id}`, {
          ...chefForm,
          specialties: chefForm.specialties.split(',').map(s => s.trim())
        });
        showNotification('success', 'Chef profile updated successfully');
      } else {
        await api.post('/admin/chefs', {
          ...chefForm,
          specialties: chefForm.specialties.split(',').map(s => s.trim())
        });
        showNotification('success', 'New Chef registered successfully');
      }
      setShowChefModal(false);
      fetchChefs();
    } catch (err) {
      showNotification('error', formatError(err, 'Error saving chef profile details.'));
    }
  };

  const handleToggleChefStatus = async (chefId: string) => {
    try {
      const res = await api.put(`/admin/chefs/${chefId}/toggle`);
      showNotification('success', res.data.message || 'Chef status updated successfully');
      fetchChefs();
    } catch (err) {
      showNotification('error', formatError(err, 'Error updating chef status.'));
    }
  };

  const handleDeleteChef = async (chefId: string) => {
    try {
      const res = await api.delete(`/admin/chefs/${chefId}`);
      showNotification('success', res.data.message || 'Chef profile deleted successfully');
      fetchChefs();
    } catch (err: any) {
      if (err.response?.data?.hasMenuItems) {
        if (window.confirm(`${err.response.data.message}\n\nAre you sure you want to proceed and delete all their menu items?`)) {
          try {
            await api.delete(`/admin/chefs/${chefId}?force=true`);
            showNotification('success', 'Chef profile and associated menu items deleted successfully');
            fetchChefs();
          } catch (innerErr) {
            showNotification('error', formatError(innerErr, 'Error performing forced deletion.'));
          }
        }
      } else {
        showNotification('error', formatError(err, 'Error deleting chef.'));
      }
    }
  };

  // --- Menu CRUD Handlers ---
  const handleOpenFoodModal = (food: any = null) => {
    if (food) {
      setEditingFood(food);
      setFoodForm({
        name: food.name || '',
        description: food.description || '',
        price: food.price || '',
        category: food.category || 'Lunch',
        vegIndicator: food.vegIndicator || 'Veg',
        imageUrl: food.imageUrl || '',
        prepTime: food.prepTime || '25 mins',
        ingredients: food.ingredients?.join(', ') || '',
        allergens: food.allergens?.join(', ') || '',
        discount: food.discount !== undefined ? String(food.discount) : '0',
        isAvailable: food.isAvailable,
        chefId: food.chef?._id || ''
      });
    } else {
      setEditingFood(null);
      setFoodForm({
        name: '',
        description: '',
        price: '',
        category: 'Lunch',
        vegIndicator: 'Veg',
        imageUrl: '',
        prepTime: '25 mins',
        ingredients: '',
        allergens: '',
        discount: '0',
        isAvailable: true,
        chefId: chefs[0]?._id || ''
      });
    }
    setShowFoodModal(true);
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodForm.chefId) {
      showNotification('error', 'Please assign a chef first.');
      return;
    }
    try {
      const payload = {
        ...foodForm,
        price: Number(foodForm.price),
        discount: Number(foodForm.discount),
        ingredients: foodForm.ingredients.split(',').map(s => s.trim()),
        allergens: foodForm.allergens ? foodForm.allergens.split(',').map(s => s.trim()) : []
      };

      if (editingFood) {
        await api.put(`/dishes/${editingFood._id}`, payload);
        showNotification('success', 'Food item updated successfully!');
      } else {
        await api.post('/dishes', payload);
        showNotification('success', 'Food item added to menu successfully!');
      }
      setShowFoodModal(false);
      fetchMenu();
    } catch (err) {
      showNotification('error', formatError(err, 'Error saving dish details.'));
    }
  };

  const handleToggleFoodAvailability = async (foodId: string, currentVal: boolean) => {
    try {
      await api.put(`/dishes/${foodId}`, { isAvailable: !currentVal });
      showNotification('success', 'Food availability updated');
      fetchMenu();
    } catch (err) {
      showNotification('error', formatError(err, 'Error updating food availability.'));
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe permanently?')) return;
    try {
      await api.delete(`/dishes/${foodId}`);
      showNotification('success', 'Recipe deleted successfully.');
      fetchMenu();
    } catch (err) {
      showNotification('error', formatError(err, 'Error deleting food item.'));
    }
  };

  // --- User CRUD Handlers ---
  const handleToggleSuspendUser = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      showNotification('success', res.data.message || 'User status updated successfully.');
      fetchUsers();
    } catch (err) {
      showNotification('error', formatError(err, 'Error updating user status.'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user account permanently?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showNotification('success', 'User profile deleted.');
      fetchUsers();
    } catch (err) {
      showNotification('error', formatError(err, 'Error deleting user.'));
    }
  };

  // --- Order pipeline handlers ---
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: nextStatus });
      showNotification('success', 'Order status advanced successfully.');
      fetchOrders();
    } catch (err) {
      showNotification('error', formatError(err, 'Error advancing order status.'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-semibold text-slate-500 animate-pulse">Verifying administrative details...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 text-red-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          This system workspace is reserved for administrative accounts.
        </p>
      </div>
    );
  }

  // --- Filtering Operations ---
  const filteredChefs = chefs.filter(c => 
    c.user?.name?.toLowerCase().includes(chefSearch.toLowerCase()) ||
    c.user?.email?.toLowerCase().includes(chefSearch.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesChef = menuFilterChef ? item.chef?._id === menuFilterChef : true;
    const matchesCategory = menuFilterCategory ? item.category === menuFilterCategory : true;
    const matchesVeg = menuFilterVeg ? item.vegIndicator === menuFilterVeg : true;
    const matchesAvailable = menuFilterAvailable ? String(item.isAvailable) === menuFilterAvailable : true;
    return matchesSearch && matchesChef && matchesCategory && matchesVeg && matchesAvailable;
  });

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrders = ordersList.filter(o => {
    const matchesSearch = o._id?.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderFilterStatus ? o.status === orderFilterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = ordersList.filter(o => {
    // Only online payments
    if (o.paymentMethod === 'Cash on Delivery') return false;
    const matchesStatus = paymentFilterStatus ? o.paymentStatus === paymentFilterStatus : true;
    return matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-bold text-xs flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-slate-500 text-sm mt-1">Manage operations, chef validations, and track sales</p>
        </div>
        <button
          onClick={loadTabData}
          className="flex items-center gap-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['analytics', 'chefs', 'menu', 'users', 'orders', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        
        {/* --- 1. Analytics Tab --- */}
        {activeTab === 'analytics' && (
          analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              ))}
            </div>
          ) : analytics && (
            <div className="space-y-10">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 font-semibold">
                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <DollarSign className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Revenue</p>
                    <p className="text-xl font-black">₹{analytics.revenue || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shrink-0">
                    <ShoppingBag className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                    <p className="text-xl font-black">{analytics.totalOrders || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                    <Users className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</p>
                    <p className="text-xl font-black">{analytics.totalUsers || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-500 shrink-0">
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Users</p>
                    <p className="text-xl font-black">{analytics.activeUsers || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                    <ChefHat className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Chefs</p>
                    <p className="text-xl font-black">{analytics.totalChefs || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 shrink-0">
                    <Package className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Menu Items</p>
                    <p className="text-xl font-black">{analytics.totalMenuItems || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                    <ClipboardList className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Orders</p>
                    <p className="text-xl font-black">{analytics.pendingOrders || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
                    <CheckCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivered Orders</p>
                    <p className="text-xl font-black">{analytics.deliveredOrdersCount || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                    <X className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cancelled Orders</p>
                    <p className="text-xl font-black">{analytics.cancelledOrders || 0}</p>
                  </div>
                </div>

                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 shrink-0">
                    <RefreshCw className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Orders</p>
                    <p className="text-xl font-black">{analytics.todaysOrders || 0}</p>
                  </div>
                </div>
              </div>

              {/* Distrubution graphs lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Dishes */}
                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <TrendingUp className="w-5 h-5 text-primary" /> Popular Dishes Ordered
                  </h3>
                  {analytics.popularFoods?.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.popularFoods.map((food: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-bold">
                          <span>{food.name}</span>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">{food.quantity} ordered</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs">No orders recorded yet to evaluate dish popularity.</p>
                  )}
                </div>

                {/* Categories */}
                <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Package className="w-5 h-5 text-indigo-500" /> Category Distribution
                  </h3>
                  <div className="space-y-4">
                    {analytics.categoryStats?.map((stat: any, i: number) => {
                      const maxCount = Math.max(...analytics.categoryStats.map((s: any) => s.count));
                      const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="space-y-1.5 text-xs font-bold">
                          <div className="flex justify-between">
                            <span>{stat.category}</span>
                            <span className="text-slate-400">{stat.count} items</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* --- 2. Chefs Tab --- */}
        {activeTab === 'chefs' && (
          chefsLoading ? <TableSkeleton /> : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-xs font-bold">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search chefs by name/email..."
                    value={chefSearch}
                    onChange={e => setChefSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => handleOpenChefModal()}
                  className="bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:scale-102 transition-all shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Chef
                </button>
              </div>

              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Chef Profile</th>
                      <th className="p-4">Delivery Time</th>
                      <th className="p-4">Phone / Contact</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {filteredChefs.map((chef) => (
                      <tr key={chef._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={chef.avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'}
                            alt={chef.user?.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100">{chef.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{chef.user?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{chef.deliveryTime || 'N/A'}</td>
                        <td className="p-4">{chef.user?.phoneNumber || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            chef.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-500'
                              : 'bg-red-100 dark:bg-red-950 text-red-500'
                          }`}>
                            {chef.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleChefStatus(chef._id)}
                            className="text-slate-500 hover:text-primary transition-colors p-1"
                            title={chef.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {chef.isActive ? <Ban className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenChefModal(chef)}
                            className="text-indigo-500 hover:text-indigo-600 transition-colors p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteChef(chef._id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* --- 3. Menu Management Tab --- */}
        {activeTab === 'menu' && (
          menuLoading ? <TableSkeleton /> : (
            <div className="space-y-6">
              {/* Filters Block */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 font-bold text-xs">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Options
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label>Chef</label>
                    <select
                      value={menuFilterChef}
                      onChange={e => setMenuFilterChef(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                    >
                      <option value="">All Chefs</option>
                      {chefs.map(chef => (
                        <option key={chef._id} value={chef._id}>{chef.user?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Category</label>
                    <select
                      value={menuFilterCategory}
                      onChange={e => setMenuFilterCategory(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                    >
                      <option value="">All Categories</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Veg Type</label>
                    <select
                      value={menuFilterVeg}
                      onChange={e => setMenuFilterVeg(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                    >
                      <option value="">All Types</option>
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Egg">Egg</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Availability</label>
                    <select
                      value={menuFilterAvailable}
                      onChange={e => setMenuFilterAvailable(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                    >
                      <option value="">All Availability</option>
                      <option value="true">Available</option>
                      <option value="false">Sold Out</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setMenuFilterChef('');
                        setMenuFilterCategory('');
                        setMenuFilterVeg('');
                        setMenuFilterAvailable('');
                        setMenuSearch('');
                      }}
                      className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Search and Table */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-xs font-bold">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search food by name..."
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => handleOpenFoodModal()}
                  className="bg-primary text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:scale-102 transition-all shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Food Item
                </button>
              </div>

              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Dish Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Chef</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {filteredMenuItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.vegIndicator === 'Veg' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {item.vegIndicator} • {item.category}
                          </span>
                        </td>
                        <td className="p-4">{item.chef?.user?.name || 'N/A'}</td>
                        <td className="p-4 text-primary font-bold">₹{item.price}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFoodAvailability(item._id, item.isAvailable)}
                            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              item.isAvailable 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : 'bg-orange-100 text-orange-600'
                            }`}
                          >
                            {item.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            {item.isAvailable ? 'Available' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenFoodModal(item)}
                            className="text-indigo-500 hover:text-indigo-600 transition-colors p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(item._id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* --- 4. Users Tab --- */}
        {activeTab === 'users' && (
          usersLoading ? <TableSkeleton /> : (
            <div className="space-y-6">
              <div className="relative w-full sm:max-w-xs font-bold">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Search users by name/email..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">User Details</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {filteredUsers.map((usr) => (
                      <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{usr.name}</td>
                        <td className="p-4">{usr.email}</td>
                        <td className="p-4 uppercase tracking-wider text-[10px] text-slate-455">{usr.role}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            usr.isActive !== false
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-500'
                              : 'bg-red-100 dark:bg-red-950 text-red-500'
                          }`}>
                            {usr.isActive !== false ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleSuspendUser(usr._id)}
                            className="text-slate-500 hover:text-primary transition-colors p-1"
                            title={usr.isActive !== false ? 'Suspend User' : 'Reactivate User'}
                          >
                            {usr.isActive !== false ? <Ban className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* --- 5. Orders Tab --- */}
        {activeTab === 'orders' && (
          ordersLoading ? <TableSkeleton /> : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center font-bold text-xs">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by ID or customer..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <label>Status Filter</label>
                  <select
                    value={orderFilterStatus}
                    onChange={e => setOrderFilterStatus(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                  >
                    <option value="">All Statuses</option>
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Chef Name</th>
                      <th className="p-4">Total Amount</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-bold">#{order._id}</td>
                        <td className="p-4">
                          <p>{order.customer?.name || 'Customer'}</p>
                          <p className="text-[10px] text-slate-400">{order.customer?.phoneNumber}</p>
                        </td>
                        <td className="p-4">{order.chef?.user?.name || 'N/A'}</td>
                        <td className="p-4 text-primary font-black">₹{order.total}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-500">
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-bold"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* --- 6. Payments Tab --- */}
        {activeTab === 'payments' && (
          ordersLoading ? <TableSkeleton /> : (
            <div className="space-y-6">
              <div className="flex justify-between items-center font-bold text-xs">
                <h2 className="text-lg font-bold">Razorpay Online Transactions</h2>
                <div className="flex items-center gap-2">
                  <label>Payment Filter</label>
                  <select
                    value={paymentFilterStatus}
                    onChange={e => setPaymentFilterStatus(e.target.value)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950"
                  >
                    <option value="">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div className="bg-lightbg-card dark:bg-darkbg-card border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Razorpay Order ID</th>
                      <th className="p-4">Payment ID</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                    {filteredPayments.map((pay) => (
                      <tr key={pay._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-bold">{pay.razorpayOrderId || 'N/A'}</td>
                        <td className="p-4">{pay.razorpayPaymentId || 'N/A'}</td>
                        <td className="p-4 text-primary font-black">₹{pay.total}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            pay.paymentStatus === 'Paid' 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : pay.paymentStatus === 'Failed' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            {pay.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

      </div>

      {/* --- Add / Edit Chef Modal --- */}
      <AnimatePresence>
        {showChefModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-4"
            >
              <h2 className="text-xl font-extrabold">{editingChef ? 'Edit Chef Profile' : 'Add New Home Chef'}</h2>
              <form onSubmit={handleChefSubmit} className="space-y-3.5 text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Name</label>
                    <input
                      type="text"
                      required
                      value={chefForm.name}
                      onChange={e => setChefForm({ ...chefForm, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Email</label>
                    <input
                      type="email"
                      required
                      disabled={!!editingChef}
                      value={chefForm.email}
                      onChange={e => setChefForm({ ...chefForm, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 disabled:opacity-50"
                    />
                  </div>
                </div>

                {!editingChef && (
                  <div className="space-y-1">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      value={chefForm.password}
                      onChange={e => setChefForm({ ...chefForm, password: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Contact Phone</label>
                    <input
                      type="text"
                      value={chefForm.contact}
                      onChange={e => setChefForm({ ...chefForm, contact: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Average Delivery Time</label>
                    <input
                      type="text"
                      value={chefForm.deliveryTime}
                      onChange={e => setChefForm({ ...chefForm, deliveryTime: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label>Bio Description</label>
                  <textarea
                    rows={3}
                    value={chefForm.bio}
                    onChange={e => setChefForm({ ...chefForm, bio: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-1">
                  <label>Specialties (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lunch, Dinner, South Indian"
                    value={chefForm.specialties}
                    onChange={e => setChefForm({ ...chefForm, specialties: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="space-y-1">
                    <label>Profile Image URL</label>
                    <input
                      type="text"
                      placeholder="Paste image URL directly (optional)..."
                      value={chefForm.avatarUrl}
                      onChange={e => setChefForm({ ...chefForm, avatarUrl: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Cover Image URL</label>
                    <input
                      type="text"
                      placeholder="Paste cover photo URL directly (optional)..."
                      value={chefForm.coverImageUrl}
                      onChange={e => setChefForm({ ...chefForm, coverImageUrl: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <label className="flex-1 flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 py-2.5 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all justify-center">
                      <Upload className="w-4 h-4" />
                      <span>Upload Profile Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageFileChange(e, 'chef')}
                        className="hidden"
                      />
                    </label>
                    {uploadProgress && (
                      <button
                        type="button"
                        onClick={() => setUploadProgress(false)}
                        className="bg-red-500 text-white px-3 rounded-xl text-xs font-bold"
                      >
                        Cancel Upload
                      </button>
                    )}
                  </div>
                  {chefForm.avatarUrl && (
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                      <img src={chefForm.avatarUrl} className="w-12 h-12 object-cover rounded-lg" alt="Chef Preview" />
                      <span className="truncate flex-1 font-semibold text-[10px] text-slate-400">Preview Active</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploadProgress}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3 rounded-xl transition-colors shadow-md"
                  >
                    {uploadProgress ? 'Uploading...' : 'Save Chef Details'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChefModal(false)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Add / Edit Food Modal --- */}
      <AnimatePresence>
        {showFoodModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg w-full rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-4"
            >
              <h2 className="text-xl font-extrabold">{editingFood ? 'Edit Recipe Item' : 'Add Recipe to Menu'}</h2>
              {chefs.length === 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>No chefs registered. Please add a home chef first under the "Chefs" tab.</span>
                </div>
              )}
              <form onSubmit={handleFoodSubmit} className="space-y-3.5 text-xs font-bold">
                
                <div className="space-y-1">
                  <label>Assign Chef</label>
                  <select
                    disabled={!!editingFood}
                    value={foodForm.chefId}
                    onChange={e => setFoodForm({ ...foodForm, chefId: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 disabled:opacity-50"
                  >
                    <option value="">-- Choose Chef --</option>
                    {chefs.map(chef => (
                      <option key={chef._id} value={chef._id}>{chef.user?.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Recipe Name</label>
                    <input
                      type="text"
                      required
                      value={foodForm.name}
                      onChange={e => setFoodForm({ ...foodForm, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={foodForm.price}
                      onChange={e => setFoodForm({ ...foodForm, price: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    required
                    value={foodForm.description}
                    onChange={e => setFoodForm({ ...foodForm, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label>Category</label>
                    <select
                      value={foodForm.category}
                      onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Veg Type</label>
                    <select
                      value={foodForm.vegIndicator}
                      onChange={e => setFoodForm({ ...foodForm, vegIndicator: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Egg">Egg</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label>Prep Time</label>
                    <input
                      type="text"
                      value={foodForm.prepTime}
                      onChange={e => setFoodForm({ ...foodForm, prepTime: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Ingredients (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rice, Salt, Oil"
                      value={foodForm.ingredients}
                      onChange={e => setFoodForm({ ...foodForm, ingredients: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Allergens (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Nuts, Dairy"
                      value={foodForm.allergens}
                      onChange={e => setFoodForm({ ...foodForm, allergens: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      value={foodForm.discount}
                      onChange={e => setFoodForm({ ...foodForm, discount: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label>Available (Yes/No)</label>
                    <select
                      value={String(foodForm.isAvailable)}
                      onChange={e => setFoodForm({ ...foodForm, isAvailable: e.target.value === 'true' })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="space-y-1">
                    <label>Recipe Image URL</label>
                    <input
                      type="text"
                      placeholder="Paste image URL directly (optional)..."
                      value={foodForm.imageUrl}
                      onChange={e => setFoodForm({ ...foodForm, imageUrl: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <label className="flex-1 flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 py-2.5 px-4 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all justify-center">
                      <Upload className="w-4 h-4" />
                      <span>Upload Recipe Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageFileChange(e, 'food')}
                        className="hidden"
                      />
                    </label>
                    {uploadProgress && (
                      <button
                        type="button"
                        onClick={() => setUploadProgress(false)}
                        className="bg-red-500 text-white px-3 rounded-xl text-xs font-bold"
                      >
                        Cancel Upload
                      </button>
                    )}
                  </div>
                  {foodForm.imageUrl && (
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                      <img src={foodForm.imageUrl} className="w-12 h-12 object-cover rounded-lg" alt="Food Preview" />
                      <span className="truncate flex-1 font-semibold text-[10px] text-slate-400">Preview Active</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploadProgress}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white py-3 rounded-xl transition-colors shadow-md"
                  >
                    {uploadProgress ? 'Uploading...' : 'Save Dish details'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFoodModal(false)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
