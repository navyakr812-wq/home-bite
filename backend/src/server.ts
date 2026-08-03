import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import dns from 'dns';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';
import { User } from './models/User';
import { Chef } from './models/Chef';
import { FoodItem } from './models/FoodItem';
import bcrypt from 'bcryptjs';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const app = express();
app.set('trust proxy', 1);

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
  res.send('HomeBite API v2.0 - Running successfully with MongoDB Atlas.');
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
    
    // Create Admin
    const adminUser = new User({
      name: 'Admin HomeBite',
      email: 'admin@homebite.com',
      password: hashedAdminPassword,
      role: 'admin',
      phoneNumber: '+15550000000'
    });
    await adminUser.save();

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
