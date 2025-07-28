const mongoose = require("mongoose");

const GroupMediaCommentSchema = new mongoose.Schema({
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupMedia",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GroupMediaComment", GroupMediaCommentSchema);
