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
      { $match: { paymentStatus: 'Paid' } },
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

module.exports = router;
