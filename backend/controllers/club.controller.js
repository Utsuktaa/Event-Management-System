const Club = require("../models/club.model");
const ClubAdmin = require("../models/clubAdmin.model");
const ClubMember = require("../models/ClubMember");

exports.getAllClubsWithAdminFlag = async (req, res) => {
  try {
    const userId = req.user.userId;

    const clubs = await Club.find();

    const adminLinks = await ClubAdmin.find({ userId });
    const adminClubIds = new Set(adminLinks.map((a) => a.clubId.toString()));

    const memberships = await ClubMember.find({ userId });
    const membershipMap = new Map(
      memberships.map((m) => [m.clubId.toString(), m.status])
    );

    const result = clubs.map((club) => {
      const clubId = club._id.toString();

      return {
        _id: club._id,
        name: club.name,
        isAdmin: adminClubIds.has(clubId),
        membershipStatus: membershipMap.get(clubId) || "none",
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
};
exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    // prevent admin from joining redundantly
    const isAdmin = await ClubAdmin.findOne({ clubId, userId });
    if (isAdmin) {
      return res.status(400).json({ message: "Admin already has access" });
    }

    const existing = await ClubMember.findOne({ clubId, userId });
    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const member = await ClubMember.create({
      clubId,
      userId,
      status: "pending",
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to join club" });
  }
};
exports.getPendingJoinRequests = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    const isAdmin = await ClubAdmin.findOne({ clubId, userId });
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const requests = await ClubMember.find({
      clubId,
      status: "pending",
    }).populate("userId", "name email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
exports.approveJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const userId = req.user.userId;

    const isAdmin = await ClubAdmin.findOne({ clubId, userId });
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId },
      { status: "approved" },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve request" });
  }
};
exports.getClubDashboard = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json({
      clubId: club._id,
      name: club.name,
      message: "Club dashboard access granted",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load club dashboard" });
  }
};
