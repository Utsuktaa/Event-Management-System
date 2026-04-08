const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getUserActivity, getUserClubs, getRecommendedEvents, getAttendanceStats } = require("../controllers/user.controller");

router.get("/activity", verifyToken, getUserActivity);
router.get("/clubs", verifyToken, getUserClubs);
router.get("/recommended-events", verifyToken, getRecommendedEvents);
router.get("/attendance-stats", verifyToken, getAttendanceStats);

module.exports = router;
