const User = require("../models/user.model");
const EventRegistration = require("../models/eventRegistration.model");
const Attendance = require("../models/attendance.model");

exports.getLeaderboard = async (req, res) => {
  try {
    const now = new Date();

    const users = await User.find({
      role: { $nin: ["admin", "superadmin"] },
    }).select("_id name").lean();

    const [allRegistrations, allAttendances] = await Promise.all([
      EventRegistration.find().populate({ path: "eventId", select: "date" }).lean(),
      Attendance.find().lean(),
    ]);

    const attendedSet = new Set(
      allAttendances.map((a) => `${a.studentId.toString()}_${a.eventId.toString()}`)
    );

    const regByUser = {};
    for (const r of allRegistrations) {
      if (!r.eventId) continue;
      const uid = r.studentId.toString();
      const eid = r.eventId._id.toString();
      if (!regByUser[uid]) regByUser[uid] = { registered: 0, attended: 0 };
      regByUser[uid].registered++;
      if (attendedSet.has(`${uid}_${eid}`)) {
        regByUser[uid].attended++;
      }
    }

    const leaderboard = users
      .map((u) => {
        const stats = regByUser[u._id.toString()] || { registered: 0, attended: 0 };
        return {
          userId: u._id.toString(),
          name: u.name,
          attended: stats.attended,
          registered: stats.registered,
          attendanceRate: stats.registered === 0
            ? 0
            : Math.round((stats.attended / stats.registered) * 100),
        };
      })
      .filter((u) => u.registered > 0)
      .sort((a, b) => b.attended - a.attended || b.attendanceRate - a.attendanceRate);

    res.json({ leaderboard, currentUserId: req.user.userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};
