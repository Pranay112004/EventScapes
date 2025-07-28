const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const GroupMedia = require("../models/GroupMedia");
const GroupMediaComment = require("../models/GroupMediaComment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "group-media",
    allowed_formats: ["jpg", "png", "jpeg", "gif", "mp4", "mov", "avi"],
    resource_type: "auto", // Automatically detect file type
  },
});

const upload = multer({ storage: storage });

// @route GET /api/groups
// @desc Get all groups (public groups + user's private groups)
// @access Public/Private
router.get("/", async (req, res) => {
  try {
    let token = req.header("x-auth-token");
    
    // If no x-auth-token, try Authorization header with Bearer format
    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.replace("Bearer ", "");
      }
    }
    
    let userId = null;
    
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (err) {
        // Token invalid, continue as public user
      }
    }

    let query = { isPrivate: false };
    
    // If user is logged in, also include their private groups
    if (userId) {
      query = {
        $or: [
          { isPrivate: false },
          { admin: userId },
          { "members.user": userId }
        ]
      };
    }

    const groups = await Group.find(query)
      .populate("admin", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/groups
// @desc Create a new group
// @access Private
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = new Group({
      name,
      description,
      admin: req.user.id,
      isPrivate: isPrivate || false,
      members: [{ user: req.user.id }] // Admin is also a member
    });

    await group.save();
    
    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/groups/:id
// @desc Get group by ID
// @access Public (for public groups) / Private (for private groups)
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("admin", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user has access to private group
    if (group.isPrivate) {
      let token = req.header("x-auth-token");
      
      // If no x-auth-token, try Authorization header with Bearer format
      if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "");
        }
      }
      
      if (!token) {
        return res.status(401).json({ message: "Access denied" });
      }

      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        
        const isMember = group.members.some(member => 
          member.user._id.toString() === userId
        );
        
        if (!isMember && group.admin._id.toString() !== userId) {
          return res.status(403).json({ message: "Access denied to private group" });
        }
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/groups/:id/members
// @desc Add member to group by username
// @access Private (Admin only)
router.post("/:id/members", auth, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only group admin can add members" });
    }

    // Find user by name (treating it as username)
    const user = await User.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => 
      member.user.toString() === user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push({ user: user._id });
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl");

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/groups/:id/members/:userId
// @desc Remove member from group
// @access Private (Admin only)
router.delete("/:id/members/:userId", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only group admin can remove members" });
    }

    // Remove member
    group.members = group.members.filter(member => 
      member.user.toString() !== req.params.userId
    );

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl");

    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/groups/:id/media
