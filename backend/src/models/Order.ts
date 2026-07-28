import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema({
  foodItem: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  notes: { type: String, default: '' } // Specific instructions (e.g. "No onions")
});

const OrderSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chef: { type: Schema.Types.ObjectId, ref: 'Chef', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 5 },
  packagingFee: { type: Number, default: 2 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash on Delivery'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  status: { 
    type: String, 
    enum: ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'], 
    default: 'Placed' 
  },
  specialInstructions: { type: String, default: '' },
  timeSlot: { type: String, default: 'ASAP' },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', OrderSchema);
