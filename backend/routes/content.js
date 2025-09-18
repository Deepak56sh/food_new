const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const { addHistory } = require("../middleware/historyLogger"); // ✅ import
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });

// ------------------- ROUTES -------------------

// ✅ Public content fetch (no history log)
router.get('/', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create content (admin only, logs history)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const content = new Content({
      title,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      category
    });

    await content.save();

    // History log
    await addHistory(
      "CREATE_CONTENT",
      `📝 New content created: ${title}`,
      { contentId: content._id, title },
      req.user._id,
      req.ip
    );

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update content (logs history)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body;
    const updateData = { title, description, category, isActive };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (content) {
      await addHistory(
        "UPDATE_CONTENT",
        `✏️ Content updated: ${content.title}`,
        { contentId: content._id, updates: updateData },
        req.user._id,
        req.ip
      );
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Delete content (logs history)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Content.findByIdAndDelete(req.params.id);

    if (deleted) {
      await addHistory(
        "DELETE_CONTENT",
        `🗑️ Content deleted: ${deleted.title}`,
        { contentId: deleted._id },
        req.user._id,
        req.ip
      );
    }

    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
