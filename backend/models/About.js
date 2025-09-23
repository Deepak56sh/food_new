const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    // Banner Section
    bannerTitle: { type: String, required: true, default: "Welcome to Our Restaurant" },
    bannerDescription: { type: String, required: true, default: "Serving delicious food with love since 1990" },
    bannerBg: { type: String }, // single banner image

    // Story Section
    storyTitle: { type: String, required: true, default: "Our Story" },
    storyImages: [{ type: String }], // multiple story images
    paragraph1: { type: String, default: "Our journey began with a passion for authentic flavors..." },
    paragraph2: { type: String, default: "Over the years, we have perfected our recipes..." },
    paragraph3: { type: String, default: "Today, we continue to serve our community with the same dedication..." },
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", aboutSchema);