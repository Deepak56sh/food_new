// // routes/content.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Content = require('../models/Content');
// const auth = require('../middleware/auth');
// const router = express.Router();

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });

// // Get all content
// router.get('/', async (req, res) => {
//   try {
//     const content = await Content.find().sort({ createdAt: -1 });
//     res.json(content);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create content (admin only)
// router.post('/', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, category } = req.body;
    
//     const content = new Content({
//       title,
//       description,
//       image: req.file ? `/uploads/${req.file.filename}` : '',
//       category
//     });

//     await content.save();
//     res.json(content);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update content
// router.put('/:id', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, category, isActive } = req.body;
//     const updateData = { title, description, category, isActive };
    
//     if (req.file) {
//       updateData.image = `/uploads/${req.file.filename}`;
//     }

//     const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     res.json(content);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete content
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     await Content.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Content deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// module.exports = router;

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
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ------------------- ROUTES -------------------

// Get all content
router.get('/', async (req, res) => {
  try {
    const content = await Content.find().sort({ createdAt: -1 });

    // ✅ Log history (public view)
    await addHistory(
      "VIEW_CONTENT",
      "👀 Content list viewed",
      null,
      req.user ? req.user._id : null,
      req.ip
    );

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create content (admin only)
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

    // ✅ Log history
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

// Update content
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, isActive } = req.body;
    const updateData = { title, description, category, isActive };
    
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // ✅ Log history
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

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Content.findByIdAndDelete(req.params.id);

    // ✅ Log history
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
