const express = require("express");
const History = require("../models/History");
const router = express.Router();

// add new history
router.post("/", async (req, res) => {
  try {
    const { actionType, description, data, user } = req.body;

    const history = new History({
      actionType,
      description,
      data,
      user,
    });

    await history.save();

    res.status(201).json({ message: "History saved", history });
  } catch (error) {
    console.error("Add history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// get all history
router.get("/", async (req, res) => {
  try {
    const histories = await History.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(histories);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
