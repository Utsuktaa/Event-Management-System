const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getLeaderboard } = require("../controllers/leaderboard.controller");

router.get("/", verifyToken, getLeaderboard);

module.exports = router;