// @desc Upload media to group (single or multiple files)
// @access Private (Members only)
router.post("/:id/media", auth, upload.array("media", 20), async (req, res) => {
  try {
    console.log("🔍 Upload request received:");
    console.log("  - Group ID:", req.params.id);
    console.log("  - User ID:", req.user.id);
    console.log("  - Files count:", req.files ? req.files.length : 0);
    console.log("  - Raw captions:", req.body.captions);
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      console.log("❌ Group not found:", req.params.id);
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );
    console.log("👥 Is member check:", isMember, "| Is admin:", group.admin.toString() === req.user.id);

    if (!isMember && group.admin.toString() !== req.user.id) {
      console.log("❌ Access denied - not member or admin");
      return res.status(403).json({ message: "Only group members can upload media" });
    }

    if (!req.files || req.files.length === 0) {
      console.log("❌ No files received in request");
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (req.files.length > 20) {
      console.log("❌ Too many files:", req.files.length);
      return res.status(400).json({ message: "Maximum 20 files allowed per upload" });
    }

    console.log("📁 Processing", req.files.length, "files:");
    req.files.forEach((file, i) => {
      console.log(`  File ${i + 1}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    });

    // Process each file
    const uploadedMedia = [];
    const captions = req.body.captions ? JSON.parse(req.body.captions) : {};
    console.log("📝 Parsed captions:", captions);

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
      const caption = captions[i] || "";

      const groupMedia = new GroupMedia({
        group: req.params.id,
        user: req.user.id,
        mediaUrl: file.path,
        caption: caption,
        mediaType: mediaType,
      });

      await groupMedia.save();

      const populatedMedia = await GroupMedia.findById(groupMedia._id)
        .populate("user", "name email avatarUrl");
      
      uploadedMedia.push(populatedMedia);
    }

    res.status(201).json({
      message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
      media: uploadedMedia
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/groups/:id/media
// @desc Get all media from a group
// @access Public (for public groups) / Private (for private groups)
router.get("/:id/media", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check access for private groups
    if (group.isPrivate) {
      let token = req.header("x-auth-token");
      
      // If no x-auth-token, try Authorization header with Bearer format
      if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "");
        }
      }
      
      if (!token) {
        return res.status(401).json({ message: "Access denied" });
      }

      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        
        const isMember = group.members.some(member => 
          member.user.toString() === userId
        );
        
        if (!isMember && group.admin.toString() !== userId) {
          return res.status(403).json({ message: "Access denied to private group" });
        }
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    const media = await GroupMedia.find({ group: req.params.id })
      .populate("user", "name email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/groups/:id
// @desc Delete group
// @access Private (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only group admin can delete the group" });
    }

    // Delete all media associated with the group
    await GroupMedia.deleteMany({ group: req.params.id });

    // Delete the group
    await Group.findByIdAndDelete(req.params.id);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST /api/groups/media/:mediaId/comments
// @desc Add comment to group media
// @access Private (Group members only)
router.post("/media/:mediaId/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const media = await GroupMedia.findById(req.params.mediaId).populate("group");
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const group = await Group.findById(media.group._id || media.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.user.toString() === req.user.id
    );

    if (!isMember && group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only group members can comment" });
    }

    const comment = new GroupMediaComment({
      media: req.params.mediaId,
      user: req.user.id,
      text: text.trim(),
    });

    await comment.save();

    const populatedComment = await GroupMediaComment.findById(comment._id)
      .populate("user", "name email avatarUrl");

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/groups/media/:mediaId/comments
// @desc Get comments for group media
// @access Public (for public groups) / Private (for private groups)
router.get("/media/:mediaId/comments", async (req, res) => {
  try {
    const media = await GroupMedia.findById(req.params.mediaId).populate("group");
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const group = await Group.findById(media.group._id || media.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check access for private groups
    if (group.isPrivate) {
      let token = req.header("x-auth-token");
      
      // If no x-auth-token, try Authorization header with Bearer format
      if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "");
        }
      }
      
      if (!token) {
        return res.status(401).json({ message: "Access denied" });
      }

      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user.id;
        
        const isMember = group.members.some(member => 
          member.user.toString() === userId
        );
        
        if (!isMember && group.admin.toString() !== userId) {
          return res.status(403).json({ message: "Access denied to private group" });
        }
      } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    const comments = await GroupMediaComment.find({ media: req.params.mediaId })
      .populate("user", "name email avatarUrl")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/groups/media/:mediaId/comments/:commentId
// @desc Delete comment from group media
// @access Private (Comment author or group admin only)
router.delete("/media/:mediaId/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await GroupMediaComment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const media = await GroupMedia.findById(req.params.mediaId).populate("group");
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    const group = await Group.findById(media.group._id || media.group);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is comment author or group admin
    if (comment.user.toString() !== req.user.id && group.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await GroupMediaComment.findByIdAndDelete(req.params.commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Download media
router.get('/media/:mediaId/download', auth, async (req, res) => {
  try {
    console.log('📥 Download request received for media:', req.params.mediaId);
    
    // Find the media
    const media = await GroupMedia.findById(req.params.mediaId)
      .populate('group')
      .populate('user', 'name email');
    
    if (!media) {
      console.log('❌ Media not found:', req.params.mediaId);
      return res.status(404).json({ message: 'Media not found' });
    }

    console.log('📁 Media found, checking permissions for group:', media.group._id);
    
    // Check if user is member or admin of the group
    const group = await Group.findById(media.group._id).populate('members.user');
    if (!group) {
      console.log('❌ Group not found for media');
      return res.status(404).json({ message: 'Group not found' });
    }

    const isAdmin = group.admin.toString() === req.user.id;
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user.id
    );
    
    if (!isAdmin && !isMember) {
      console.log('❌ Access denied - user not member or admin');
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('✅ Access granted, fetching media from URL:', media.mediaUrl);
    
    // Fetch the media file from Cloudinary or storage
    const axios = require('axios');
    const response = await axios.get(media.mediaUrl, {
      responseType: 'stream'
    });
    
    // Set appropriate headers for download
    const contentType = media.mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const fileExtension = media.mediaUrl.split('.').pop().split('?')[0] || 
      (media.mediaType === 'video' ? 'mp4' : 'jpg');
    
    // Create a safe filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${group.name}_${media.user.name}_${timestamp}.${fileExtension}`
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    console.log('🚀 Streaming file to client:', filename);
    
    // Stream the file to the client
    response.data.pipe(res);
    
  } catch (error) {
    console.error('❌ Error downloading media:', error);
    res.status(500).json({ 
      message: 'Failed to download media',
      error: error.message 
    });
  }
});

module.exports = router;
