const express = require('express');
const router  = express.Router();
const Expense = require('../models/Expense');

// GET all expenses (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, payment_method, event_id, date_from, date_to } = req.query;
    const filter = {};
    if (category)       filter.category       = category;
    if (payment_method) filter.payment_method = payment_method;
    if (event_id)       filter.event_id       = event_id;
    if (date_from || date_to) {
      filter.expense_date = {};
      if (date_from) filter.expense_date.$gte = date_from;
      if (date_to)   filter.expense_date.$lte = date_to;
    }
    const expenses = await Expense.find(filter)
      .populate('event_id', 'event_name event_date client_id')
      .sort({ expense_date: -1, expense_time: -1 });

    const mapped = expenses.map(e => ({
      ...e.toObject(),
      id: e._id,
      event: e.event_id || null,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('event_id');
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ ...expense.toObject(), id: expense._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create expense
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    await expense.populate('event_id', 'event_name event_date');
    res.status(201).json({ ...expense.toObject(), id: expense._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    ).populate('event_id', 'event_name event_date');
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ ...expense.toObject(), id: expense._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const filter = month ? { expense_date: { $regex: `^${month}` } } : {};

    const [total, byCategory] = await Promise.all([
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: filter },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({
      total_amount: total[0]?.total || 0,
      total_count:  total[0]?.count || 0,
      by_category:  byCategory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
