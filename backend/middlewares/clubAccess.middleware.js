const ClubMember = require("../models/ClubMember");

const verifyClubAccess = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { clubId } = req.params;

    if (req.user.role === "admin") return next();

    const member = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.clubMember = member;
    next();
  } catch (err) {
    res.status(500).json({ message: "Access check failed" });
  }
};

module.exports = { verifyClubAccess };
