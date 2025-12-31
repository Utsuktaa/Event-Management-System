// routes/admin.routes.js
const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const isSuperAdmin = require("../middlewares/isSuperAdmin");
const Club = require("../models/club.model");
const ClubAdmin = require("../models/clubAdmin.model");

const router = express.Router();

router.post("/clubs", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Club name is required" });
    }

    // Check if club already exists
    const existing = await Club.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Club already exists" });
    }

    const club = await Club.create({ name });
    return res.status(201).json(club);
  } catch (err) {
    console.error("Error creating club:", err);
    return res.status(500).json({ message: "Server error creating club" });
  }
});

router.post(
  "/clubs/:clubId/admins",
  verifyToken,
  isSuperAdmin,
  async (req, res) => {
    try {
      const { clubId } = req.params;
      const { userId } = req.body;

      if (!clubId || !userId) {
        return res
          .status(400)
          .json({ message: "Club ID and User ID are required" });
      }

      // Check if club exists
      const club = await Club.findById(clubId);
      if (!club) {
        return res.status(404).json({ message: "Club not found" });
      }

      // Check if user is already admin
      const existing = await ClubAdmin.findOne({ clubId, userId });
      if (existing) {
        return res
          .status(400)
          .json({ message: "User is already an admin of this club" });
      }

      const record = await ClubAdmin.create({ clubId, userId });
      return res.status(201).json(record);
    } catch (err) {
      console.error("Error assigning club admin:", err);
      return res
        .status(500)
        .json({ message: "Server error assigning club admin" });
    }
  }
);

module.exports = router;
