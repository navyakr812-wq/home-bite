import dotenv from 'dotenv';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const reset = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homebite';
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri);
    console.log('Connected!');

    const email = 'admin@homebite.com';
    const newPlainPassword = 'adminHomeBite2026!';
    const hashedPassword = await bcrypt.hash(newPlainPassword, 10);

    let adminUser = await User.findOne({ email });

    if (adminUser) {
      console.log('Found existing admin user. Resetting password...');
      adminUser.password = hashedPassword;
      adminUser.role = 'admin'; // ensure correct role
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`Successfully reset password for ${email} to: ${newPlainPassword}`);
    } else {
      console.log('Admin user not found. Seeding a new admin user...');
      adminUser = new User({
        name: 'Admin HomeBite',
        email,
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '+15550000000',
        isActive: true
      });
      await adminUser.save();
      console.log(`Successfully created new admin user ${email} with password: ${newPlainPassword}`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during password reset:', err);
  }
};

reset();
