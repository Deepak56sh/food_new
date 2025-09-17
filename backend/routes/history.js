// routes/history.js
const express = require("express");
const History = require("../models/History");
const auth = require("../middleware/auth");
const router = express.Router();

// Helper: format date
function formatDate(date) {
  return new Date(date).toLocaleString("en-GB", { // dd/mm/yyyy, hh:mm:ss
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get all history records (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const history = await History.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(500);

    const formatted = history.map((h) => ({
      message: h.description,
      user: h.user ? h.user.name : "System",
      date: formatDate(h.createdAt),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Server error fetching history" });
  }
});

// Recent history
router.get("/recent", auth, async (req, res) => {
  try {
    const history = await History.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    const formatted = history.map((h) => ({
      message: h.description,
      user: h.user ? h.user.name : "System",
      date: formatDate(h.createdAt),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching recent history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// History by date range
router.get("/date-range", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const history = await History.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(200);

    const formatted = history.map((h) => ({
      message: h.description,
      user: h.user ? h.user.name : "System",
      date: formatDate(h.createdAt),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching history by date:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/', auth, async (req, res) => {
  const { actionType, description } = req.body;
  const history = new History({
    actionType,
    description,
    user: req.user ? req.user.id : null,
    data: { manual: true },
    ipAddress: req.ip,
  });
  await history.save();
  res.status(201).json({ message: 'History entry created', history });
});


module.exports = router;
