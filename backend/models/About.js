const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    // Banner Section
    bannerTitle: { type: String, required: true },
    bannerDescription: { type: String, required: true },
    bannerBg: { type: String }, // single banner image

    // Story Section
    storyTitle: { type: String, required: true },
    storyImages: [{ type: String }], // multiple story images
    paragraph1: { type: String },
    paragraph2: { type: String },
    paragraph3: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);
