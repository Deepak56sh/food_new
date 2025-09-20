const express = require('express');
const multer = require('multer');
const path = require('path');
const About = require('../models/About'); // apna About model
const auth = require('../middleware/auth');
const { addHistory } = require("../middleware/historyLogger"); 

const router = express.Router();

// ------- Multer Setup --------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // jaha images save hongi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ✅ Get About Data (public)
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne(); // ek hi record rakhenge
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create / Update About Page (with banner image upload)
router.post('/', auth, upload.single('bannerBg'), async (req, res) => {
  try {
    const { bannerTitle, bannerDescription, title, paragraph1, paragraph2, paragraph3, image } = req.body;

    let updateData = {
      bannerTitle,
      bannerDescription,
      title,
      paragraph1,
      paragraph2,
      paragraph3,
      image
    };

    // Agar banner image upload ki hai
    if (req.file) {
      updateData.bannerBg = `/uploads/${req.file.filename}`;
    }

    let about = await About.findOne();
    if (about) {
      about = await About.findByIdAndUpdate(about._id, updateData, { new: true });
    } else {
      about = new About(updateData);
      await about.save();
    }

    await addHistory(
      "UPSERT_ABOUT",
      `📄 About page updated`,
      { aboutId: about._id, updates: updateData },
      req.user._id,
      req.ip
    );

    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
