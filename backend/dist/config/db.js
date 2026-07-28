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
    console.log(`Connecting to MongoDB at ${connUri}...`);
    try {
        await mongoose_1.default.connect(connUri, {
            serverSelectionTimeoutMS: 2000
        });
        console.log(`MongoDB Connected successfully to ${connUri}`);
    }
    catch (error) {
        console.warn(`Local MongoDB connection failed: ${error.message}`);
        console.log(`Starting in-memory MongoDB Server...`);
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
