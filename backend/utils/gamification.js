const User = require("../models/user.model");
const Badge = require("../models/badge.model");
const Attendance = require("../models/attendance.model");
const ClubMember = require("../models/ClubMember");

const XP_VALUES = {
  join_club: 15,
  register_event: 5,
  attend_event: 20,
  post_discussion: 10,
  comment: 5,
  daily_activity: 5,
};

async function awardXP(userId, action) {
  const amount = XP_VALUES[action];
  if (!amount) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await User.findById(userId);
  if (!user) return;

  let streakBonus = 0;
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

  if (lastActive) {
    const lastDay = new Date(lastActive);
    lastDay.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
    } else if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1;
      streakBonus = XP_VALUES.daily_activity;
    } else {
      user.streak = 1;
      streakBonus = XP_VALUES.daily_activity;
    }
  } else {
    user.streak = 1;
    streakBonus = XP_VALUES.daily_activity;
  }

  user.xp = (user.xp || 0) + amount + streakBonus;
  user.lastActiveDate = new Date();
  await user.save();

  await checkAndUnlockBadges(user);
}

async function checkAndUnlockBadges(user) {
  const allBadges = await Badge.find();
  const unlockedIds = new Set((user.badges || []).map((b) => b.toString()));
  const newBadges = [];

  const [attendanceCount, clubCount] = await Promise.all([
    Attendance.countDocuments({ studentId: user._id }),
    ClubMember.countDocuments({ userId: user._id, status: "ACTIVE" }),
  ]);

  for (const badge of allBadges) {
    if (unlockedIds.has(badge._id.toString())) continue;

    let unlocked = false;

    if (badge.conditionType === "xp" && user.xp >= badge.conditionValue) unlocked = true;
    if (badge.conditionType === "events_attended" && attendanceCount >= badge.conditionValue) unlocked = true;
    if (badge.conditionType === "clubs_joined" && clubCount >= badge.conditionValue) unlocked = true;
    if (badge.conditionType === "streak" && user.streak >= badge.conditionValue) unlocked = true;
    if (badge.conditionType === "first_club" && clubCount >= 1) unlocked = true;

    if (unlocked) newBadges.push(badge._id);
  }

  if (newBadges.length > 0) {
    await User.findByIdAndUpdate(user._id, { $addToSet: { badges: { $each: newBadges } } });
  }
}

function getLevelFromXP(xp) {
  if (xp < 50) return { level: 1, title: "Newcomer", nextLevelXP: 50 };
  if (xp < 150) return { level: 2, title: "Explorer", nextLevelXP: 150 };
  if (xp < 300) return { level: 3, title: "Contributor", nextLevelXP: 300 };
  if (xp < 500) return { level: 4, title: "Achiever", nextLevelXP: 500 };
  if (xp < 750) return { level: 5, title: "Champion", nextLevelXP: 750 };
  if (xp < 1000) return { level: 6, title: "Legend", nextLevelXP: 1000 };
  return { level: 7, title: "Elite", nextLevelXP: null };
}

module.exports = { awardXP, getLevelFromXP, XP_VALUES };
