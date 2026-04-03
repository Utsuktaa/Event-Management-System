module.exports = function (req, res, next) {
  const { role } = req.user;
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
