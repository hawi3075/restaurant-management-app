const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find();
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const item = new Inventory({
      ingredientName: body.name || body.ingredientName,
      quantity: body.quantity || 0,
      unit: body.unit || body.unit || 'pcs',
      supplier: body.supplier || '',
      minimumLevel: body.minimumLevel || 1,
      expiryDate: body.expiryDate || null
    });
    await item.save();
    return res.status(201).json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update inventory item (full update)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    Object.assign(item, {
      ingredientName: updates.name || updates.ingredientName || item.ingredientName,
      quantity: typeof updates.quantity === 'number' ? updates.quantity : item.quantity,
      unit: updates.unit || item.unit,
      supplier: updates.supplier || item.supplier,
      minimumLevel: typeof updates.minimumLevel === 'number' ? updates.minimumLevel : item.minimumLevel,
      expiryDate: updates.expiryDate || item.expiryDate
    });
    await item.save();
    return res.json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Adjust quantity (stock in/out) with amount in body { amount: 5 }
router.post('/:id/adjust', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
    item.quantity = Math.max(0, item.quantity + Number(amount || 0));
    await item.save();
    return res.json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
