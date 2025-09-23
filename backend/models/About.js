const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  bannerTitle: { type: String, required: true },
  bannerDescription: { type: String, required: true },
  bannerBg: { type: String }, // banner bg image
  title: { type: String, required: true },
  image: { type: String }, // optional single story image
  images: [{ type: String }], // ✅ multiple story images
  paragraph1: { type: String },
  paragraph2: { type: String },
  paragraph3: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("About", aboutSchema);
