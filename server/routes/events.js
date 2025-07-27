const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Event = require("../models/Event");

// GET /api/events - Get all events (Public)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/events/:id - Get a single event (Public)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST /api/events - Create a new event (Private)
router.post("/", auth, async (req, res) => {
  try {
    const { title, date, imageUrl } = req.body;
    const newEvent = new Event({
      title,
      date,
      imageUrl,
      owner: req.user.id,
    });
    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// PUT /api/events/:id - Update an event (Private)
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, date, imageUrl } = req.body;
    
    // Find the event first
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    
    // Check if the user owns the event
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    
    // Update the event
    event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, date, imageUrl },
      { new: true }
    );
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// DELETE /api/events/:id - Delete an event (Private)
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    
    // Check if the user owns the event
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    
    // Delete the event
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ msg: "Event removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
