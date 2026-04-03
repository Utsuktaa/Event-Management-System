const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const isSuperAdmin = require("../middlewares/isSuperAdmin");
const {
  createReport,
  getReportedPosts,
  hidePost,
  deletePost,
  restorePost,
} = require("../controllers/report.controller");

// User routes
router.post("/", verifyToken, createReport);

// Admin-only routes
router.get("/admin/posts", verifyToken, isSuperAdmin, getReportedPosts);
router.patch("/admin/posts/:postId/hide", verifyToken, isSuperAdmin, hidePost);
router.patch("/admin/posts/:postId/restore", verifyToken, isSuperAdmin, restorePost);
router.delete("/admin/posts/:postId", verifyToken, isSuperAdmin, deletePost);

module.exports = router;
