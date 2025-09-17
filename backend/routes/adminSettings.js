// const express = require("express");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User");
// const auth = require("../middleware/auth");
// const router = express.Router();

// router.put("/update", auth, async (req, res) => {
//   try {
//     const { oldPassword, newEmail, newPassword } = req.body;

//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access forbidden: Admins only" });
//     }

//     // ✅ Check old password
//     const isMatch = await bcrypt.compare(oldPassword, req.user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Old password is incorrect" });
//     }

//     // ✅ Update email
//     if (newEmail) {
//       req.user.email = newEmail;
//     }

//     // ✅ Update password
//     if (newPassword) {
//       const salt = await bcrypt.genSalt(10);
//       req.user.password = await bcrypt.hash(newPassword, salt);
//     }

//     await req.user.save();

//     res.json({
//       message: "Admin updated successfully",
//       user: {
//         id: req.user._id,
//         email: req.user.email,
//         role: req.user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Admin update error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// console.log("✅ Admin routes loaded");


// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { addHistory } = require("../middleware/historyLogger"); // ✅ import
const router = express.Router();

router.put("/update", auth, async (req, res) => {
  try {
    const { oldPassword, newEmail, newPassword } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden: Admins only" });
    }

    // ✅ Check old password
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    let changes = [];

    // ✅ Update email
    if (newEmail) {
      changes.push(`Email updated (${req.user.email} → ${newEmail})`);
      req.user.email = newEmail;
    }

    // ✅ Update password
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      req.user.password = await bcrypt.hash(newPassword, salt);
      changes.push("Password updated");
    }

    await req.user.save();

    // ✅ Log history
    await addHistory(
      "UPDATE_ADMIN_SETTINGS",
      `⚙️ Admin "${req.user.email}" updated settings: ${changes.join(", ")}`,
      null,
      req.user._id,
      req.ip
    );

    res.json({
      message: "Admin updated successfully",
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Admin update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

console.log("✅ Admin routes loaded");

module.exports = router;
