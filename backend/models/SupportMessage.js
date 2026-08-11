const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  managerResponse: { type: String, default: '' },
  reply: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);