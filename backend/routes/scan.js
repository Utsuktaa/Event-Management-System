const express = require("express");
const router = express.Router();

router.get("/scan", (req, res) => {
  const { eventId, token } = req.query;

  const frontendUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const redirectUrl = `${frontendUrl}/scan?eventId=${eventId}&token=${token}`;

  return res.redirect(redirectUrl);
});

module.exports = router;
