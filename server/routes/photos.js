const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const auth = require("../middleware/auth");
const Photo = require("../models/Photo");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventscapes",
    format: async (req, file) => "jpg",
    public_id: (req, file) => "photo-" + Date.now(),
  },
});
const upload = multer({ storage: storage });

// POST /api/photos/upload/:eventId - Upload a photo (Private)
router.post(
  "/upload/:eventId",
  [auth, upload.single("image")],
  async (req, res) => {
    try {
      const newPhoto = new Photo({
        event: req.params.eventId,
        user: req.user.id,
        imageUrl: req.file.path,
        caption: req.body.caption,
      });

      let photo = await newPhoto.save();
      // Find the photo again to populate the user info
      photo = await Photo.findById(photo._id).populate("user", "name");

      res.json(photo); // Now it sends the user's name with the response
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// GET /api/photos/event/:eventId - Get all photos for an event (Public)
router.get("/event/:eventId", async (req, res) => {
  try {
    const photos = await Photo.find({ event: req.params.eventId })
      .populate("user", "name") // Added .populate() to include the user's name
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/photos/:id - Delete a photo (Private)
// --- Complete implementation for the delete route ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ msg: "Photo not found" });
    }

    // Check if the user owns the photo
    if (photo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Delete image from Cloudinary
    const publicId = photo.imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`eventscapes/${publicId}`);

    // Delete photo from database
    await Photo.findByIdAndDelete(req.params.id);

    res.json({ msg: "Photo removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// --- ADD THIS NEW ROUTE ---
// @route   GET /api/photos/user/me
// @desc    Get all photos uploaded by the current user
// @access  Private
router.get("/user/me", auth, async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(photos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
