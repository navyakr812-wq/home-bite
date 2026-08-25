const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const connUri = process.env.MONGO_URI;

async function resetPassword() {
  await mongoose.connect(connUri);
  const User = mongoose.model('User', new mongoose.Schema({
    email: String,
    password: String
  }));

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const result = await User.updateOne(
    { email: 'admin@homebite.com' },
    { $set: { password: hashedPassword } }
  );
  console.log('Password reset result:', result);
  await mongoose.disconnect();
}

resetPassword();
