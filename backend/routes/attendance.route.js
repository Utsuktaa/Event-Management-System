const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  markAttendance,
  getStudentAttendance,
} = require("../controllers/attendance.controller");

router.post("/mark", verifyToken, markAttendance);
// all attendance of logged in students
router.get("/my", verifyToken, getStudentAttendance);

module.exports = router;