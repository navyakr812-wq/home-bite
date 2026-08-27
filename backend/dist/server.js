"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("./config/db");
const api_1 = __importDefault(require("./routes/api"));
const User_1 = require("./models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
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
    res.send('HomeBite API v2.0 - Running successfully with MongoDB Atlas.');
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
        // Create Admin
        const adminUser = new User_1.User({
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
