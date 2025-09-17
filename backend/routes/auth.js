// // routes/auth.js
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const User = require("../models/User"); // tumhara User schema
// const router = express.Router();

// // =================== REGISTER ===================
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     // check if user already exists
//     let existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // create new user
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: role || "user",
//     });

//     await newUser.save();

//     // create JWT
//     const token = jwt.sign(
//       { userId: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET || "your-secret-key",
//       { expiresIn: "7d" }
//     );

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         role: newUser.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Register error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // =================== LOGIN ===================
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // create token
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || "your-secret-key",
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Login successful",
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // tumhara User schema
const { historyMiddleware, addHistory } = require("../middleware/historyLogger");
const router = express.Router();

// =================== REGISTER ===================
router.post("/register", 
  historyMiddleware("USER_REGISTER", (req, data) => `New user registered: ${req.body.name} (${req.body.email}) - Role: ${req.body.role || 'user'}`),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // check if user already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "user",
      });

      await newUser.save();

      // create JWT
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// =================== LOGIN ===================
router.post("/login",
  historyMiddleware("USER_LOGIN", (req, data) => {
    const loginStatus = res.statusCode < 400 ? "successful" : "failed";
    return `User login ${loginStatus}: ${req.body.email}`;
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // create token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;