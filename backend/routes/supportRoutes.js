const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// List all support tickets for manager
router.get(['/', '/all', '/manager/tickets'], async (req, res) => {
  try {
    const tickets = await SupportMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tickets, messages: tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get tickets for logged-in customer
router.get('/my-tickets', async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'];
    const query = userEmail ? { email: userEmail } : {};
    const tickets = await SupportMessage.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tickets, messages: tickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create support message from customer
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    const m = new SupportMessage({ name, email, subject, message, user: userId });
    await m.save();
    return res.status(201).json({ success: true, message: m, ticket: m });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Manager reply route
router.put(['/:id', '/:id/respond', '/manager/reply/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { managerResponse, reply, status } = req.body;
    
    const m = await SupportMessage.findById(id);
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });
    
    const responseText = managerResponse || reply || '';
    m.managerResponse = responseText;
    m.reply = responseText;
    m.status = status || 'Resolved';
    
    await m.save();
    return res.status(200).json({ success: true, message: 'Response updated successfully', ticket: m, data: m });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;