const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
