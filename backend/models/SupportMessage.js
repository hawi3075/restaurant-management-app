const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Resolved', 'Closed'], default: 'Pending' },
  reply: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportSchema);
