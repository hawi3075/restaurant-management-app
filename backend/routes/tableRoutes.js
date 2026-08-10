const express = require('express');
const router = express.Router();
const Table = require('../models/Table');

// GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    return res.status(200).json({ success: true, tables });
  } catch (err) {
    console.error('Fetch Tables Error:', err);
    return res.status(500).json({ message: 'Server error while fetching tables.' });
  }
});

// Update table status (PUT /api/tables/:id)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const table = await Table.findById(id);
    if (!table) return res.status(404).json({ message: 'Table not found.' });

    table.status = status || table.status;
    await table.save();

    const io = req.app.get('io');
    if (io) io.emit('table_status_updated', { id: table._id, status: table.status, tableNumber: table.tableNumber });

    return res.status(200).json({ success: true, table });
  } catch (err) {
    console.error('Update Table Error:', err);
    return res.status(500).json({ message: 'Server error while updating table.' });
  }
});

module.exports = router;
