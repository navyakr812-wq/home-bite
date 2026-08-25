const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connUri = process.env.MONGO_URI;

async function checkUsers() {
  await mongoose.connect(connUri);
  const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isActive: Boolean
  }));

  const users = await User.find({});
  console.log('Registered Users:');
  console.log(users.map(u => ({ name: u.name, email: u.email, role: u.role, isActive: u.isActive })));
  await mongoose.disconnect();
}

checkUsers();
