const express = require("express");
const History = require("../models/History");
const auth = require("../middleware/auth");
const router = express.Router();

// Helper: format date
function formatDate(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ✅ Sirf admin actions list
const adminActions = [
  "USER_REGISTER",
  "USER_LOGIN",
  "CREATE_CONTENT",
  "UPDATE_CONTENT",
  "DELETE_CONTENT",
  "CREATE_GALLERY",
  "UPDATE_GALLERY",
  "DELETE_GALLERY",
  "UPDATE_ADMIN_SETTINGS",
];

// ---------------- ROUTES ----------------

// Get all history (admin only)
router.get("/", auth, async (req, res) => {
  try {
    const history = await History.find({ actionType: { $in: adminActions } })
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

// Recent admin history
router.get("/recent", auth, async (req, res) => {
  try {
    const history = await History.find({ actionType: { $in: adminActions } })
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

// Admin history by date range
router.get("/date-range", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { actionType: { $in: adminActions } };
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

// ✅ Manual admin log entry (optional)
router.post("/", auth, async (req, res) => {
  try {
    const { actionType, description } = req.body;

    // sirf allowed actions hi accept kare
    if (!adminActions.includes(actionType)) {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const history = new History({
      actionType,
      description,
      user: req.user ? req.user.id : null,
      data: { manual: true },
      ipAddress: req.ip,
    });

    await history.save();
    res.status(201).json({ message: "History entry created", history });
  } catch (error) {
    console.error("Error creating history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
