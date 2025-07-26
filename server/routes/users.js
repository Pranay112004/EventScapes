const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventscapes_avatars",
    public_id: (req, file) => "avatar-" + req.user.id,
  },
});
const upload = multer({ storage: storage });

router.post("/register", async (req, res) => {
  // ... your register code
});

router.post("/login", async (req, res) => {
  // ... your login code
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/me", auth, async (req, res) => {
  // ... your update name code
});

router.post("/avatar", [auth, upload.single("avatar")], async (req, res) => {
  // ... your update avatar code
});

module.exports = router;
