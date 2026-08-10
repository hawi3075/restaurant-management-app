const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get users (optionally filter by role)
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const q = role ? { role } : {};
    const users = await User.find(q).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update user (role, active)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (updates.role) user.role = updates.role;
    if (typeof updates.active === 'boolean') user.active = updates.active;
    await user.save();
    const out = user.toObject();
    delete out.password;
    return res.json({ success: true, user: out });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
