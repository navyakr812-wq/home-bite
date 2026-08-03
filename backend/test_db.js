const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGO_URI;
  console.log('Attempting to connect to MONGO_URI:', uri);
  if (!uri) {
    console.error('MONGO_URI is not defined in the environment!');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB Atlas!');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    for (let col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
