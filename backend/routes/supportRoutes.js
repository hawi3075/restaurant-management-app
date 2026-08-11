const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// List all support messages (Manager endpoint: GET /api/support/all or GET /api/support)
router.get(['/', '/all'], async (req, res) => {
  try {
    const tickets = await SupportMessage.find().sort({ createdAt: -1 });
    // Return both formats to support different frontend fetch keys (e.g., data.tickets or direct array)
    return res.status(200).json({ success: true, tickets, messages: tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create a support message (from customers)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    const m = new SupportMessage({ name, email, subject, message, user: userId });
    await m.save();
    return res.status(201).json({ success: true, message: m });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Reply / update status (Supports both /:id and /:id/respond endpoints)
router.put(['/:id', '/:id/respond'], async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const m = await SupportMessage.findById(id);
    
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Handle both fields: 'reply' or 'managerResponse'
    if (updates.reply) m.reply = updates.reply;
    if (updates.managerResponse) {
      m.managerResponse = updates.managerResponse;
      m.reply = updates.managerResponse; // Sync both if needed
    }
    
    if (updates.status) m.status = updates.status;
    
    await m.save();
    return res.status(200).json({ success: true, message: 'Response updated successfully', ticket: m, data: m });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await SupportMessage.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;