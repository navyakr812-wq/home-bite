import mongoose from 'mongoose';

let mongod: any = null;

export const connectDB = async () => {
  const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homebite';
  console.log(`Connecting to MongoDB at ${connUri}...`);
  try {
    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected successfully to ${connUri}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${(error as Error).message}`);
    console.log(`Starting in-memory MongoDB Server...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`In-memory MongoDB started at: ${uri}`);
      await mongoose.connect(uri);
      console.log(`MongoDB Connected successfully to in-memory server.`);
    } catch (innerError) {
      console.error(`Failed to start in-memory MongoDB:`, innerError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};
