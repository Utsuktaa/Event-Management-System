const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const clubController = require("../controllers/club.controller");

router.get("/", verifyToken, clubController.getAllClubsWithAdminFlag);

module.exports = router;
