const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const clubController = require("../controllers/club.controller");
const { verifyClubAccess } = require("../middlewares/clubAccess.middleware");
const { verifyClubAdmin } = require("../middlewares/clubAdmin.middleware");
const postController = require("../controllers/clubPost.controller");

router.get("/", verifyToken, clubController.getAllClubsWithAdminFlag);

router.get("/:clubId", verifyToken, verifyClubAccess, clubController.getClubDashboard);

router.post("/:clubId/join", verifyToken, clubController.joinClub);

router.get("/:clubId/members", verifyToken, verifyClubAccess, clubController.getClubMembers);

router.get("/:clubId/requests", verifyToken, verifyClubAdmin, clubController.getPendingJoinRequests);

router.patch("/:clubId/requests/:memberId/approve", verifyToken, verifyClubAdmin, clubController.approveJoinRequest);

router.patch("/:clubId/requests/:memberId/reject", verifyToken, verifyClubAdmin, clubController.rejectJoinRequest);

router.patch("/:clubId/members/:memberId/role", verifyToken, verifyClubAccess, clubController.assignRole);

router.patch("/:clubId/policy", verifyToken, verifyClubAccess, clubController.updateJoinPolicy);

router.post("/:clubId/posts", verifyToken, verifyClubAccess, postController.createPost);

router.get("/:clubId/posts", verifyToken, verifyClubAccess, postController.getClubPosts);

router.delete("/:clubId/posts/:postId", verifyToken, verifyClubAccess, postController.deletePost);

module.exports = router;
