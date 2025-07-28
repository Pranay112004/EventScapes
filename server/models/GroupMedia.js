const mongoose = require("mongoose");

const GroupMediaSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    trim: true,
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GroupMedia", GroupMediaSchema);
