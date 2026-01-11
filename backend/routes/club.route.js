const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const clubController = require("../controllers/club.controller");
const { verifyClubAccess } = require("../middlewares/clubAccess.middleware");
const { verifyClubAdmin } = require("../middlewares/clubAdmin.middleware");

router.get("/", verifyToken, clubController.getAllClubsWithAdminFlag);

router.get(
  "/:clubId",
  verifyToken,
  verifyClubAccess,
  clubController.getClubDashboard
);

router.post("/:clubId/join", verifyToken, clubController.joinClub);

router.get(
  "/:clubId/requests",
  verifyToken,
  verifyClubAdmin,
  clubController.getPendingJoinRequests
);

router.patch(
  "/:clubId/requests/:memberId/approve",
  verifyToken,
  verifyClubAdmin,
  clubController.approveJoinRequest
);

module.exports = router;
