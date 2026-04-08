const EventRegistration = require("../models/eventRegistration.model");
const Attendance = require("../models/attendance.model");
const ClubMember = require("../models/ClubMember");
const Event = require("../models/event.model");

exports.getUserActivity = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const [registrations, attendances, memberships] = await Promise.all([
      EventRegistration.find({ studentId, createdAt: { $gte: cutoff } }).populate("eventId").lean(),
      Attendance.find({ studentId, createdAt: { $gte: cutoff } }).populate("eventId").lean(),
      ClubMember.find({ userId: studentId, status: "ACTIVE", createdAt: { $gte: cutoff } }).populate("clubId").lean(),
    ]);

    const activity = [];

    registrations.forEach((r) => {
      if (r.eventId) {
        activity.push({ type: "event_joined", title: `Joined ${r.eventId.title}`, date: r.createdAt, image: r.eventId.imageUrl || null });
      }
    });

    attendances.forEach((a) => {
      if (a.eventId) {
        activity.push({ type: "attendance", title: `Attended ${a.eventId.title}`, date: a.createdAt, image: a.eventId.imageUrl || null });
      }
    });

    memberships.forEach((m) => {
      if (m.clubId) {
        activity.push({ type: "club_join", title: `Joined ${m.clubId.name}`, date: m.createdAt, image: null });
      }
    });

    activity.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(activity.slice(0, 15));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};

exports.getUserClubs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const memberships = await ClubMember.find({ userId, status: "ACTIVE" }).lean();
    res.json(memberships.map((m) => m.clubId.toString()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user clubs" });
  }
};

exports.getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const registrations = await EventRegistration.find({ studentId: userId }).lean();
    const registeredEventIds = registrations.map((r) => r.eventId.toString());

    const schoolEvents = await Event.find({ visibility: "school", date: { $gte: now } }).sort({ date: 1 }).lean();
    const notRegistered = schoolEvents.filter((e) => !registeredEventIds.includes(e._id.toString()));

    res.json(notRegistered.slice(0, 6));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

exports.getAttendanceStats = async (req, res) => {
  try {
    const studentId = req.user.userId;
    const now = new Date();

    const [registrations, attendances] = await Promise.all([
      EventRegistration.find({ studentId }).populate("eventId").lean(),
      Attendance.find({ studentId }).lean(),
    ]);

    const attendedIds = new Set(attendances.map((a) => a.eventId.toString()));

    const allEvents = registrations
      .filter((r) => r.eventId)
      .map((r) => ({
        id: r.eventId._id.toString(),
        title: r.eventId.title,
        date: r.eventId.date,
        attended: attendedIds.has(r.eventId._id.toString()),
        upcoming: new Date(r.eventId.date) >= now,
      }));

    allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    const pastEvents = allEvents.filter((e) => !e.upcoming);
    const attendedEvents = allEvents.filter((e) => e.attended);

    const registered = allEvents.length;
    const attended = attendedEvents.length;
    const missed = pastEvents.filter((e) => !e.attended).length;
    const attendanceRate = registered === 0 ? 0 : Math.round((attended / registered) * 100);

    let streak = 0;
    for (const event of allEvents) {
      if (event.attended) streak++;
      else if (!event.upcoming) break;
    }

    const recent = allEvents.slice(0, 5);
    const recentAttended = recent.filter((e) => e.attended).length;
    res.json({
      attended,
      registered,
      missed,
      attendanceRate,
      streak,
      recentAttended,
      recentTotal: recent.length,
      recentEvents: recent.map((e) => ({ attended: e.attended })),
      events: allEvents.map((e) => ({
        title: e.title,
        date: e.date,
        attended: e.attended,
        upcoming: e.upcoming,
      })),
    });  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance stats" });
  }
};
