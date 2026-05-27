const Event = require("../models/event.model");
const EventRegistration = require("../models/eventRegistration.model");
const Attendance = require("../models/attendance.model");
const { awardXP } = require("../utils/gamification");

function haversineDistance(studentLat, studentLng, eventLat, eventLng) {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(eventLat - studentLat);
  const dLng = toRad(eventLng - studentLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(studentLat)) * Math.cos(toRad(eventLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.markAttendance = async (req, res) => {
  try {
    const { eventId, token, lat, lng } = req.body;
    const studentId = req.user.userId;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.qrToken !== token)
      return res.status(400).json({ message: "Invalid QR token" });

    // Registration check
    const registration = await EventRegistration.findOne({ eventId, studentId });
    if (!registration)
      return res.status(403).json({ message: "You are not registered for this event" });

    // Duplicate attendance check
    const existing = await Attendance.findOne({ eventId, studentId });
    if (existing)
      return res.status(400).json({ message: "Attendance already recorded" });

    // Location check — skip only if event has no coordinates set
    if (event.latitude != null && event.longitude != null) {
      if (lat == null || lng == null) {
        return res.status(400).json({ message: "Location is required to mark attendance" });
      }
      const distance = haversineDistance(
        parseFloat(lat), parseFloat(lng),
        event.latitude, event.longitude
      );
      const allowedRadius = event.attendanceRadius || 100;
      console.log(`[attendance] distance=${distance.toFixed(1)}m radius=${allowedRadius}m`);
      if (distance > allowedRadius) {
        return res.status(403).json({
          message: `You are ${Math.round(distance)}m away from the event. Must be within ${allowedRadius}m.`,
        });
      }
    } else {
      console.warn("[attendance] Event has no coordinates — skipping location check");
    }

    await Attendance.create({ eventId, studentId });
    await awardXP(studentId, "attend_event");
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: "Attendance failed" });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const attendanceRecords = await Attendance.find({ studentId }).populate("eventId");
    res.json(attendanceRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
