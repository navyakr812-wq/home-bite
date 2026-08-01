"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAnalytics = exports.cancelOrder = exports.updateOrderStatus = exports.getChefOrders = exports.getMyOrders = exports.placeOrder = void 0;
const Order_1 = require("../models/Order");
const FoodItem_1 = require("../models/FoodItem");
const Chef_1 = require("../models/Chef");
const User_1 = require("../models/User");
const placeOrder = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { items, shippingAddress, paymentMethod, discount, specialInstructions, timeSlot } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }
        const sampleItem = await FoodItem_1.FoodItem.findById(items[0].foodItem);
        if (!sampleItem)
            return res.status(400).json({ message: 'Invalid food item' });
        let subtotal = 0;
        const resolvedItems = [];
        for (const item of items) {
            const food = await FoodItem_1.FoodItem.findById(item.foodItem);
            if (!food)
                return res.status(400).json({ message: 'Food item not found' });
            subtotal += food.price * item.quantity;
            resolvedItems.push({
                foodItem: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
                notes: item.notes || ''
            });
        }
        const deliveryFee = 5;
        const packagingFee = 2;
        const resolvedDiscount = discount || 0;
        const total = subtotal + deliveryFee + packagingFee - resolvedDiscount;
        const order = new Order_1.Order({
            customer: req.user.id,
            chef: sampleItem.chef,
            items: resolvedItems,
            subtotal,
            deliveryFee,
            packagingFee,
            discount: resolvedDiscount,
            total: Math.max(0, total),
            shippingAddress,
            paymentMethod,
            paymentStatus: 'Pending',
            status: 'Placed',
            specialInstructions: specialInstructions || '',
            timeSlot: timeSlot || 'ASAP'
        });
        await order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
};
exports.placeOrder = placeOrder;
const getMyOrders = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const orders = await Order_1.Order.find({ customer: req.user.id })
            .populate({
            path: 'chef',
            populate: { path: 'user', select: 'name' }
        })
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving orders', error });
    }
};
exports.getMyOrders = getMyOrders;
const getChefOrders = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const chef = await Chef_1.Chef.findOne({ user: req.user.id });
        if (!chef)
            return res.status(403).json({ message: 'Chef profile not found' });
        const orders = await Order_1.Order.find({ chef: chef._id })
            .populate('customer', 'name email phoneNumber')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving chef orders', error });
    }
};
exports.getChefOrders = getChefOrders;
const updateOrderStatus = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { status } = req.body;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        if (req.user.role === 'chef') {
            const chef = await Chef_1.Chef.findOne({ user: req.user.id });
            if (!chef || chef._id.toString() !== order.chef.toString()) {
                return res.status(403).json({ message: 'Unauthorized to update this order' });
            }
        }
        order.status = status;
        if (status === 'Delivered') {
            order.paymentStatus = 'Paid';
        }
        await order.save();
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating status', error });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const order = await Order_1.Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ message: 'Order not found' });
        if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized action' });
        }
        if (order.status !== 'Placed') {
            return res.status(400).json({ message: 'Order can only be cancelled before confirmation' });
        }
        order.status = 'Cancelled';
        await order.save();
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error });
    }
};
exports.cancelOrder = cancelOrder;
const getAdminAnalytics = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin only' });
        }
        const totalOrders = await Order_1.Order.countDocuments();
        const totalChefs = await Chef_1.Chef.countDocuments();
        const totalUsers = await User_1.User.countDocuments();
        const activeUsers = await User_1.User.countDocuments({ isActive: { $ne: false } });
        const totalMenuItems = await FoodItem_1.FoodItem.countDocuments();
        const pendingOrders = await Order_1.Order.countDocuments({ status: { $in: ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'] } });
        const deliveredOrdersCount = await Order_1.Order.countDocuments({ status: { $in: ['Delivered', 'Completed'] } });
        const cancelledOrders = await Order_1.Order.countDocuments({ status: 'Cancelled' });
        const todaysOrders = await Order_1.Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
        const allOrders = await Order_1.Order.find();
        const deliveredOrders = allOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed');
        const revenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);
        const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
        const categoryStats = await Promise.all(categories.map(async (cat) => {
            const count = await FoodItem_1.FoodItem.countDocuments({ category: cat });
            return { category: cat, count };
        }));
        const recentOrders = await Order_1.Order.find()
            .populate('customer', 'name email')
            .populate({
            path: 'chef',
            populate: { path: 'user', select: 'name' }
        })
            .limit(10)
            .sort({ createdAt: -1 });
        // Daily Orders (last 7 days)
        const dailyOrdersMap = {};
        // Monthly Revenue
        const monthlyRevenueMap = {};
        // Popular Foods
        const foodQuantityMap = {};
        allOrders.forEach(order => {
            if (order.createdAt) {
                const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
                dailyOrdersMap[dateStr] = (dailyOrdersMap[dateStr] || 0) + 1;
            }
            if (order.items) {
                order.items.forEach(item => {
                    if (item.foodItem) {
                        const foodId = item.foodItem.toString();
                        if (!foodQuantityMap[foodId]) {
                            foodQuantityMap[foodId] = { name: item.name, quantity: 0 };
                        }
                        foodQuantityMap[foodId].quantity += item.quantity;
                    }
                });
            }
        });
        deliveredOrders.forEach(order => {
            if (order.createdAt) {
                const monthStr = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
                monthlyRevenueMap[monthStr] = (monthlyRevenueMap[monthStr] || 0) + order.total;
            }
        });
        const dailyOrders = Object.entries(dailyOrdersMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);
        const monthlyRevenue = Object.entries(monthlyRevenueMap)
            .map(([month, revenue]) => ({ month, revenue }));
        const popularFoods = Object.entries(foodQuantityMap)
            .map(([id, data]) => ({ id, name: data.name, quantity: data.quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        res.json({
            totalOrders,
            totalChefs,
            totalUsers,
            activeUsers,
            totalMenuItems,
            revenue,
            pendingOrders,
            deliveredOrdersCount,
            cancelledOrders,
            todaysOrders,
            categoryStats,
            recentOrders,
            dailyOrders,
            monthlyRevenue,
            popularFoods
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving analytics', error });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
