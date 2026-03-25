const Event = require("../models/event.model");
const ClubAdmin = require("../models/clubAdmin.model");
const EventRegistration = require("../models/eventRegistration.model");
const User = require("../models/user.model");
const crypto = require("crypto");
const Attendance = require("../models/attendance.model");
const QRCode = require("qrcode");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      visibility,
      clubId,
      location,
      imageUrl,
      latitude,
      longitude,
      attendanceRadius,
    } = req.body;

    if (!title || !date || !visibility) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check club admin only if visibility is "club"
    if (visibility === "club") {
      if (!clubId) return res.status(400).json({ message: "clubId required" });

      const admin = await ClubAdmin.findOne({
        userId: req.user.userId,
        clubId,
      });

      if (!admin) return res.status(403).json({ message: "Not club admin" });
    }
    const qrToken = crypto.randomBytes(16).toString("hex");
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      visibility,
      clubId: clubId || req.user.clubId,
      createdBy: req.user.userId,
      imageUrl: imageUrl || "",
      qrToken,
      latitude,
      longitude,
      attendanceRadius,
    });

    const scanUrl = `http://localhost:3000/scan?eventId=${event._id}&token=${event.qrToken}`;
    const qrImage = await QRCode.toDataURL(scanUrl);

    res.status(201).json({
      event,
      qr: qrImage,
    });
  } catch (err) {
    console.error("Create Event Error:", err);
    res
      .status(500)
      .json({ message: "Event creation failed", error: err.message });
  }
};
exports.getEvents = async (req, res) => {
  try {
    // Only fetch school-wide events
    const events = await Event.find({ visibility: "school" }).sort({ date: 1 }); // sort by date ascending
    res.status(200).json(events);
  } catch (err) {
    console.error("Fetch Events Error:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};
exports.getEventsByClub = async (req, res) => {
  try {
    const events = await Event.find({
      clubId: req.params.clubId,
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
};
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent)
      return res.status(404).json({ message: "Event not found" });

    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update event" });
  }
};

exports.registerForEvent = async (req, res) => {
  const studentId = req.user.userId;
  const { eventId } = req.params;

  try {
    const registration = await EventRegistration.create({ eventId, studentId });
    res.json({ message: "Registered successfully", registration });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Already registered" });
    }
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.getStudentRegistrations = async (req, res) => {
  const studentId = req.user.id;

  try {
    const registrations = await EventRegistration.find({ studentId });
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
};
exports.getStudentRegistrations = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const registrations = await EventRegistration.find({ studentId }).populate(
      "eventId",
    );

    const events = registrations.map((r) => r.eventId);

    return res.status(200).json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// attendance function

exports.markAttendance = async (req, res) => {
  try {
    const { eventId, token, lat, lng } = req.body;
    const studentId = req.user.userId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.qrToken !== token) {
      return res.status(400).json({ message: "Invalid QR token" });
    }

    const registration = await EventRegistration.findOne({
      eventId,
      studentId,
    });

    if (!registration) {
      return res
        .status(403)
        .json({ message: "You are not registered for this event" });
    }

    const existing = await Attendance.findOne({
      eventId,
      studentId,
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already recorded" });
    }

    await Attendance.create({
      eventId,
      studentId,
    });

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance failed" });
  }
};
