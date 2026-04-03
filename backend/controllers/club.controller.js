const Club = require("../models/club.model");
const ClubMember = require("../models/ClubMember");
const { hasPermission, ROLE_PERMISSIONS } = require("../utils/permissions");

exports.getAllClubsWithAdminFlag = async (req, res) => {
  try {
    const userId = req.user.userId;
    const clubs = await Club.find();
    const memberships = await ClubMember.find({ userId });
    const membershipMap = new Map(memberships.map((m) => [m.clubId.toString(), m]));

    const result = clubs.map((club) => {
      const membership = membershipMap.get(club._id.toString());
      return {
        _id: club._id,
        name: club.name,
        joinPolicy: club.joinPolicy,
        membershipStatus: membership?.status || "NONE",
        clubRole: membership?.role || null,
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

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (club.joinPolicy === "CLOSED") {
      return res.status(403).json({ message: "This club is not accepting members" });
    }

    const existing = await ClubMember.findOne({ clubId, userId });
    if (existing) return res.status(400).json({ message: "Request already exists" });

    if (club.joinPolicy === "OPEN") {
      const member = await ClubMember.create({ clubId, userId, status: "ACTIVE", role: "member" });
      return res.status(201).json(member);
    }

    const member = await ClubMember.create({ clubId, userId, status: "PENDING", role: "member" });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to join club" });
  }
};

exports.getPendingJoinRequests = async (req, res) => {
  try {
    const { clubId } = req.params;
    const requests = await ClubMember.find({ clubId, status: "PENDING" }).populate("userId", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "PENDING" },
      { status: "ACTIVE" },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: "Request not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve request" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "PENDING" },
      { status: "REJECTED" },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: "Request not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to reject request" });
  }
};

exports.getClubMembers = async (req, res) => {
  try {
    const { clubId } = req.params;
    const members = await ClubMember.find({ clubId, status: "ACTIVE" }).populate("userId", "name email");
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.userId;

    const validRoles = ["member", "club_admin", "vice_president", "president"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!["admin", "superadmin"].includes(req.user.role)) {
      const requester = await ClubMember.findOne({ clubId, userId: requesterId, status: "ACTIVE" });
      if (!requester || !hasPermission(requester.role, "assign_roles")) {
        return res.status(403).json({ message: "Insufficient permissions to assign roles" });
      }
    }

    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "ACTIVE" },
      { role },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign role" });
  }
};

exports.updateJoinPolicy = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { joinPolicy } = req.body;
    const userId = req.user.userId;

    const validPolicies = ["OPEN", "APPROVAL_REQUIRED", "CLOSED"];
    if (!validPolicies.includes(joinPolicy)) {
      return res.status(400).json({ message: "Invalid join policy" });
    }

    if (!["admin", "superadmin"].includes(req.user.role)) {
      const member = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
      if (!member || !hasPermission(member.role, "manage_members")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    const club = await Club.findByIdAndUpdate(clubId, { joinPolicy }, { new: true });
    if (!club) return res.status(404).json({ message: "Club not found" });
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: "Failed to update join policy" });
  }
};

exports.getClubDashboard = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    let membership = null;
    if (!["admin", "superadmin"].includes(req.user.role)) {
      membership = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
    }

    const permissions = membership
      ? ROLE_PERMISSIONS[membership.role] || []
      : ["admin", "superadmin"].includes(req.user.role)
      ? ROLE_PERMISSIONS["president"]
      : [];

    res.json({
      clubId: club._id,
      name: club.name,
      joinPolicy: club.joinPolicy,
      clubRole: membership?.role || null,
      permissions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load club dashboard" });
  }
};
