import mongoose, { Schema } from 'mongoose';

const FoodItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'] },
  chef: { type: Schema.Types.ObjectId, ref: 'Chef', required: true },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  prepTime: { type: String, default: '20-30 mins' },
  isAvailable: { type: Boolean, default: true },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  vegIndicator: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], default: 'Veg' },
  discount: { type: Number, default: 0 }, // Discount percentage (e.g. 10 for 10% off)
  createdAt: { type: Date, default: Date.now }
});

export const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
