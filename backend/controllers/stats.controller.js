const User = require("../models/user.model");
const Badge = require("../models/badge.model");
const Attendance = require("../models/attendance.model");
const ClubMember = require("../models/ClubMember");
const EventRegistration = require("../models/eventRegistration.model");
const { getLevelFromXP } = require("../utils/gamification");

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("badges").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const allBadges = await Badge.find().lean();
    const unlockedIds = new Set((user.badges || []).map((b) => b._id.toString()));

    const [attendanceCount, clubCount, registrationCount] = await Promise.all([
      Attendance.countDocuments({ studentId: userId }),
      ClubMember.countDocuments({ userId, status: "ACTIVE" }),
      EventRegistration.countDocuments({ studentId: userId }),
    ]);

    const levelInfo = getLevelFromXP(user.xp || 0);

    const badges = allBadges.map((badge) => {
      const isUnlocked = unlockedIds.has(badge._id.toString());
      const userBadge = (user.badges || []).find((b) => b._id.toString() === badge._id.toString());
      return {
        _id: badge._id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        conditionType: badge.conditionType,
        conditionValue: badge.conditionValue,
        unlocked: isUnlocked,
        earnedAt: userBadge?.createdAt || null,
      };
    });

    res.json({
      xp: user.xp || 0,
      streak: user.streak || 0,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      nextLevelXP: levelInfo.nextLevelXP,
      isInLeaderboard: user.isInLeaderboard || false,
      badges,
      stats: {
        eventsAttended: attendanceCount,
        clubsJoined: clubCount,
        eventsRegistered: registrationCount,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

exports.getNavbarStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("xp streak").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ xp: user.xp || 0, streak: user.streak || 0 });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch navbar stats" });
  }
};

exports.joinLeaderboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndUpdate(userId, { isInLeaderboard: true });
    res.json({ message: "Joined leaderboard" });
  } catch (err) {
    res.status(500).json({ message: "Failed to join leaderboard" });
  }
};

exports.leaveLeaderboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndUpdate(userId, { isInLeaderboard: false });
    res.json({ message: "Left leaderboard" });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave leaderboard" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { period } = req.query;
    const userId = req.user.userId;

    const users = await User.find({
      isInLeaderboard: true,
      role: { $nin: ["admin", "superadmin"] },
    })
      .select("name xp streak")
      .lean();

    const leaderboard = users
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .map((u, i) => ({
        userId: u._id.toString(),
        name: u.name,
        xp: u.xp || 0,
        streak: u.streak || 0,
        rank: i + 1,
        isYou: u._id.toString() === userId,
      }));

    res.json({ leaderboard, currentUserId: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

exports.seedBadges = async (req, res) => {
  try {
    const badges = [
      { name: "First Step", description: "Join your first club", icon: "🌱", conditionType: "first_club", conditionValue: 1 },
      { name: "Club Hopper", description: "Join 3 clubs", icon: "🎪", conditionType: "clubs_joined", conditionValue: 3 },
      { name: "Event Goer", description: "Attend your first event", icon: "🎟️", conditionType: "events_attended", conditionValue: 1 },
      { name: "Regular", description: "Attend 5 events", icon: "⭐", conditionType: "events_attended", conditionValue: 5 },
      { name: "Dedicated", description: "Attend 10 events", icon: "🏅", conditionType: "events_attended", conditionValue: 10 },
      { name: "Century", description: "Reach 100 XP", icon: "💯", conditionType: "xp", conditionValue: 100 },
      { name: "Rising Star", description: "Reach 300 XP", icon: "🌟", conditionType: "xp", conditionValue: 300 },
      { name: "Legend", description: "Reach 500 XP", icon: "🏆", conditionType: "xp", conditionValue: 500 },
      { name: "On Fire", description: "Maintain a 7-day streak", icon: "🔥", conditionType: "streak", conditionValue: 7 },
      { name: "Unstoppable", description: "Maintain a 14-day streak", icon: "⚡", conditionType: "streak", conditionValue: 14 },
    ];

    for (const badge of badges) {
      await Badge.findOneAndUpdate({ name: badge.name }, badge, { upsert: true, new: true });
    }

    res.json({ message: "Badges seeded", count: badges.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to seed badges" });
  }
};
