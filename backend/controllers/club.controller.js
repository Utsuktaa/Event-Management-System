const Club = require("../models/club.model");
const ClubAdmin = require("../models/clubAdmin.model");

exports.getAllClubsWithAdminFlag = async (req, res) => {
  try {
    const clubs = await Club.find();

    const adminLinks = await ClubAdmin.find({
      userId: req.user.userId,
    });

    const adminClubIds = adminLinks.map((ca) => ca.clubId.toString());

    const result = clubs.map((club) => ({
      _id: club._id,
      name: club.name,
      isAdmin: adminClubIds.includes(club._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
};
