// backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a menu item (For Managers/Admins)
router.post('/', async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    return res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a menu item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    Object.assign(item, updates);
    await item.save();
    return res.status(200).json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await MenuItem.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;