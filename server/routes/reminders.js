const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET all
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate({ path: 'event_id', populate: { path: 'client_id' } })
      .sort({ reminder_date: 1 });
    const mapped = reminders.map(r => {
      const obj = r.toObject();
      obj.id = obj._id;
      if (obj.event_id) {
        obj.event = obj.event_id;
        obj.event.id = obj.event._id;
        if (obj.event.client_id) obj.event.client = obj.event.client_id;
      }
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
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.status(201).json({ ...reminder.toObject(), id: reminder._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mark as sent
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reminder) return res.status(404).json({ error: 'Not found' });
    res.json({ ...reminder.toObject(), id: reminder._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
