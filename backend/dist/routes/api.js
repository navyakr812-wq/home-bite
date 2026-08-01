"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const chefController_1 = require("../controllers/chefController");
const foodController_1 = require("../controllers/foodController");
const orderController_1 = require("../controllers/orderController");
const adminController_1 = require("../controllers/adminController");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Auth Routes
router.post('/auth/signup', authController_1.register);
router.post('/auth/login', authController_1.login);
router.post('/auth/forgot-password', authController_1.forgotPassword);
router.get('/auth/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/auth/profile', auth_1.authenticate, authController_1.updateProfile);
router.put('/auth/password', auth_1.authenticate, authController_1.changePassword);
router.post('/auth/delete-account', auth_1.authenticate, authController_1.deleteAccount);
router.post('/auth/address', auth_1.authenticate, authController_1.addAddress);
router.post('/auth/wishlist', auth_1.authenticate, authController_1.toggleWishlist);
// Chef Routes
router.get('/chefs', chefController_1.getChefs);
router.get('/chefs/:id', chefController_1.getChefById);
router.put('/chefs/profile', auth_1.authenticate, auth_1.requireChef, chefController_1.updateChefProfile);
router.post('/chefs/:id/reviews', auth_1.authenticate, chefController_1.addChefReview);
// Food Routes
router.get('/dishes', foodController_1.getFoodItems);
router.get('/dishes/:id', foodController_1.getFoodById);
router.post('/dishes', auth_1.authenticate, auth_1.requireChef, foodController_1.createFoodItem);
router.put('/dishes/:id', auth_1.authenticate, auth_1.requireChef, foodController_1.updateFoodItem);
router.delete('/dishes/:id', auth_1.authenticate, auth_1.requireChef, foodController_1.deleteFoodItem);
// Order Routes
router.post('/orders', auth_1.authenticate, orderController_1.placeOrder);
router.get('/orders/my', auth_1.authenticate, orderController_1.getMyOrders);
router.get('/orders/chef', auth_1.authenticate, auth_1.requireChef, orderController_1.getChefOrders);
router.put('/orders/:id/status', auth_1.authenticate, orderController_1.updateOrderStatus);
router.put('/orders/:id/cancel', auth_1.authenticate, orderController_1.cancelOrder);
// Payment Routes
router.post('/payments/create-order', auth_1.authenticate, paymentController_1.createRazorpayOrder);
router.post('/payments/verify', auth_1.authenticate, paymentController_1.verifyPayment);
// Admin Routes
router.get('/admin/analytics', auth_1.authenticate, auth_1.requireAdmin, orderController_1.getAdminAnalytics);
router.get('/admin/users', auth_1.authenticate, auth_1.requireAdmin, adminController_1.getUsers);
router.put('/admin/users/:id/suspend', auth_1.authenticate, auth_1.requireAdmin, adminController_1.toggleSuspendUser);
router.delete('/admin/users/:id', auth_1.authenticate, auth_1.requireAdmin, adminController_1.deleteUser);
router.get('/admin/chefs', auth_1.authenticate, auth_1.requireAdmin, adminController_1.getAdminChefs);
router.post('/admin/chefs', auth_1.authenticate, auth_1.requireAdmin, adminController_1.adminAddChef);
router.put('/admin/chefs/:id', auth_1.authenticate, auth_1.requireAdmin, adminController_1.adminEditChef);
router.put('/admin/chefs/:id/toggle', auth_1.authenticate, auth_1.requireAdmin, adminController_1.toggleChefStatus);
router.delete('/admin/chefs/:id', auth_1.authenticate, auth_1.requireAdmin, adminController_1.adminDeleteChef);
router.get('/admin/orders', auth_1.authenticate, auth_1.requireAdmin, adminController_1.getAdminOrders);
exports.default = router;
