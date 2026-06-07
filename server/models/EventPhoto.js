const mongoose = require('mongoose');

const eventPhotoSchema = new mongoose.Schema({
  event_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  filename:      { type: String, required: true },
  original_name: { type: String },
  photo_type:    { type: String, enum: ['reference', 'completed'], required: true },
  url:           { type: String, required: true },
  cloudinary_url:{ type: String }, // CDN URL — fast global delivery
  size:          { type: Number },
  mimetype:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('EventPhoto', eventPhotoSchema);
