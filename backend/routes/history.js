// routes/history.js
const express = require('express');
const History = require('../models/History');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all history records (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find()
      .populate('user', 'name email') // Populate user details
      .sort({ createdAt: -1 }) // Latest first
      .limit(1000); // Limit to prevent huge responses
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// Get history by action type (admin only)
router.get('/type/:actionType', auth, async (req, res) => {
  try {
    const { actionType } = req.params;
    const history = await History.find({ actionType })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching history by type:', error);
    res.status(500).json({ message: 'Server error fetching history' });
  }
});

// Get history stats (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await History.aggregate([
      {
        $group: {
          _id: '$actionType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalRecords = await History.countDocuments();
    
    res.json({
      totalRecords,
      actionStats: stats
    });
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Clear old history (admin only) - Optional
router.delete('/clear-old', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await History.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    res.json({
      message: `Deleted ${result.deletedCount} old history records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing old history:', error);
    res.status(500).json({ message: 'Server error clearing history' });
  }
});

module.exports = router;