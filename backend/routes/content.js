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

// routes/content.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const { historyMiddleware, addHistory } = require("../middleware/historyLogger");
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

// Get all content
router.get('/', 
  historyMiddleware("VIEW_CONTENT", "Content list viewed"),
  async (req, res) => {
    try {
      const content = await Content.find().sort({ createdAt: -1 });
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Create content (admin only)
router.post('/', 
  auth, 
  upload.single('image'), 
  historyMiddleware("CREATE_CONTENT", (req, data) => `New content created: "${req.body.title}" in category "${req.body.category}"`),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      
      const content = new Content({
        title,
        description,
        image: req.file ? `/uploads/${req.file.filename}` : '',
        category
      });

      await content.save();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update content
router.put('/:id', 
  auth, 
  upload.single('image'), 
  historyMiddleware("UPDATE_CONTENT", (req, data) => {
    const changes = [];
    if (req.body.title) changes.push(`title: "${req.body.title}"`);
    if (req.body.category) changes.push(`category: "${req.body.category}"`);
    if (req.file) changes.push("image updated");
    if (req.body.isActive !== undefined) changes.push(`status: ${req.body.isActive ? 'active' : 'inactive'}`);
    return `Content updated (${changes.join(", ")}) - ID: ${req.params.id}`;
  }),
  async (req, res) => {
    try {
      const { title, description, category, isActive } = req.body;
      const updateData = { title, description, category, isActive };
      
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete content
router.delete('/:id', 
  auth, 
  historyMiddleware("DELETE_CONTENT", (req, data) => {
    return new Promise(async (resolve) => {
      try {
        const content = await Content.findById(req.params.id);
        resolve(`Content deleted: "${content?.title || 'Unknown'}" from category "${content?.category || 'Unknown'}"`);
      } catch (err) {
        resolve(`Content deleted (ID: ${req.params.id})`);
      }
    });
  }),
  async (req, res) => {
    try {
      await Content.findByIdAndDelete(req.params.id);
      res.json({ message: 'Content deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;