
// routes/gallery.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all gallery items for admin
router.get('/admin', auth, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create gallery item
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    
    const galleryItem = new Gallery({
      title,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      category,
      price: price ? parseFloat(price) : undefined
    });

    await galleryItem.save();
    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update gallery item
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, isActive } = req.body;
    const updateData = { title, description, category, isActive };
    
    if (price) updateData.price = parseFloat(price);
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const galleryItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete gallery item
router.delete('/:id', auth, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

