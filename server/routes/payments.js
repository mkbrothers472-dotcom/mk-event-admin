const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Event   = require('../models/Event');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({ path: 'event_id', populate: { path: 'client_id' } })
      .sort({ createdAt: -1 });
    const mapped = payments.map(p => {
      const obj = p.toObject();
      obj.id = obj._id;
      if (obj.event_id) {
        obj.event = obj.event_id;
        obj.event.id = obj.event._id;
        if (obj.event.client_id) {
          obj.event.client = obj.event.client_id;
        }
      }
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment — also updates event advance_received
router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();

    // Update event advance_received and payment_status
    const event = await Event.findById(req.body.event_id);
    if (event) {
      event.advance_received += Number(req.body.amount);
      event.remaining_balance = event.total_price - event.advance_received;
      if (event.remaining_balance <= 0) {
        event.payment_status = 'Paid';
        event.remaining_balance = 0;
      } else if (event.advance_received > 0) {
        event.payment_status = 'Partial Paid';
      }
      await event.save();
    }

    await payment.populate({ path: 'event_id', populate: { path: 'client_id' } });
    const obj = payment.toObject();
    obj.id = obj._id;
    if (obj.event_id) {
      obj.event = obj.event_id;
      obj.event.id = obj.event._id;
      if (obj.event.client_id) obj.event.client = obj.event.client_id;
    }
    res.status(201).json(obj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
