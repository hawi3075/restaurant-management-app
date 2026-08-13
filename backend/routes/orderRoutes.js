const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// --- GET USER ORDERS (GET /api/orders/user) ---
router.get('/user', async (req, res) => {
  try {
    // Extract user identifier from auth middleware (req.user) or custom headers
    let query = {};
    if (req.user && req.user.id) {
      query = { customer: req.user.id };
    } else if (req.headers['x-user-email']) {
      query = { 'customer.email': req.headers['x-user-email'] };
    } else if (req.query.email) {
      query = { 'customer.email': req.query.email };
    }

    const orders = await Order.find(query.customer || query['customer.email'] ? query : {}).sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      id: order.orderId || `ORD-${order._id.toString().slice(-4).toUpperCase()}`,
      date: new Date(order.createdAt || Date.now()).toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
      }),
      status: order.status || 'Preparing',
      paymentStatus: order.paymentStatus || 'Pending',
      paymentMethod: order.paymentMethod || 'telebirr',
      serviceType: order.serviceType || 'dine-in',
      deliveryAddress: order.deliveryAddress || null,
      orderItems: order.orderItems || [],
      items: order.orderItems && order.orderItems.length > 0 
        ? order.orderItems.map(item => `${item.quantity || 1}x ${item.name || item.menuItem?.name || 'Item'}`).join(', ')
        : '1x Custom Meal',
      totalAmount: order.totalAmount || 0,
      total: `$${(order.totalAmount || 0).toFixed(2)}`,
      image: order.orderItems?.[0]?.image || order.orderItems?.[0]?.menuItem?.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80',
      deliveryStatus: order.status === 'Served' ? 'Delivered' : order.status === 'Ready' ? 'Ready for Pickup' : order.status === 'Preparing' ? 'Cooking' : 'Pending'
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

// --- GET ACTIVE DRIVER ORDERS (GET /api/orders/driver/active) ---
router.get('/driver/active', async (req, res) => {
  try {
    const orders = await Order.find({ 
      serviceType: { $regex: /^delivery$/i }, 
      status: { $in: ['Ready', 'Ready for Pickup', 'Out for Delivery'] } 
    }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Fetch Driver Orders Error:', err);
    return res.status(500).json({ message: 'Server error while fetching driver delivery tasks.' });
  }
});

// --- GET ACTIVE WAITER ORDERS (GET /api/orders/waiter/active) ---
router.get('/waiter/active', async (req, res) => {
  try {
    const orders = await Order.find({ 
      serviceType: { $ne: 'delivery' }, 
      status: { $ne: 'Served' } 
    }).populate('table').sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Fetch Waiter Orders Error:', err);
    return res.status(500).json({ message: 'Server error while fetching waiter table tasks.' });
  }
});

// --- CREATE ORDER (POST /api/orders) ---
router.post('/', async (req, res) => {
  try {
    const { 
      customer, 
      table, 
      waiter, 
      serviceType, 
      deliveryAddress, 
      orderItems, 
      totalAmount, 
      specialInstructions, 
      paymentMethod, 
      paymentReference, 
      paymentStatus 
    } = req.body;

    const newOrder = new Order({
      customer,
      serviceType: serviceType || 'dine-in',
      table: table || null,
      waiter: waiter || null,
      deliveryAddress: deliveryAddress || { street: 'Main Road', city: 'Adama', latitude: 8.5410, longitude: 39.2705 },
      orderItems: orderItems || [],
      totalAmount: totalAmount || 0,
      specialInstructions: specialInstructions || '',
      paymentMethod: paymentMethod || 'telebirr',
      paymentReference: paymentReference || '',
      paymentStatus: paymentStatus || 'Pending',
      status: 'Pending'
    });

    const saved = await newOrder.save();

    const io = req.app.get('io');
    if (io) io.emit('new_order_placed', saved);

    return res.status(201).json({ success: true, order: saved });
  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ message: 'Server error while creating order.' });
  }
});

// --- ASSIGN DRIVER TO ORDER (PUT /api/orders/:id/assign-driver) ---
router.put('/:id/assign-driver', async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.driver = driverId;
    order.status = 'Out for Delivery';
    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('order_status_updated', { id: order._id, status: order.status, driver: driverId });

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Assign Driver Error:', err);
    return res.status(500).json({ message: 'Server error while assigning driver.' });
  }
});

// --- UPDATE ORDER STATUS (PUT /api/orders/:id/status) ---
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const normalizedStatus = String(status || '').trim();
    const statusMap = {
      'Preparing': 'Preparing',
      'Ready': 'Ready',
      'Ready for Pickup': 'Ready',
      'Out for Delivery': 'Out for Delivery',
      'Served': 'Served',
      'Delivered': 'Served'
    };

    order.status = statusMap[normalizedStatus] || order.status;
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', { id: order._id, status: order.status, order });
      io.emit('new_kitchen_order', order);
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Update Order Status Error:', err);
    return res.status(500).json({ message: 'Server error while updating order status.' });
  }
});

module.exports = router;