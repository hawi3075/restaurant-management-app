// backend/models/MenuItem.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts', 'Fast Food'], 
    required: true 
  },
  description: { type: String },
  price: { type: Number, required: true },
  preparationTime: { type: Number, required: true }, // in minutes
  image: { type: String }, // Cloudinary URL
  availabilityStatus: { type: Boolean, default: true },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);