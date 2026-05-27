const User = require("../models/user.model");
const Badge = require("../models/badge.model");
const Attendance = require("../models/attendance.model");
const ClubMember = require("../models/ClubMember");
const ClubPost = require("../models/clubPost.model");
const Event = require("../models/event.model");
// notify is required lazily inside checkAndUnlockBadges to avoid circular deps

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
      // same day, no streak change
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

  const [attendanceCount, clubCount, postCount, replyCount, hostedCount] = await Promise.all([
    Attendance.countDocuments({ studentId: user._id }),
    ClubMember.countDocuments({ userId: user._id, status: "ACTIVE" }),
    ClubPost.countDocuments({ authorId: user._id, parentId: null, status: "visible" }),
    ClubPost.countDocuments({ authorId: user._id, parentId: { $ne: null }, status: "visible" }),
    Event.countDocuments({ createdBy: user._id }),
  ]);

  for (const badge of allBadges) {
    if (unlockedIds.has(badge._id.toString())) continue;

    let unlocked = false;

    if (badge.conditionType === "xp"              && user.xp >= badge.conditionValue)          unlocked = true;
    if (badge.conditionType === "events_attended"  && attendanceCount >= badge.conditionValue)  unlocked = true;
    if (badge.conditionType === "clubs_joined"     && clubCount >= badge.conditionValue)        unlocked = true;
    if (badge.conditionType === "streak"           && user.streak >= badge.conditionValue)      unlocked = true;
    if (badge.conditionType === "first_club"       && clubCount >= 1)                           unlocked = true;
    if (badge.conditionType === "posts"            && postCount >= badge.conditionValue)        unlocked = true;
    if (badge.conditionType === "replies"          && replyCount >= badge.conditionValue)       unlocked = true;
    if (badge.conditionType === "host_event"       && hostedCount >= badge.conditionValue)      unlocked = true;

    if (unlocked) newBadges.push(badge._id);
  }

  if (newBadges.length > 0) {
    await User.findByIdAndUpdate(user._id, { $addToSet: { badges: { $each: newBadges } } });

    // Notify user for each newly unlocked badge
    try {
      const { notify } = require("./notify");
      const earnedBadges = allBadges.filter((b) => newBadges.some((id) => id.toString() === b._id.toString()));
      for (const badge of earnedBadges) {
        await notify(
          user._id,
          "new_badge",
          `Badge unlocked: ${badge.icon} ${badge.name}`,
          badge.description,
          "/stats"
        );
      }
    } catch (e) {
      console.error("[gamification] badge notify failed:", e.message);
    }
  }
}

function getLevelFromXP(xp) {
  if (xp < 50)   return { level: 1, title: "Newcomer",    nextLevelXP: 50   };
  if (xp < 150)  return { level: 2, title: "Explorer",    nextLevelXP: 150  };
  if (xp < 300)  return { level: 3, title: "Contributor", nextLevelXP: 300  };
  if (xp < 500)  return { level: 4, title: "Achiever",    nextLevelXP: 500  };
  if (xp < 750)  return { level: 5, title: "Champion",    nextLevelXP: 750  };
  if (xp < 1000) return { level: 6, title: "Legend",      nextLevelXP: 1000 };
  return { level: 7, title: "Elite", nextLevelXP: null };
}

const BADGE_DEFINITIONS = [
  { name: "First Step",          description: "You joined your first club",                       icon: "🏅", conditionType: "first_club",       conditionValue: 1    },
  { name: "Explorer",            description: "You attended your first event",                    icon: "🔍", conditionType: "events_attended",  conditionValue: 1    },
  { name: "Social Starter",      description: "You posted your first discussion",                 icon: "💬", conditionType: "posts",            conditionValue: 1    },
  { name: "Active Member",       description: "You attended 5 events",                           icon: "⭐", conditionType: "events_attended",  conditionValue: 5    },
  { name: "Dedicated",           description: "You attended 10 events",                          icon: "🎯", conditionType: "events_attended",  conditionValue: 10   },
  { name: "Super Active",        description: "You attended 15 events",                          icon: "🔥", conditionType: "events_attended",  conditionValue: 15   },
  { name: "Event Addict",        description: "You attended 30 events",                          icon: "🏆", conditionType: "events_attended",  conditionValue: 30   },
  { name: "Club Lover",          description: "You joined 3 clubs",                              icon: "❤️", conditionType: "clubs_joined",     conditionValue: 3    },
  { name: "Networker",           description: "You joined 5 clubs",                              icon: "🤝", conditionType: "clubs_joined",     conditionValue: 5    },
  { name: "Community Builder",   description: "You joined 8 clubs",                              icon: "🏗️", conditionType: "clubs_joined",     conditionValue: 8    },
  { name: "Discussion Starter",  description: "You posted 5 discussions",                        icon: "📢", conditionType: "posts",            conditionValue: 5    },
  { name: "Influencer",          description: "You posted 20 discussions",                       icon: "📣", conditionType: "posts",            conditionValue: 20   },
  { name: "Helpful Member",      description: "You replied to 10 posts",                         icon: "🙋", conditionType: "replies",          conditionValue: 10   },
  { name: "Voice of the Club",   description: "You replied to 25 posts",                         icon: "🎙️", conditionType: "replies",          conditionValue: 25   },
  { name: "On Fire",             description: "You kept a 7-day activity streak",                icon: "🔥", conditionType: "streak",           conditionValue: 7    },
  { name: "2 Week Streak",       description: "You kept a 14-day activity streak",               icon: "📅", conditionType: "streak",           conditionValue: 14   },
  { name: "5 Week Streak",       description: "You kept a 35-day activity streak",               icon: "🗓️", conditionType: "streak",           conditionValue: 35   },
  { name: "10 Week Streak",      description: "You kept a 70-day activity streak",               icon: "💎", conditionType: "streak",           conditionValue: 70   },
  { name: "Organizer",           description: "You hosted your first event",                     icon: "📋", conditionType: "host_event",       conditionValue: 1    },
  { name: "Leader",              description: "You hosted 5 events",                             icon: "👑", conditionType: "host_event",       conditionValue: 5    },
  { name: "Century",             description: "You reached 100 XP",                              icon: "💯", conditionType: "xp",               conditionValue: 100  },
  { name: "Rising Star",         description: "You reached 500 XP",                              icon: "🌟", conditionType: "xp",               conditionValue: 500  },
  { name: "High Achiever",       description: "You reached 1000 XP",                             icon: "🥇", conditionType: "xp",               conditionValue: 1000 },
  { name: "Elite",               description: "You reached 5000 XP",                             icon: "🚀", conditionType: "xp",               conditionValue: 5000 },
  { name: "Early Bird",          description: "Register for an event within 1 hour of posting",  icon: "🐦", conditionType: "early_bird",       conditionValue: 1    },
];

/**
 * Ensures all badge definitions exist in the DB.
 * Called once on server startup — safe to run repeatedly (upsert).
 */
async function ensureBadgesSeeded() {
  try {
    for (const badge of BADGE_DEFINITIONS) {
      await Badge.findOneAndUpdate({ name: badge.name }, badge, { upsert: true, new: true });
    }
    console.log(`[gamification] ${BADGE_DEFINITIONS.length} badges ensured in DB`);
  } catch (err) {
    console.error("[gamification] Failed to seed badges:", err.message);
  }
}

module.exports = { awardXP, getLevelFromXP, XP_VALUES, ensureBadgesSeeded, BADGE_DEFINITIONS };
