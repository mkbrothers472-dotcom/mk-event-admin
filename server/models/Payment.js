const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount:   { type: Number, required: true },
  payment_method: {
    type: String,
    enum: ['Cash','UPI','Bank Transfer','Cheque'],
    required: true,
  },
  payment_date: { type: String, required: true },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
