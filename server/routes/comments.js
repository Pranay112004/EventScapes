const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");
const Photo = require("../models/Photo");

// @route   POST /api/comments/photo/:photoId
// @desc    Add a comment to a photo
// @access  Private
router.post("/photo/:photoId", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) {
      return res.status(404).json({ msg: "Photo not found" });
    }

    const newComment = new Comment({
      text: req.body.text,
      user: req.user.id,
      photo: req.params.photoId,
    });

    const comment = await newComment.save();

    await comment.populate("user", "name avatarUrl");

    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET /api/comments/photo/:photoId
// @desc    Get all comments for a photo
// @access  Public
router.get("/photo/:photoId", async (req, res) => {
  try {
    const comments = await Comment.find({ photo: req.params.photoId })
      .populate("user", "name avatarUrl")
      .sort({ createdAt: "asc" });
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
