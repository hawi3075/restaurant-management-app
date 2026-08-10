const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get all staff (exclude customers)
router.get('/', async (req, res) => {
  try {
    const staff = await User.find({ role: { $ne: 'customer' } }).select('-password');
    return res.status(200).json({ success: true, staff });
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ message: 'Server error fetching staff.' });
  }
});

// Create staff member
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed, role: role.toLowerCase(), phone: phone || '', active: true });
    await user.save();

    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, active: user.active } });
  } catch (error) {
    console.error('Create staff error:', error);
    return res.status(500).json({ message: 'Server error creating staff.' });
  }
});

// Update staff (role, name, phone, active)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.role) updates.role = updates.role.toLowerCase();

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Prevent changing customers with this route
    if (user.role === 'customer' && updates.role && updates.role !== 'customer') {
      // allow promoting customer to staff if needed
    }

    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, active: user.active } });
  } catch (error) {
    console.error('Update staff error:', error);
    return res.status(500).json({ message: 'Server error updating staff.' });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Staff deleted.' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return res.status(500).json({ message: 'Server error deleting staff.' });
  }
});

module.exports = router;
