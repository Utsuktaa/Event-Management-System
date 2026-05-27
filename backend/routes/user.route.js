const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getUserActivity,
  getUserClubs,
  getRecommendedEvents,
  getAttendanceStats,
  getProfile,
  updateProfile,
} = require("../controllers/user.controller");

router.get("/activity",            verifyToken, getUserActivity);
router.get("/clubs",               verifyToken, getUserClubs);
router.get("/recommended-events",  verifyToken, getRecommendedEvents);
router.get("/attendance-stats",    verifyToken, getAttendanceStats);
router.get("/profile",             verifyToken, getProfile);
router.patch("/profile",           verifyToken, updateProfile);

module.exports = router;
