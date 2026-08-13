const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceType: { 
    type: String, 
    enum: ['delivery', 'dine-in'], 
    required: true, 
    default: 'dine-in' 
  },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' }, // Used for dine-in
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Used for dine-in
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Used for deliveries
  deliveryAddress: {
    street: { type: String },
    city: { type: String, default: 'Adama' },
    latitude: { type: Number, default: 8.5410 },   // Default Adama coordinates
    longitude: { type: Number, default: 39.2705 }
  },
  orderItems: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: false },
      name: { type: String, required: true },
      image: { type: String },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  specialInstructions: { type: String },
  paymentMethod: {
    type: String,
    enum: ['telebirr', 'chapa', 'card', 'cash'],
    lowercase: true,
    trim: true,
    default: 'telebirr'
  },
  paymentReference: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Served', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Refunded'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);