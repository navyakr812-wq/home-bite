import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';
import { User } from './models/User';
import { Chef } from './models/Chef';
import { FoodItem } from './models/FoodItem';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware Configuration
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Rate Limiting (100 requests per 15 minutes per IP address)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  message: { message: 'Too many API requests from this connection. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// API Namespace
app.use('/api', apiRoutes);

// Healthcheck
app.get('/', (req, res) => {
  res.send('HomeBite API running with full production security headers and rate limits active.');
});

// Seed Initial Data Helper
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already populated. Skipping seeding.');
      return;
    }

    console.log('Seeding initial database content...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedChefPassword = await bcrypt.hash('chef123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Create Admin
    const adminUser = new User({
      name: 'Admin HomeBite',
      email: 'admin@homebite.com',
      password: hashedAdminPassword,
      role: 'admin',
      phoneNumber: '+15550000000'
    });
    await adminUser.save();

    // Create Chef 1
    const chefUser1 = new User({
      name: 'Chef Maria',
      email: 'maria@homebite.com',
      password: hashedChefPassword,
      role: 'chef',
      phoneNumber: '+15551111111'
    });
    await chefUser1.save();

    const chef1 = new Chef({
      user: chefUser1._id,
      bio: 'Award-winning pastry chef and home cook specializing in Mediterranean breakfast & desserts.',
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200',
      coverImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
      specialties: ['Breakfast', 'Desserts'],
      rating: 4.8,
      reviewsCount: 15,
      deliveryTime: '20-35 mins'
    });
    await chef1.save();

    // Create Chef 2
    const chefUser2 = new User({
      name: 'Chef Rajesh',
      email: 'rajesh@homebite.com',
      password: hashedChefPassword,
      role: 'chef',
      phoneNumber: '+15552222222'
    });
    await chefUser2.save();

    const chef2 = new Chef({
      user: chefUser2._id,
      bio: 'Passionate about traditional home recipes, specialized in rich Indian lunch & dinners.',
      avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=200',
      coverImageUrl: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800',
      specialties: ['Lunch', 'Dinner', 'Snacks'],
      rating: 4.9,
      reviewsCount: 22,
      deliveryTime: '30-45 mins'
    });
    await chef2.save();

    // Food items are not seeded to allow starting without items.
    await Promise.all([]);
    console.log('Database seeding finished successfully (no food items seeded).');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
};

connectDB().then(() => {
  seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
