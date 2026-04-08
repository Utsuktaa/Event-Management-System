const {
  register,
  login,
  googleAuth,
} = require("../controllers/auth.controller");

const router = require("express").Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/google", googleAuth);

module.exports = router;
