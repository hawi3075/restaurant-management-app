const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const MenuItem = require('../models/MenuItem');

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    const revenueAgg = await Order.aggregate([
      // Aggregates revenue from orders that are paid or have active/completed fulfillment statuses
      { $match: { $or: [{ paymentStatus: 'Paid' }, { status: { $in: ['Preparing', 'Ready', 'Delivered', 'Completed'] } }] } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const revenue = (revenueAgg[0] && revenueAgg[0].total) || 0;

    const activeOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Confirmed', 'Preparing', 'Ready'] } });
    // Count all users who are not customers as staff (flexible role strings allowed)
    const totalStaff = await User.countDocuments({ role: { $ne: 'customer' } });
    const inventoryItems = await Inventory.countDocuments();
    const menuCount = await MenuItem.countDocuments();

    return res.json({ revenue, activeOrders, totalStaff, inventoryItems, menuCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email') // Populates customer details based on your DB schema
      .sort({ createdAt: -1 }); // Sort newest orders first

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;