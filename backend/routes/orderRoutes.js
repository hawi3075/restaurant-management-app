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

// --- GET INCOMING ORDERS (GET /api/orders/incoming) ---
router.get('/incoming', async (req, res) => {
  try {
    const incoming = await Order.find({ status: { $in: ['Pending', 'Confirmed'] } }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders: incoming });
  } catch (err) {
    console.error('Fetch Incoming Orders Error:', err);
    return res.status(500).json({ message: 'Server error while fetching incoming orders.' });
  }
});

// --- CREATE ORDER (POST /api/orders) ---
router.post('/', async (req, res) => {
  try {
    const { customer, table, waiter, orderItems, totalAmount, specialInstructions } = req.body;

    const newOrder = new Order({
      customer,
      table,
      waiter,
      orderItems: orderItems || [],
      totalAmount: totalAmount || 0,
      specialInstructions: specialInstructions || '',
      status: 'Pending'
    });

    const saved = await newOrder.save();

    // Emit socket event for new order
    const io = req.app.get('io');
    if (io) io.emit('new_order_placed', saved);

    return res.status(201).json({ success: true, order: saved });
  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ message: 'Server error while creating order.' });
  }
});

// --- UPDATE ORDER STATUS (PUT /api/orders/:id/status) ---
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = status || order.status;
    await order.save();

    // Emit status update
    const io = req.app.get('io');
    if (io) io.emit('order_status_updated', { id: order._id, status: order.status });

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Update Order Status Error:', err);
    return res.status(500).json({ message: 'Server error while updating order status.' });
  }
});

module.exports = router;