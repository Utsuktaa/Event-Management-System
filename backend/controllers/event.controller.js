const Event = require("../models/event.model");
const ClubMember = require("../models/ClubMember");
const EventRegistration = require("../models/eventRegistration.model");
const User = require("../models/user.model");
const crypto = require("crypto");
const Attendance = require("../models/attendance.model");
const QRCode = require("qrcode");
const { hasPermission } = require("../utils/permissions");
const { awardXP } = require("../utils/gamification");
const { notifyMany } = require("../utils/notify");

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
      registrationCap,
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

      if (req.user.role !== "admin") {
        const membership = await ClubMember.findOne({
          userId: req.user.userId,
          clubId,
          status: "ACTIVE",
        });
        if (!membership || !hasPermission(membership.role, "create_event")) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
      }
    }

    const cap = registrationCap ? parseInt(registrationCap, 10) : null;
    if (cap !== null && (isNaN(cap) || cap < 1)) {
      return res.status(400).json({ message: "Registration cap must be a positive number" });
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
      registrationCap: cap,
    });

    const scanUrl = `${process.env.BACKEND_BASE_URL || "http://localhost:5000"}/api/scan?eventId=${event._id}&token=${event.qrToken}`;
    const qrImage = await QRCode.toDataURL(scanUrl);

    // Notify all active club members about the new event (club-scoped events only)
    if (visibility === "club" && clubId) {
      const members = await ClubMember.find({
        clubId,
        status: "ACTIVE",
      }).select("userId");
      const memberIds = members
        .map((m) => m.userId)
        .filter((id) => id.toString() !== req.user.userId);
      if (memberIds.length > 0) {
        await notifyMany(
          memberIds,
          "new_club_event",
          "New event in your club",
          `"${title}" has been scheduled`,
          `/clubs/${clubId}`,
          { refId: event._id, refModel: "Event" }
        );
      }
    }

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
    const events = await Event.find({ visibility: "school" }).sort({ date: 1 }).lean();
    const eventIds = events.map((e) => e._id);
    const counts = await EventRegistration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const result = events.map((e) => ({
      ...e,
      registrationCount: countMap[e._id.toString()] || 0,
    }));
    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch Events Error:", err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

exports.getEventsByClub = async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId }).sort({ date: 1 }).lean();
    const eventIds = events.map((e) => e._id);
    const counts = await EventRegistration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));
    const result = events.map((e) => ({
      ...e,
      registrationCount: countMap[e._id.toString()] || 0,
    }));
    res.json(result);
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

exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Allow creator or platform admin
    if (
      event.createdBy.toString() !== userId &&
      !["admin", "superadmin"].includes(req.user.role)
    ) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    await Event.findByIdAndDelete(eventId);
    // Clean up registrations and attendance for this event
    await EventRegistration.deleteMany({ eventId });
    await Attendance.deleteMany({ eventId });

    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

exports.registerForEvent = async (req, res) => {
  const studentId = req.user.userId;
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Enforce registration cap
    if (event.registrationCap != null) {
      const currentCount = await EventRegistration.countDocuments({ eventId });
      if (currentCount >= event.registrationCap) {
        return res.status(400).json({ message: "This event is full. Registration is closed." });
      }
    }

    const registration = await EventRegistration.create({ eventId, studentId });
    await awardXP(studentId, "register_event");
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

// attendance is handled by attendance.controller.js via /api/attendance/mark


exports.getAnalyticsOverview = async (req, res) => {
  try {
    const events = await Event.find().lean();

    const eventIds = events.map((e) => e._id);

    const [registrations, attendances] = await Promise.all([
      EventRegistration.find({ eventId: { $in: eventIds } }).lean(),
      Attendance.find({ eventId: { $in: eventIds } }).lean(),
    ]);

    // Build per-event maps
    const regMap = {};
    const attMap = {};
    registrations.forEach((r) => {
      const id = r.eventId.toString();
      regMap[id] = (regMap[id] || 0) + 1;
    });
    attendances.forEach((a) => {
      const id = a.eventId.toString();
      attMap[id] = (attMap[id] || 0) + 1;
    });

    const eventBreakdown = events.map((e) => {
      const id = e._id.toString();
      const registered = regMap[id] || 0;
      const attended = attMap[id] || 0;
      return {
        id,
        name: e.title,
        date: e.date,
        visibility: e.visibility,
        registered,
        attended,
        attendanceRate: registered > 0 ? Math.round((attended / registered) * 100) : 0,
      };
    });

    const totalRegistrations = registrations.length;
    const totalAttendance = attendances.length;

    res.json({
      totalEvents: events.length,
      totalRegistrations,
      totalAttendance,
      overallAttendanceRate:
        totalRegistrations > 0
          ? Math.round((totalAttendance / totalRegistrations) * 100)
          : 0,
      eventBreakdown,
    });
  } catch (err) {
    console.error("Analytics overview error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};


exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [events, attendances] = await Promise.all([
      Event.find({ date: { $gte: sixMonthsAgo } }).lean(),
      Attendance.find({ createdAt: { $gte: sixMonthsAgo } }).lean(),
    ]);

    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const eventCounts = {};
    const attendanceCounts = {};
    monthLabels.forEach((m) => { eventCounts[m] = 0; attendanceCounts[m] = 0; });

    events.forEach((e) => {
      const key = `${new Date(e.date).getFullYear()}-${String(new Date(e.date).getMonth() + 1).padStart(2, "0")}`;
      if (eventCounts[key] !== undefined) eventCounts[key]++;
    });
    attendances.forEach((a) => {
      const key = `${new Date(a.createdAt).getFullYear()}-${String(new Date(a.createdAt).getMonth() + 1).padStart(2, "0")}`;
      if (attendanceCounts[key] !== undefined) attendanceCounts[key]++;
    });

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const result = monthLabels.map((m) => {
      const [, month] = m.split("-");
      return {
        month: monthNames[parseInt(month, 10) - 1],
        events: eventCounts[m],
        attendance: attendanceCounts[m],
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Monthly analytics error:", err);
    res.status(500).json({ message: "Failed to fetch monthly analytics" });
  }
};


exports.getVisibilityDistribution = async (req, res) => {
  try {
    const result = await Event.aggregate([
      { $group: { _id: "$visibility", count: { $sum: 1 } } },
    ]);
    res.json(result.map((r) => ({ name: r._id, value: r.count })));
  } catch (err) {
    console.error("Visibility distribution error:", err);
    res.status(500).json({ message: "Failed to fetch distribution" });
  }
};
