const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// List support messages
router.get('/', async (req, res) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });
    return res.json(messages);
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

// Reply / update status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const m = await SupportMessage.findById(id);
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    if (updates.reply) m.reply = updates.reply;
    if (updates.status) m.status = updates.status;
    await m.save();
    return res.json({ success: true, message: m });
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
