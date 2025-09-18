const express = require('express');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const { addHistory } = require("../middleware/historyLogger"); 
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

// ------------------- ROUTES -------------------

// ✅ Public fetch (no history)
router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin fetch (no history)
router.get('/admin', auth, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create gallery item (logs history)
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

    await addHistory(
      "CREATE_GALLERY",
      `🖼️ Gallery item created: ${title}`,
      { galleryId: galleryItem._id, title },
      req.user._id,
      req.ip
    );

    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update gallery item (logs history)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, price, isActive } = req.body;
    const updateData = { title, description, category, isActive };
    
    if (price) updateData.price = parseFloat(price);
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const galleryItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (galleryItem) {
      await addHistory(
        "UPDATE_GALLERY",
        `✏️ Gallery item updated: ${galleryItem.title}`,
        { galleryId: galleryItem._id, updates: updateData },
        req.user._id,
        req.ip
      );
    }

    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete gallery item (logs history)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);

    if (deleted) {
      await addHistory(
        "DELETE_GALLERY",
        `🗑️ Gallery item deleted: ${deleted.title}`,
        { galleryId: deleted._id },
        req.user._id,
        req.ip
      );
    }

    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
