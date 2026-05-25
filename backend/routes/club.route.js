const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const clubController = require("../controllers/club.controller");
const { verifyClubAccess } = require("../middlewares/clubAccess.middleware");
const { verifyClubAdmin } = require("../middlewares/clubAdmin.middleware");
const postController = require("../controllers/clubPost.controller");
const pollController = require("../controllers/poll.controller");

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

router.post("/:clubId/polls", verifyToken, verifyClubAccess, pollController.createPoll);
router.get("/:clubId/polls", verifyToken, verifyClubAccess, pollController.getPolls);
router.post("/:clubId/polls/:pollId/vote", verifyToken, verifyClubAccess, pollController.vote);
router.post("/:clubId/polls/:pollId/comment", verifyToken, verifyClubAccess, pollController.addComment);
router.patch("/:clubId/polls/:pollId/pin", verifyToken, verifyClubAccess, pollController.togglePin);
router.patch("/:clubId/polls/:pollId/approve", verifyToken, verifyClubAccess, pollController.approvePoll);
router.patch("/:clubId/polls/:pollId/reject", verifyToken, verifyClubAccess, pollController.rejectPoll);
router.patch("/:clubId/polls/:pollId/override-expiry", verifyToken, verifyClubAccess, pollController.overrideExpiry);
router.patch("/:clubId/polls/:pollId/convert-to-event", verifyToken, verifyClubAccess, pollController.convertToEvent);

module.exports = router;
