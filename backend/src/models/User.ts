import mongoose, { Schema } from 'mongoose';

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'chef', 'admin'], default: 'customer' },
  phoneNumber: { type: String, default: '' },
  profilePictureUrl: { type: String, default: '' },
  addresses: [AddressSchema],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'FoodItem' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
