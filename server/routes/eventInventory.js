const express = require('express');
const router = express.Router();
const EventInventory = require('../models/EventInventory');

// GET all (optionally filter by event_id)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.event_id ? { event_id: req.query.event_id } : {};
    const items = await EventInventory.find(filter)
      .populate('inventory_id')
      .populate('event_id');
    const mapped = items.map(i => {
      const obj = i.toObject();
      obj.id = obj._id;
      obj.inventory_item = obj.inventory_id;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const item = new EventInventory(req.body);
    await item.save();
    await item.populate('inventory_id');
    const obj = item.toObject();
    obj.id = obj._id;
    obj.inventory_item = obj.inventory_id;
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update pickup status
router.put('/:id', async (req, res) => {
  try {
    const item = await EventInventory.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('inventory_id');
    if (!item) return res.status(404).json({ error: 'Not found' });
    const obj = item.toObject();
    obj.id = obj._id;
    obj.inventory_item = obj.inventory_id;
    res.json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
