const Event = require("../models/event.model");
const ClubAdmin = require("../models/clubAdmin.model");

exports.createEvent = async (req, res) => {
  try {
    const { clubId, title, description, date, visibility } = req.body;

    const admin = await ClubAdmin.findOne({
      userId: req.user.id,
      clubId: clubId,
    });

    if (!admin) {
      return res.status(403).json({ message: "Not club admin" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      clubId,
      visibility,
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Event creation failed" });
  }
};
