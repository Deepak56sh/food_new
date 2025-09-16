const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


const adminSettingsRoutes = require("./routes/adminSettings");
const historyRoutes = require("./routes/history");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));
const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------- DATABASE -----------------
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/food-website", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const db = mongoose.connection;

// ----------------- ROUTES -----------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/content", require("./routes/content"));
app.use("/api/gallery", require("./routes/gallery"));
app.use("/api/contact", require("./routes/contact")); // 👈 contact route from earlier
app.use("/api/admin", adminSettingsRoutes);
app.use("/api/history", historyRoutes);
// After MongoDB connection
// ----------------- DEFAULT ADMIN -----------------
const createDefaultAdmin = async () => {
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");

  try {
    const adminExists = await User.findOne({ email: "admin@food.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new User({
        name: "Admin",
        email: "admin@food.com",
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("👑 Default admin created: admin@food.com / admin123");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

// Run after DB is open
db.once("open", createDefaultAdmin);

// ----------------- SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
