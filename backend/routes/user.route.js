const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getUserActivity, getUserClubs, getRecommendedEvents } = require("../controllers/user.controller");

router.get("/activity", verifyToken, getUserActivity);
router.get("/clubs", verifyToken, getUserClubs);
router.get("/recommended-events", verifyToken, getRecommendedEvents);

module.exports = router;
