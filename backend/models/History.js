const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true, // e.g. "ADD_POST", "UPDATE_USER", "DELETE_ITEM"
    },
    description: {
      type: String,
    },
    data: {
      type: Object, // jo bhi data tu store karna chahe (JSON form me)
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // isse createdAt aur updatedAt dono mil jaayenge
  }
);

module.exports = mongoose.model("History", historySchema);
