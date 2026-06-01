const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  amount:      { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Decoration Materials',
      'Transport',
      'Labour / Staff',
      'Food & Beverages',
      'Equipment Rental',
      'Printing & Stationery',
      'Utilities',
      'Marketing',
      'Miscellaneous',
    ],
    default: 'Miscellaneous',
  },
  payment_method: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Credit Card'],
    default: 'Cash',
  },
  event_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  expense_date:{ type: String, required: true },   // YYYY-MM-DD
  expense_time:{ type: String, default: '00:00' }, // HH:MM
  note:        { type: String, trim: true },
  receipt_url: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
