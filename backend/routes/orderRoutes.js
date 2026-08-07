const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Make sure this points to your Order model

// --- GET USER ORDERS (GET /api/orders/user) ---
router.get('/user', async (req, res) => {
  try {
    // Fetch orders from MongoDB 
    const orders = await Order.find().sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      id: order.orderId || `ORD-${order._id.toString().slice(-4).toUpperCase()}`,
      date: new Date(order.createdAt || Date.now()).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      status: order.status || 'Preparing',
      items: order.items && order.items.length > 0 
        ? order.items.map(item => `${item.quantity || 1}x ${item.name}`).join(', ') 
        : '1x Custom Meal',
      total: `$${(order.totalAmount || 0).toFixed(2)}`,
      image: order.items?.[0]?.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80'
    }));

    return res.status(200).json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return res.status(500).json({ message: 'Server error while fetching orders.' });
  }
});

module.exports = router;