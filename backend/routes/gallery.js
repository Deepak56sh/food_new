
// // routes/gallery.js
// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Gallery = require('../models/Gallery');
// const auth = require('../middleware/auth');
// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });

// // Get all gallery items
// router.get('/', async (req, res) => {
//   try {
//     const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
//     res.json(gallery);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get all gallery items for admin
// router.get('/admin', auth, async (req, res) => {
//   try {
//     const gallery = await Gallery.find().sort({ createdAt: -1 });
//     res.json(gallery);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create gallery item
// router.post('/', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, category, price } = req.body;
    
//     const galleryItem = new Gallery({
//       title,
//       description,
//       image: req.file ? `/uploads/${req.file.filename}` : '',
//       category,
//       price: price ? parseFloat(price) : undefined
//     });

//     await galleryItem.save();
//     res.json(galleryItem);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update gallery item
// router.put('/:id', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, category, price, isActive } = req.body;
//     const updateData = { title, description, category, isActive };
    
//     if (price) updateData.price = parseFloat(price);
//     if (req.file) updateData.image = `/uploads/${req.file.filename}`;

//     const galleryItem = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     res.json(galleryItem);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete gallery item
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     await Gallery.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Gallery item deleted' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

// routes/gallery.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const { historyMiddleware, addHistory } = require("../middleware/historyLogger");
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
router.get('/', 
  historyMiddleware("VIEW_GALLERY", "Gallery list viewed (public)"),
  async (req, res) => {
    try {
      const gallery = await Gallery.find({ isActive: true }).sort({ createdAt: -1 });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get all gallery items for admin
router.get('/admin', 
  auth, 
  historyMiddleware("VIEW_GALLERY_ADMIN", "Gallery admin list viewed"),
  async (req, res) => {
    try {
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Create gallery item
router.post('/', 
  auth, 
  upload.single('image'), 
  historyMiddleware("CREATE_GALLERY", (req, data) => `New gallery item created: "${req.body.title}" in category "${req.body.category}"${req.body.price ? ` with price $${req.body.price}` : ''}`),
  async (req, res) => {
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
  }
);

// Update gallery item
router.put('/:id', 
  auth, 
  upload.single('image'), 
  historyMiddleware("UPDATE_GALLERY", (req, data) => {
    const changes = [];
    if (req.body.title) changes.push(`title: "${req.body.title}"`);
    if (req.body.category) changes.push(`category: "${req.body.category}"`);
    if (req.body.price) changes.push(`price: $${req.body.price}`);
    if (req.file) changes.push("image updated");
    if (req.body.isActive !== undefined) changes.push(`status: ${req.body.isActive ? 'active' : 'inactive'}`);
    return `Gallery item updated (${changes.join(", ")}) - ID: ${req.params.id}`;
  }),
  async (req, res) => {
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
  }
);

// Delete gallery item
router.delete('/:id', 
  auth, 
  historyMiddleware("DELETE_GALLERY", (req, data) => {
    return new Promise(async (resolve) => {
      try {
        const galleryItem = await Gallery.findById(req.params.id);
        resolve(`Gallery item deleted: "${galleryItem?.title || 'Unknown'}" from category "${galleryItem?.category || 'Unknown'}"${galleryItem?.price ? ` (price: $${galleryItem.price})` : ''}`);
      } catch (err) {
        resolve(`Gallery item deleted (ID: ${req.params.id})`);
      }
    });
  }),
  async (req, res) => {
    try {
      await Gallery.findByIdAndDelete(req.params.id);
      res.json({ message: 'Gallery item deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;