const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin");
const {
  createReport,
  getReportedPosts,
  hidePost,
  deletePost,
  restorePost,
} = require("../controllers/report.controller");

router.post("/", verifyToken, createReport);

router.get("/admin/posts", verifyToken, isAdmin, getReportedPosts);
router.patch("/admin/posts/:postId/hide", verifyToken, isAdmin, hidePost);
router.patch("/admin/posts/:postId/restore", verifyToken, isAdmin, restorePost);
router.delete("/admin/posts/:postId", verifyToken, isAdmin, deletePost);

module.exports = router;
