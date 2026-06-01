const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Balloons','Backdrops','Flower Decorations','Welcome Boards','Chairs','Tables','Lights','Sound System','Custom Items'],
  },
  quantity_available: { type: Number, required: true, default: 0 },
  quantity_used:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
