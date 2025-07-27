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

// Configure Multer with media type detection
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Check file type to determine resource_type and folder
    const isVideo = file.mimetype.startsWith("video");
    return {
      folder: "eventscapes",
      resource_type: isVideo ? "video" : "image",
      public_id: (isVideo ? "video-" : "photo-") + Date.now(),
    };
  },
});
const upload = multer({ storage: storage });
router.post(
  "/upload/:eventId",
  [auth, upload.single("image")],
  async (req, res) => {
    try {
      const isVideo = req.file.mimetype.startsWith("video");
      const newPhoto = new Photo({
        event: req.params.eventId,
        user: req.user.id,
        imageUrl: req.file.path,
        caption: req.body.caption,
        mediaType: isVideo ? "video" : "image",
      });
      let photo = await newPhoto.save();
      photo = await Photo.findById(photo._id).populate(
        "user",
        "name avatarUrl"
      );
      res.json(photo);
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
      .populate("user", "name avatarUrl")
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/photos/:id - Delete a photo (Private)
router.delete("/:id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ msg: "Media not found" });
    }

    // Check if the user owns the photo
    if (photo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Delete media from Cloudinary
    const publicId = photo.imageUrl.split("/").pop().split(".")[0];
    const resourceType = photo.mediaType === "video" ? "video" : "image";
    await cloudinary.uploader.destroy(`eventscapes/${publicId}`, {
      resource_type: resourceType,
    });

    // Delete photo from database
    await Photo.findByIdAndDelete(req.params.id);

    res.json({ msg: "Media removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(photos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/photos/user/me - Get all photos uploaded by the current user
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
