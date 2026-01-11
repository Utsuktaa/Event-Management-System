const ClubAdmin = require("../models/clubAdmin.model");

const verifyClubAdmin = async (req, res, next) => {
  const userId = req.user.userId;
  const { clubId } = req.params;

  const isAdmin = await ClubAdmin.findOne({ clubId, userId });
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};

module.exports = { verifyClubAdmin };
