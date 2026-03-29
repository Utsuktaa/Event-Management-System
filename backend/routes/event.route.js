const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const eventController = require("../controllers/event.controller");

router.post("/", verifyToken, eventController.createEvent);
router.get("/school-events", eventController.getEvents);
router.get("/club/:clubId", eventController.getEventsByClub);

// Analytics routes
router.get(
  "/analytics/overview",
  verifyToken,
  eventController.getAnalyticsOverview,
);
router.get(
  "/analytics/monthly",
  verifyToken,
  eventController.getMonthlyAnalytics,
);
router.get(
  "/analytics/visibility",
  verifyToken,
  eventController.getVisibilityDistribution,
);

router.post(
  "/:eventId/register",
  verifyToken,
  eventController.registerForEvent,
);
router.get(
  "/registrations",
  verifyToken,
  eventController.getStudentRegistrations,
);
router.post("/attendance", verifyToken, eventController.markAttendance);

module.exports = router;
