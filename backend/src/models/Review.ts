import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chef: { type: Schema.Types.ObjectId, ref: 'Chef' },
  foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Review = mongoose.model('Review', ReviewSchema);
