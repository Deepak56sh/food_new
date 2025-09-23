const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const About = require('../models/About'); // apna About model
const auth = require('../middleware/auth');
const { addHistory } = require("../middleware/historyLogger"); 

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ------- Multer Setup (IMPROVED) --------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Better filename with field name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ File validation - IMPORTANT!
const fileFilter = (req, file, cb) => {
  // Only allow image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// ✅ Helper function to delete old files
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(path.join(__dirname, '../', filePath))) {
    try {
      fs.unlinkSync(path.join(__dirname, '../', filePath));
      console.log('Deleted old file:', filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
};

// ✅ Get About Data (public) - IMPROVED
router.get('/', async (req, res) => {
  try {
    let about = await About.findOne();
    
    // ✅ Create default data if none exists
    if (!about) {
      about = new About({
        bannerTitle: "Welcome to Our Restaurant",
        bannerDescription: "Serving delicious food with love since 1990",
        storyTitle: "Our Story",
        paragraph1: "Our journey began with a passion for authentic flavors and a dream to create memorable dining experiences.",
        paragraph2: "Over the years, we have perfected our recipes, sourced the finest ingredients, and built a team of dedicated professionals.",
        paragraph3: "Today, we continue to serve our community with the same dedication, bringing you the finest cuisine in a warm, welcoming atmosphere."
      });
      await about.save();
    }
    
    res.json(about);
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Create/Update About Page - MUCH IMPROVED
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

      // ✅ Validation
      if (!bannerTitle || !bannerDescription || !storyTitle) {
        return res.status(400).json({ 
          message: 'Banner title, banner description, and story title are required' 
        });
      }

      let updateData = {
        bannerTitle: bannerTitle.trim(),
        bannerDescription: bannerDescription.trim(),
        storyTitle: storyTitle.trim(),
        paragraph1: paragraph1?.trim() || '',
        paragraph2: paragraph2?.trim() || '',
        paragraph3: paragraph3?.trim() || ''
      };

      // Find existing about data
      let about = await About.findOne();

      // ✅ Handle banner image with old file deletion
      if (req.files && req.files['bannerBg'] && req.files['bannerBg'][0]) {
        // Delete old banner image if exists
        if (about && about.bannerBg) {
          deleteFile(about.bannerBg);
        }
        updateData.bannerBg = `/uploads/${req.files['bannerBg'][0].filename}`;
      }

      // ✅ Handle story images with old files deletion
      if (req.files && req.files['storyImages'] && req.files['storyImages'].length > 0) {
        // Delete old story images if exists
        if (about && about.storyImages && about.storyImages.length > 0) {
          about.storyImages.forEach(imagePath => {
            deleteFile(imagePath);
          });
        }
        updateData.storyImages = req.files['storyImages'].map(file => `/uploads/${file.filename}`);
      }

      // Update or create about data
      if (about) {
        // Update existing record - better way
        Object.keys(updateData).forEach(key => {
          about[key] = updateData[key];
        });
        await about.save();
      } else {
        // Create new record
        about = new About(updateData);
        await about.save();
      }

      // ✅ History log with better data
      try {
        await addHistory(
          "UPSERT_ABOUT",
          `📄 About page updated: ${bannerTitle}`,
          { 
            aboutId: about._id, 
            bannerTitle,
            storyTitle,
            filesUploaded: {
              bannerImage: !!req.files['bannerBg'],
              storyImagesCount: req.files['storyImages']?.length || 0
            }
          },
          req.user._id,
          req.ip
        );
      } catch (historyError) {
        console.error('History logging failed:', historyError);
        // Don't fail the request if history logging fails
      }

      res.json(about);
    } catch (error) {
      console.error('Error updating about page:', error);
      
      // ✅ Clean up uploaded files if operation failed
      if (req.files) {
        if (req.files['bannerBg']) {
          req.files['bannerBg'].forEach(file => {
            deleteFile(`/uploads/${file.filename}`);
          });
        }
        if (req.files['storyImages']) {
          req.files['storyImages'].forEach(file => {
            deleteFile(`/uploads/${file.filename}`);
          });
        }
      }
      
      res.status(500).json({ 
        message: 'Server error while updating about page', 
        error: error.message 
      });
    }
  }
);

// ✅ BONUS: Delete About Page route (optional)
router.delete('/', auth, async (req, res) => {
  try {
    const about = await About.findOne();
    
    if (!about) {
      return res.status(404).json({ message: 'About page not found' });
    }

    // Delete associated files
    if (about.bannerBg) {
      deleteFile(about.bannerBg);
    }
    if (about.storyImages && about.storyImages.length > 0) {
      about.storyImages.forEach(imagePath => {
        deleteFile(imagePath);
      });
    }

    await About.findByIdAndDelete(about._id);

    // Add to history log
    try {
      await addHistory(
        "DELETE_ABOUT",
        `🗑️ About page deleted`,
        { deletedAboutId: about._id },
        req.user._id,
        req.ip
      );
    } catch (historyError) {
      console.error('History logging failed:', historyError);
    }

    res.json({ message: 'About page deleted successfully' });
  } catch (error) {
    console.error('Error deleting about page:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;