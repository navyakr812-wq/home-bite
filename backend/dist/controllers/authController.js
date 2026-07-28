"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlist = exports.addAddress = exports.forgotPassword = exports.deleteAccount = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Chef_1 = require("../models/Chef");
const JWT_SECRET = process.env.JWT_SECRET || 'homebite_super_secret_key_12345';
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (existing)
            return res.status(400).json({ message: 'User already exists with this email address' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new User_1.User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'customer'
        });
        await user.save();
        if (user.role === 'chef') {
            const chef = new Chef_1.Chef({
                user: user._id,
                bio: 'Fresh homemade recipes cooked with love.',
                specialties: ['Lunch', 'Dinner']
            });
            await chef.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber, profilePictureUrl: user.profilePictureUrl }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during registration', error });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            return res.status(400).json({ message: 'Invalid email or password' });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid email or password' });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phoneNumber: user.phoneNumber, profilePictureUrl: user.profilePictureUrl }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during login', error });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await User_1.User.findById(req.user.id).select('-password').populate('wishlist');
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving profile', error });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name, phoneNumber, profilePictureUrl } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        user.name = name ? name.trim() : user.name;
        user.phoneNumber = phoneNumber !== undefined ? phoneNumber.trim() : user.phoneNumber;
        user.profilePictureUrl = profilePictureUrl !== undefined ? profilePictureUrl : user.profilePictureUrl;
        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profilePictureUrl: user.profilePictureUrl
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating profile', error });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { oldPassword, newPassword } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Incorrect old password' });
        user.password = await bcryptjs_1.default.hash(newPassword, 10);
        await user.save();
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error });
    }
};
exports.changePassword = changePassword;
const deleteAccount = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { password } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Incorrect password' });
        await User_1.User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting account', error });
    }
};
exports.deleteAccount = deleteAccount;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase().trim() });
        if (!user)
            return res.status(404).json({ message: 'No user registered with this email' });
        res.json({ message: 'A verification link has been sent to your email address.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.forgotPassword = forgotPassword;
const addAddress = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { street, city, state, zipCode, isDefault } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        if (isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }
        user.addresses.push({
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            zipCode: zipCode.trim(),
            isDefault: isDefault || user.addresses.length === 0
        });
        await user.save();
        res.status(201).json(user.addresses);
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving address', error });
    }
};
exports.addAddress = addAddress;
const toggleWishlist = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { foodItemId } = req.body;
        const user = await User_1.User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const index = user.wishlist.indexOf(foodItemId);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        }
        else {
            user.wishlist.push(foodItemId);
        }
        await user.save();
        res.json(user.wishlist);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating wishlist', error });
    }
};
exports.toggleWishlist = toggleWishlist;
