import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import { User } from '../models/User';
import { Chef } from '../models/Chef';
import { FoodItem } from '../models/FoodItem';
import { Order } from '../models/Order';

dotenv.config();

const run = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homebite';
  console.log('Testing connection to:', uri);
  try {
    await mongoose.connect(uri);
    console.log('Connected successfully!');
    
    const userCount = await User.countDocuments();
    const chefCount = await Chef.countDocuments();
    const foodCount = await FoodItem.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Chefs: ${chefCount}`);
    console.log(`FoodItems: ${foodCount}`);
    console.log(`Orders: ${orderCount}`);
    
    const users = await User.find().limit(5);
    console.log('Sample Users:', users.map(u => ({ name: u.name, email: u.email, role: u.role })));
    
    const chefs = await Chef.find().populate('user', 'name email');
    console.log('Sample Chefs:', chefs.map(c => ({ id: c._id, user: c.user })));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during db check:', err);
  }
};

run();
