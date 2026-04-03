const ClubMember = require("../models/ClubMember");
const { hasPermission } = require("../utils/permissions");

const verifyClubAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { clubId } = req.params;

    if (req.user.role === "admin") return next();

    const member = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
    if (!member || !hasPermission(member.role, "approve_join_request")) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.clubMember = member;
    next();
  } catch (err) {
    res.status(500).json({ message: "Permission check failed" });
  }
};

module.exports = { verifyClubAdmin };
