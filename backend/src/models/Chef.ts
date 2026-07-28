import mongoose, { Schema } from 'mongoose';

const ChefSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  specialties: [{ type: String }],
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  deliveryTime: { type: String, default: '30-45 mins' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Chef = mongoose.model('Chef', ChefSchema);
