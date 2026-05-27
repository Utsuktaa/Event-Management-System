const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const statsController = require("../controllers/stats.controller");

router.get("/me", verifyToken, statsController.getMyStats);
router.get("/navbar", verifyToken, statsController.getNavbarStats);
router.get("/leaderboard", verifyToken, statsController.getLeaderboard);
router.post("/leaderboard/join", verifyToken, statsController.joinLeaderboard);
router.post("/leaderboard/leave", verifyToken, statsController.leaveLeaderboard);
router.post("/seed-badges", statsController.seedBadges);

module.exports = router;
