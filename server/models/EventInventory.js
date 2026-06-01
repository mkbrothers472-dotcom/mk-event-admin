const mongoose = require('mongoose');

const eventInventorySchema = new mongoose.Schema({
  event_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  inventory_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity_used: { type: Number, required: true, default: 0 },
  pickup_status: {
    type: String,
    enum: ['Pending Pickup','Partially Picked','Fully Picked'],
    default: 'Pending Pickup',
  },
}, { timestamps: true });

module.exports = mongoose.model('EventInventory', eventInventorySchema);
