const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// List reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name email').populate('menuItem', 'name');
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create review
router.post('/', async (req, res) => {
  try {
    const { userId, menuItemId, rating, comment } = req.body;
    const r = new Review({ user: userId, menuItem: menuItemId, rating, comment });
    await r.save();
    return res.status(201).json({ success: true, review: r });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update review status / comment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (updates.status) review.status = updates.status;
    if (updates.comment) review.comment = updates.comment;
    await review.save();
    return res.json({ success: true, review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
