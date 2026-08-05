// backend/models/Table.js
const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Occupied', 'Cleaning'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
