// routes/history.js
const express = require('express');
const History = require('../models/History');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all history records (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find()
      .populate('user', 'name email') 
      .sort({ createdAt: -1 }) 
      .limit(500); // Latest 500 records
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// Get recent activity (last 50 records)
router.get('/recent', auth, async (req, res) => {
  try {
    const history = await History.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching recent history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get history by date range
router.get('/date-range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
    }
    
    const history = await History.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history by date:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;