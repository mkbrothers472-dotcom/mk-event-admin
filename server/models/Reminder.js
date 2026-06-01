const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reminder_type: {
    type: String,
    required: true,
    enum: [
      '3 Days Before Event',
      '1 Day Before Event',
      'Event Day Morning',
      'Remaining Payment Reminder',
      'Overdue Payment Reminder',
      'Decoration Material Pickup Reminder',
      'Equipment Return Reminder',
    ],
  },
  reminder_date: { type: String, required: true },
  is_sent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
