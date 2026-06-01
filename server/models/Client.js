const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  mobile:          { type: String, required: true, trim: true },
  alternate_mobile:{ type: String, trim: true },
  address:         { type: String, required: true },
  google_map_link: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
