const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const eventController = require("../controllers/event.controller");
const Event = require("../models/event.model");

const router = express.Router();
router.post("/", verifyToken, eventController.createEvent);
router.post("/", verifyToken, async (req, res) => {
  const { title, description, date, visibility, clubId } = req.body;

  if (visibility === "club" && !clubId) {
    return res.status(400).json({ message: "clubId required for club events" });
  }

  const event = await Event.create({
    title,
    description,
    date,
    visibility,
    clubId: visibility === "club" ? clubId : null,
  });

  res.status(201).json(event);
});

module.exports = router;
