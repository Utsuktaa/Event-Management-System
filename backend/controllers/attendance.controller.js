const Event = require("../models/event.model");
const EventRegistration = require("../models/eventRegistration.model");
const Attendance = require("../models/attendance.model");

function isInsideRadius(studentLat, studentLng, event) {
  const R = 6371000; // radius on earth
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(event.latitude - studentLat);
  const dLng = toRad(event.longitude - studentLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(studentLat)) *
      Math.cos(toRad(event.latitude)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= event.attendanceRadius;
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
    const registration = await EventRegistration.findOne({
      eventId,
      studentId,
    });
    if (!registration)
      return res
        .status(403)
        .json({ message: "You are not registered for this event" });

    const existing = await Attendance.findOne({ eventId, studentId });
    if (existing)
      return res.status(400).json({ message: "Attendance already recorded" });

    // Location check
    if (!isInsideRadius(lat, lng, event))
      return res
        .status(403)
        .json({ message: "You are not inside the event area" });

    await Attendance.create({ eventId, studentId });

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance failed" });
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const attendanceRecords = await Attendance.find({ studentId }).populate(
      "eventId"
    );
    res.json(attendanceRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};