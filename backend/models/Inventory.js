// backend/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ingredientName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., kg, liters, pieces
  supplier: { type: String },
  minimumLevel: { type: Number, required: true },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);