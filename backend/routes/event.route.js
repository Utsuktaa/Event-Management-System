const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const eventController = require("../controllers/event.controller");

router.post("/", verifyToken, eventController.createEvent);
router.get("/school-events", eventController.getEvents);
router.get("/club/:clubId", eventController.getEventsByClub);

router.post(
  "/:eventId/register",
  verifyToken,
  eventController.registerForEvent
);
router.get(
  "/registrations",
  verifyToken,
  eventController.getStudentRegistrations
);

module.exports = router;
