const ClubAdmin = require("../models/clubAdmin.model");
const ClubMember = require("../models/ClubMember");

const verifyClubAccess = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { clubId } = req.params;

    const isAdmin = await ClubAdmin.findOne({ clubId, userId });
    if (isAdmin) return next();

    const member = await ClubMember.findOne({
      clubId,
      userId,
      status: "approved",
    });

    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Access check failed" });
  }
};

module.exports = { verifyClubAccess };
