const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  event_name: {
    type: String,
    required: true,
    enum: ['Baby Shower','Birthday Decoration','Welcome Baby','Mandap Muhurat','Wedding Decoration','Shrimant Sanskar','Custom Event'],
  },
  custom_event_name: { type: String },
  event_venue:       { type: String, required: true },
  event_date:        { type: String, required: true },   // stored as YYYY-MM-DD
  event_time:        { type: String, required: true },   // stored as HH:MM
  event_status: {
    type: String,
    enum: ['Upcoming','In Progress','Completed','Cancelled'],
    default: 'Upcoming',
  },
  total_price:      { type: Number, required: true, default: 0 },
  advance_received: { type: Number, default: 0 },
  remaining_balance:{ type: Number, default: 0 },
  payment_method: {
    type: String,
    enum: ['Cash','UPI','Bank Transfer','Cheque'],
    default: 'Cash',
  },
  payment_status: {
    type: String,
    enum: ['Paid','Partial Paid','Pending'],
    default: 'Pending',
  },
  notes: { type: String },
}, { timestamps: true });

// Auto-calculate remaining balance before save
eventSchema.pre('save', function(next) {
  this.remaining_balance = this.total_price - this.advance_received;
  next();
});

module.exports = mongoose.model('Event', eventSchema);
