// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderItems: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: false },
      name: { type: String },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  specialInstructions: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Served', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Refunded'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);