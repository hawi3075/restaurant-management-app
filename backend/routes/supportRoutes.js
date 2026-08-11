const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

// 1. List all support tickets for manager
router.get(['/', '/all', '/manager/tickets'], async (req, res) => {
  try {
    const tickets = await SupportMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      tickets, 
      messages: tickets 
    });
  } catch (error) {
    console.error('Fetch All Support Tickets Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get tickets for logged-in customer (via email header or query)
router.get('/my-tickets', async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'] || req.query.email;
    const query = userEmail ? { email: userEmail } : {};
    
    const tickets = await SupportMessage.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true, 
      tickets, 
      messages: tickets 
    });
  } catch (error) {
    console.error('Fetch User Support Tickets Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create support message from customer
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Support message is required.' });
    }

    const resolvedEmail = email || req.headers['x-user-email'] || '';
    
    const newTicket = new SupportMessage({ 
      name: name || 'Customer', 
      email: resolvedEmail, 
      subject: subject || 'General Support', 
      message, 
      user: userId || null,
      status: 'Pending',
      createdAt: new Date()
    });

    await newTicket.save();
    
    return res.status(201).json({ 
      success: true, 
      message: 'Support ticket created successfully.',
      ticket: newTicket,
      data: newTicket 
    });
  } catch (error) {
    console.error('Create Support Ticket Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Manager reply route (handles multiple path aliases and field name options)
router.put(['/:id', '/:id/respond', '/manager/reply/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { managerResponse, reply, status } = req.body;
    
    const ticket = await SupportMessage.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }
    
    const responseText = managerResponse || reply || '';
    ticket.managerResponse = responseText;
    ticket.reply = responseText;
    ticket.status = status || 'Resolved';
    
    await ticket.save();
    
    return res.status(200).json({ 
      success: true, 
      message: 'Response updated successfully', 
      ticket, 
      data: ticket 
    });
  } catch (error) {
    console.error('Manager Reply Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;