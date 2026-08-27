"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let mongod = null;
const connectDB = async () => {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homebite';
    const safeLogUri = connUri.replace(/:([^@/]+)@/, ':******@');
    console.log(`Connecting to MongoDB at ${safeLogUri}...`);
    try {
        await mongoose_1.default.connect(connUri, {
            serverSelectionTimeoutMS: 10000
        });
        console.log(`MongoDB Connected successfully to ${safeLogUri}`);
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        if (process.env.MONGO_URI) {
            console.error("MONGO_URI environment variable is defined. Exiting process to avoid silent fallback to in-memory database.");
            process.exit(1);
        }
        console.log(`Starting in-memory MongoDB Server for development fallback...`);
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            console.log(`In-memory MongoDB started at: ${uri}`);
            await mongoose_1.default.connect(uri);
            console.log(`MongoDB Connected successfully to in-memory server.`);
        }
        catch (innerError) {
            console.error(`Failed to start in-memory MongoDB:`, innerError);
            process.exit(1);
        }
    }
};
exports.connectDB = connectDB;
const closeDB = async () => {
    await mongoose_1.default.disconnect();
    if (mongod) {
        await mongod.stop();
    }
};
exports.closeDB = closeDB;
