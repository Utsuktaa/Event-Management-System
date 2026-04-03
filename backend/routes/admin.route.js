const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");
const Club = require("../models/club.model");
const ClubMember = require("../models/ClubMember");
const User = require("../models/user.model");

const router = express.Router();

router.get("/clubs", verifyToken, isAdmin, async (req, res) => {
  try {
    const clubs = await Club.find().select("_id name joinPolicy").sort({ name: 1 });
    return res.json(clubs);
  } catch {
    return res.status(500).json({ message: "Failed to fetch clubs" });
  }
});

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const query = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const users = await User.find(query).select("_id name email role").sort({ name: 1 }).limit(50);
    return res.json(users);
  } catch {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.post("/clubs", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, joinPolicy } = req.body;
    if (!name) return res.status(400).json({ message: "Club name is required" });

    const existing = await Club.findOne({ name });
    if (existing) return res.status(400).json({ message: "Club already exists" });

    const club = await Club.create({ name, joinPolicy: joinPolicy || "APPROVAL_REQUIRED" });
    return res.status(201).json(club);
  } catch (err) {
    return res.status(500).json({ message: "Server error creating club" });
  }
});

router.post("/clubs/:clubId/members", verifyToken, isAdmin, async (req, res) => {
  try {
    const { clubId } = req.params;
    const { userId, role } = req.body;

    if (!clubId || !userId) {
      return res.status(400).json({ message: "Club ID and User ID are required" });
    }

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    const validRoles = ["member", "club_admin", "vice_president", "president"];
    const assignedRole = validRoles.includes(role) ? role : "club_admin";

    const existing = await ClubMember.findOne({ clubId, userId });
    if (existing) {
      const updated = await ClubMember.findOneAndUpdate(
        { clubId, userId },
        { status: "ACTIVE", role: assignedRole },
        { new: true }
      );
      return res.status(200).json(updated);
    }

    const record = await ClubMember.create({ clubId, userId, status: "ACTIVE", role: assignedRole });
    return res.status(201).json(record);
  } catch (err) {
    return res.status(500).json({ message: "Server error assigning member" });
  }
});

router.get("/clubs/:clubId/members", verifyToken, isAdmin, async (req, res) => {
  try {
    const members = await ClubMember.find({ clubId: req.params.clubId })
      .populate("userId", "name email")
      .sort({ role: 1 });
    return res.json(members);
  } catch {
    return res.status(500).json({ message: "Failed to fetch members" });
  }
});

router.delete("/clubs/:clubId/members/:memberId", verifyToken, isAdmin, async (req, res) => {
  try {
    await ClubMember.findByIdAndDelete(req.params.memberId);
    return res.json({ message: "Member removed" });
  } catch {
    return res.status(500).json({ message: "Failed to remove member" });
  }
});

router.patch("/clubs/:clubId/policy", verifyToken, isAdmin, async (req, res) => {
  try {
    const { joinPolicy } = req.body;
    const validPolicies = ["OPEN", "APPROVAL_REQUIRED", "CLOSED", "INVITE_ONLY"];
    if (!validPolicies.includes(joinPolicy)) {
      return res.status(400).json({ message: "Invalid join policy" });
    }
    const club = await Club.findByIdAndUpdate(req.params.clubId, { joinPolicy }, { new: true });
    if (!club) return res.status(404).json({ message: "Club not found" });
    return res.json(club);
  } catch (err) {
    return res.status(500).json({ message: "Server error updating policy" });
  }
});

module.exports = router;
