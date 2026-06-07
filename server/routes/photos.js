const express    = require('express');
const router     = express.Router();
const multer     = require('multer');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const EventPhoto = require('../models/EventPhoto');
const Event      = require('../models/Event');

// ── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — upload buffer directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Images only'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload buffer to Cloudinary
function uploadToCloudinary(buffer, folder, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `mk-events/${folder}`,
        public_id: filename,
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ],
      },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

// ── GET photos for an event ────────────────────────────────────────────────
router.get('/:event_id', async (req, res) => {
  try {
    const photos = await EventPhoto.find({ event_id: req.params.event_id })
      .sort({ createdAt: -1 });
    const mapped = photos.map(p => ({
      ...p.toObject(),
      id: p._id,
      url: p.cloudinary_url || p.url || `${req.protocol}://${req.get('host')}/uploads/${p.filename}`,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST upload photos ─────────────────────────────────────────────────────
router.post('/:event_id', upload.array('photos', 10), async (req, res) => {
  try {
    const { event_id } = req.params;
    const { photo_type = 'reference' } = req.body;

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: 'No files uploaded' });

    const useCloudinary = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    const saved = await Promise.all(req.files.map(async file => {
      let cloudinary_url = null;
      let filename = `${uuidv4()}`;

      if (useCloudinary) {
        const result = await uploadToCloudinary(file.buffer, event_id, filename);
        cloudinary_url = result.secure_url;
        filename = result.public_id;
      }

      return EventPhoto.create({
        event_id,
        filename,
        original_name:  file.originalname,
        photo_type,
        cloudinary_url,
        url: cloudinary_url || `/uploads/${filename}`,
        size:     file.size,
        mimetype: file.mimetype,
      });
    }));

    const mapped = saved.map(p => ({
      ...p.toObject(),
      id:  p._id,
      url: p.cloudinary_url || `${req.protocol}://${req.get('host')}/uploads/${p.filename}`,
    }));

    // Save first photo URL to event for fast card loading
    const firstUrl = mapped[0].url;
    await Event.findByIdAndUpdate(event_id, { cover_photo_url: firstUrl }).catch(() => {});

    res.status(201).json(mapped);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE a photo ─────────────────────────────────────────────────────────
router.delete('/:photo_id', async (req, res) => {
  try {
    const photo = await EventPhoto.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ error: 'Photo not found' });

    // Delete from Cloudinary if stored there
    if (photo.cloudinary_url && photo.filename) {
      await cloudinary.uploader.destroy(photo.filename).catch(() => {});
    }

    await EventPhoto.findByIdAndDelete(req.params.photo_id);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
