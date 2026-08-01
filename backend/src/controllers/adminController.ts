import { Response } from 'express';
import { User } from '../models/User';
import { Chef } from '../models/Chef';
import { FoodItem } from '../models/FoodItem';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

// --- User Management ---

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

export const toggleSuspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot suspend an admin user' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User account has been ${user.isActive ? 'activated' : 'suspended'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user status', error });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete an admin user' });

    if (user.role === 'chef') {
      const chef = await Chef.findOne({ user: user._id });
      if (chef) {
        // Delete all dishes associated with this chef
        await FoodItem.deleteMany({ chef: chef._id });
        await Chef.findByIdAndDelete(chef._id);
      }
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: 'User account and associated profiles deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// --- Chef Management ---

export const getAdminChefs = async (req: AuthRequest, res: Response) => {
  try {
    // Return all chefs for administration
    const chefs = await Chef.find().populate('user', 'name email phoneNumber isActive');
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chefs', error });
  }
};

export const adminAddChef = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, bio, cuisine, specialties, location, contact, deliveryTime, avatarUrl, coverImageUrl } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password || 'chef123', 10);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'chef',
      phoneNumber: contact || ''
    });
    await user.save();

    const chef = new Chef({
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
  } catch (error) {
    res.status(500).json({ message: 'Error creating chef', error });
  }
};

export const adminEditChef = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, specialties, deliveryTime, avatarUrl, coverImageUrl, contact } = req.body;
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef profile not found' });

    chef.bio = bio !== undefined ? bio : chef.bio;
    chef.avatarUrl = avatarUrl !== undefined ? avatarUrl : chef.avatarUrl;
    chef.coverImageUrl = coverImageUrl !== undefined ? coverImageUrl : chef.coverImageUrl;
    chef.specialties = specialties !== undefined ? specialties : chef.specialties;
    chef.deliveryTime = deliveryTime !== undefined ? deliveryTime : chef.deliveryTime;
    await chef.save();

    if (name || contact) {
      const user = await User.findById(chef.user);
      if (user) {
        user.name = name ? name.trim() : user.name;
        user.phoneNumber = contact !== undefined ? contact.trim() : user.phoneNumber;
        await user.save();
      }
    }

    res.json(chef);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chef details', error });
  }
};

export const toggleChefStatus = async (req: AuthRequest, res: Response) => {
  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef profile not found' });

    chef.isActive = !chef.isActive;
    await chef.save();
    res.json({ message: `Chef status updated to ${chef.isActive ? 'Active' : 'Inactive'}`, chef });
  } catch (error) {
    res.status(500).json({ message: 'Error updating chef status', error });
  }
};

export const adminDeleteChef = async (req: AuthRequest, res: Response) => {
  try {
    const chef = await Chef.findById(req.params.id);
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    const menuItemsCount = await FoodItem.countDocuments({ chef: chef._id });
    if (menuItemsCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({ 
        hasMenuItems: true, 
        message: `Chef still has ${menuItemsCount} active menu items. Deleting this chef profile will remove all of their dishes.` 
      });
    }

    // Delete chef's food items if forced or no items exist
    await FoodItem.deleteMany({ chef: chef._id });

    // Change user role back to customer or delete? Let's delete the chef profile and revert user role
    const user = await User.findById(chef.user);
    if (user) {
      user.role = 'customer';
      await user.save();
    }

    await Chef.findByIdAndDelete(chef._id);
    res.json({ message: 'Chef profile deleted and user role reverted to customer' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chef', error });
  }
};

// --- Order Admin Management ---

export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phoneNumber')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
};
