"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const api_1 = __importDefault(require("./routes/api"));
const User_1 = require("./models/User");
const Chef_1 = require("./models/Chef");
const FoodItem_1 = require("./models/FoodItem");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middleware Configuration
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// API Rate Limiting (100 requests per 15 minutes per IP address)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { message: 'Too many API requests from this connection. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// API Namespace
app.use('/api', api_1.default);
// Healthcheck
app.get('/', (req, res) => {
    res.send('HomeBite API running with full production security headers and rate limits active.');
});
// Seed Initial Data Helper
const seedDatabase = async () => {
    try {
        const userCount = await User_1.User.countDocuments();
        if (userCount > 0) {
            console.log('Database already populated. Skipping seeding.');
            return;
        }
        console.log('Seeding initial database content...');
        const hashedAdminPassword = await bcryptjs_1.default.hash('admin123', 10);
        const hashedChefPassword = await bcryptjs_1.default.hash('chef123', 10);
        const hashedUserPassword = await bcryptjs_1.default.hash('user123', 10);
        // Create Admin
        const adminUser = new User_1.User({
            name: 'Admin HomeBite',
            email: 'admin@homebite.com',
            password: hashedAdminPassword,
            role: 'admin',
            phoneNumber: '+15550000000'
        });
        await adminUser.save();
        // Create Chef 1
        const chefUser1 = new User_1.User({
            name: 'Chef Maria',
            email: 'maria@homebite.com',
            password: hashedChefPassword,
            role: 'chef',
            phoneNumber: '+15551111111'
        });
        await chefUser1.save();
        const chef1 = new Chef_1.Chef({
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
        const chefUser2 = new User_1.User({
            name: 'Chef Rajesh',
            email: 'rajesh@homebite.com',
            password: hashedChefPassword,
            role: 'chef',
            phoneNumber: '+15552222222'
        });
        await chefUser2.save();
        const chef2 = new Chef_1.Chef({
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
        // Seed Food Items for Chef 1
        const dish1 = new FoodItem_1.FoodItem({
            name: 'Fluffy Berry Pancakes',
            description: 'Golden, light, and fluffy pancakes stacked high, topped with fresh mixed berries and premium maple syrup.',
            price: 12,
            imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=400',
            category: 'Breakfast',
            chef: chef1._id,
            rating: 4.8,
            prepTime: '15-20 mins',
            ingredients: ['Flour', 'Buttermilk', 'Egg', 'Blueberries', 'Maple Syrup'],
            allergens: ['Gluten', 'Eggs', 'Dairy'],
            vegIndicator: 'Veg',
            discount: 10
        });
        const dish2 = new FoodItem_1.FoodItem({
            name: 'Vanilla Bean Crème Brûlée',
            description: 'Rich custard base flavored with real Madagascar vanilla beans, finished with a crisp layer of caramelized sugar.',
            price: 8,
            imageUrl: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&q=80&w=400',
            category: 'Desserts',
            chef: chef1._id,
            rating: 4.9,
            prepTime: '10-15 mins',
            ingredients: ['Heavy Cream', 'Vanilla Beans', 'Sugar', 'Egg Yolks'],
            allergens: ['Dairy', 'Eggs'],
            vegIndicator: 'Veg'
        });
        // Seed Food Items for Chef 2
        const dish3 = new FoodItem_1.FoodItem({
            name: 'Signature Butter Chicken',
            description: 'Tender tandoori chicken simmered in a smooth, creamy, mildly spiced tomato and cashew butter sauce.',
            price: 16,
            imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400',
            category: 'Lunch',
            chef: chef2._id,
            rating: 4.9,
            prepTime: '25-30 mins',
            ingredients: ['Chicken Boneless', 'Tomato Puree', 'Cashew Paste', 'Fresh Cream', 'Butter', 'Indian Spices'],
            allergens: ['Dairy', 'Nuts'],
            vegIndicator: 'Non-Veg',
            discount: 15
        });
        const dish4 = new FoodItem_1.FoodItem({
            name: 'Samosa Chaat Platter',
            description: 'Crispy vegetable samosas crushed and layered with spiced chickpeas, sweet yogurt, tangy tamarind chutney, and fresh cilantro.',
            price: 9,
            imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=400',
            category: 'Snacks',
            chef: chef2._id,
            rating: 4.7,
            prepTime: '10-15 mins',
            ingredients: ['Potatoes', 'Peas', 'Flour Wrapper', 'Chickpeas', 'Sweet Yogurt', 'Mint Chutney', 'Tamarind Chutney'],
            allergens: ['Gluten', 'Dairy'],
            vegIndicator: 'Veg'
        });
        await Promise.all([dish1.save(), dish2.save(), dish3.save(), dish4.save()]);
        console.log('Database seeding finished successfully.');
    }
    catch (err) {
        console.error('Error seeding initial data:', err);
    }
};
(0, db_1.connectDB)().then(() => {
    seedDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
