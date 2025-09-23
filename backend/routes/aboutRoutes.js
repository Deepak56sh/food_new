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
    cb(null, 'uploads/'); // images yaha save hongi
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create / Update About Page (banner + multiple story images)
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'bannerBg', maxCount: 1 },      // banner ke liye ek image
    { name: 'storyImages', maxCount: 10 }   // story ke liye multiple images
  ]),
  async (req, res) => {
    try {
      const { bannerTitle, bannerDescription, storyTitle, paragraph1, paragraph2, paragraph3 } = req.body;

      let updateData = {
        bannerTitle,
        bannerDescription,
        storyTitle,
        paragraph1,
        paragraph2,
        paragraph3
      };

      // ✅ Banner image
      if (req.files['bannerBg']) {
        updateData.bannerBg = `/uploads/${req.files['bannerBg'][0].filename}`;
      }

      // ✅ Story images (multiple)
      if (req.files['storyImages']) {
        updateData.storyImages = req.files['storyImages'].map(file => `/uploads/${file.filename}`);
      }

      let about = await About.findOne();
      if (about) {
        about = await About.findByIdAndUpdate(about._id, updateData, { new: true });
      } else {
        about = new About(updateData);
        await about.save();
      }

      // ✅ History log
      await addHistory(
        "UPSERT_ABOUT",
        `📄 About page updated`,
        { aboutId: about._id, updates: updateData },
        req.user._id,
        req.ip
      );

      res.json(about);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
