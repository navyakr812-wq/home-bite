"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOrders = exports.adminDeleteChef = exports.toggleChefStatus = exports.adminEditChef = exports.adminAddChef = exports.getAdminChefs = exports.deleteUser = exports.toggleSuspendUser = exports.getUsers = void 0;
const User_1 = require("../models/User");
const Chef_1 = require("../models/Chef");
const FoodItem_1 = require("../models/FoodItem");
const Order_1 = require("../models/Order");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// --- User Management ---
const getUsers = async (req, res) => {
    try {
        const users = await User_1.User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};
exports.getUsers = getUsers;
const toggleSuspendUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin')
            return res.status(400).json({ message: 'Cannot suspend an admin user' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ message: `User account has been ${user.isActive ? 'activated' : 'suspended'} successfully`, user });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user status', error });
    }
};
exports.toggleSuspendUser = toggleSuspendUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (user.role === 'admin')
            return res.status(400).json({ message: 'Cannot delete an admin user' });
        if (user.role === 'chef') {
            const chef = await Chef_1.Chef.findOne({ user: user._id });
            if (chef) {
                // Delete all dishes associated with this chef
                await FoodItem_1.FoodItem.deleteMany({ chef: chef._id });
                await Chef_1.Chef.findByIdAndDelete(chef._id);
            }
        }
        await User_1.User.findByIdAndDelete(user._id);
        res.json({ message: 'User account and associated profiles deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};
exports.deleteUser = deleteUser;
// --- Chef Management ---
const getAdminChefs = async (req, res) => {
    try {
        // Return all chefs for administration
        const chefs = await Chef_1.Chef.find().populate('user', 'name email phoneNumber isActive');
        res.json(chefs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving chefs', error });
    }
};
exports.getAdminChefs = getAdminChefs;
const adminAddChef = async (req, res) => {
    try {
        const { name, email, password, bio, cuisine, specialties, location, contact, deliveryTime, avatarUrl, coverImageUrl } = req.body;
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists with this email' });
        const hashedPassword = await bcryptjs_1.default.hash(password || 'chef123', 10);
        const user = new User_1.User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'chef',
            phoneNumber: contact || ''
        });
        await user.save();
        const chef = new Chef_1.Chef({
            user: user._id,
            bio: bio || 'Fresh homemade recipes cooked with love.',
            avatarUrl: avatarUrl || '',
            coverImageUrl: coverImageUrl || '',
            specialties: specialties || (cuisine ? [cuisine] : ['Lunch', 'Dinner']),
            deliveryTime: deliveryTime || '30-45 mins',
            isActive: true
        });
        await chef.save();
        res.status(201).json({ chef, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating chef', error });
    }
};
exports.adminAddChef = adminAddChef;
const adminEditChef = async (req, res) => {
    try {
        const { name, bio, specialties, deliveryTime, avatarUrl, coverImageUrl, contact } = req.body;
        const chef = await Chef_1.Chef.findById(req.params.id);
        if (!chef)
            return res.status(404).json({ message: 'Chef profile not found' });
        chef.bio = bio !== undefined ? bio : chef.bio;
        chef.avatarUrl = avatarUrl !== undefined ? avatarUrl : chef.avatarUrl;
        chef.coverImageUrl = coverImageUrl !== undefined ? coverImageUrl : chef.coverImageUrl;
        chef.specialties = specialties !== undefined ? specialties : chef.specialties;
        chef.deliveryTime = deliveryTime !== undefined ? deliveryTime : chef.deliveryTime;
        await chef.save();
        if (name || contact) {
            const user = await User_1.User.findById(chef.user);
            if (user) {
                user.name = name ? name.trim() : user.name;
                user.phoneNumber = contact !== undefined ? contact.trim() : user.phoneNumber;
                await user.save();
            }
        }
        res.json(chef);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating chef details', error });
    }
};
exports.adminEditChef = adminEditChef;
const toggleChefStatus = async (req, res) => {
    try {
        const chef = await Chef_1.Chef.findById(req.params.id);
        if (!chef)
            return res.status(404).json({ message: 'Chef profile not found' });
        chef.isActive = !chef.isActive;
        await chef.save();
        res.json({ message: `Chef status updated to ${chef.isActive ? 'Active' : 'Inactive'}`, chef });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating chef status', error });
    }
};
exports.toggleChefStatus = toggleChefStatus;
const adminDeleteChef = async (req, res) => {
    try {
        const chef = await Chef_1.Chef.findById(req.params.id);
        if (!chef)
            return res.status(404).json({ message: 'Chef not found' });
        const menuItemsCount = await FoodItem_1.FoodItem.countDocuments({ chef: chef._id });
        if (menuItemsCount > 0 && req.query.force !== 'true') {
            return res.status(400).json({
                hasMenuItems: true,
                message: `Chef still has ${menuItemsCount} active menu items. Deleting this chef profile will remove all of their dishes.`
            });
        }
        // Delete chef's food items if forced or no items exist
        await FoodItem_1.FoodItem.deleteMany({ chef: chef._id });
        // Change user role back to customer or delete? Let's delete the chef profile and revert user role
        const user = await User_1.User.findById(chef.user);
        if (user) {
            user.role = 'customer';
            await user.save();
        }
        await Chef_1.Chef.findByIdAndDelete(chef._id);
        res.json({ message: 'Chef profile deleted and user role reverted to customer' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting chef', error });
    }
};
exports.adminDeleteChef = adminDeleteChef;
// --- Order Admin Management ---
const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order_1.Order.find()
            .populate('customer', 'name email phoneNumber')
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
exports.getAdminOrders = getAdminOrders;
