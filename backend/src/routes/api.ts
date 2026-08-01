import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, deleteAccount, forgotPassword, addAddress, toggleWishlist } from '../controllers/authController';
import { getChefs, getChefById, updateChefProfile, addChefReview } from '../controllers/chefController';
import { getFoodItems, getFoodById, createFoodItem, updateFoodItem, deleteFoodItem } from '../controllers/foodController';
import { placeOrder, getMyOrders, getChefOrders, updateOrderStatus, cancelOrder, getAdminAnalytics } from '../controllers/orderController';
import { getUsers, toggleSuspendUser, deleteUser, getAdminChefs, adminAddChef, adminEditChef, toggleChefStatus, adminDeleteChef, getAdminOrders } from '../controllers/adminController';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController';
import { authenticate, requireChef, requireAdmin } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/signup', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);
router.put('/auth/password', authenticate, changePassword);
router.post('/auth/delete-account', authenticate, deleteAccount);
router.post('/auth/address', authenticate, addAddress);
router.post('/auth/wishlist', authenticate, toggleWishlist);

// Chef Routes
router.get('/chefs', getChefs);
router.get('/chefs/:id', getChefById);
router.put('/chefs/profile', authenticate, requireChef, updateChefProfile);
router.post('/chefs/:id/reviews', authenticate, addChefReview);

// Food Routes
router.get('/dishes', getFoodItems);
router.get('/dishes/:id', getFoodById);
router.post('/dishes', authenticate, requireChef, createFoodItem);
router.put('/dishes/:id', authenticate, requireChef, updateFoodItem);
router.delete('/dishes/:id', authenticate, requireChef, deleteFoodItem);

// Order Routes
router.post('/orders', authenticate, placeOrder);
router.get('/orders/my', authenticate, getMyOrders);
router.get('/orders/chef', authenticate, requireChef, getChefOrders);
router.put('/orders/:id/status', authenticate, updateOrderStatus);
router.put('/orders/:id/cancel', authenticate, cancelOrder);

// Payment Routes
router.post('/payments/create-order', authenticate, createRazorpayOrder);
router.post('/payments/verify', authenticate, verifyPayment);

// Admin Routes
router.get('/admin/analytics', authenticate, requireAdmin, getAdminAnalytics);
router.get('/admin/users', authenticate, requireAdmin, getUsers);
router.put('/admin/users/:id/suspend', authenticate, requireAdmin, toggleSuspendUser);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUser);
router.get('/admin/chefs', authenticate, requireAdmin, getAdminChefs);
router.post('/admin/chefs', authenticate, requireAdmin, adminAddChef);
router.put('/admin/chefs/:id', authenticate, requireAdmin, adminEditChef);
router.put('/admin/chefs/:id/toggle', authenticate, requireAdmin, toggleChefStatus);
router.delete('/admin/chefs/:id', authenticate, requireAdmin, adminDeleteChef);
router.get('/admin/orders', authenticate, requireAdmin, getAdminOrders);

export default router;
