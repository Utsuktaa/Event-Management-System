const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  //console.log("Auth Header:", authHeader);

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(401).json({ errorMsg: "Token is not valid!" });
      req.user = user;
      return next();
    });
  } else {
    return res.status(401).json({ errorMsg: "You are not Authenticated!" });
  }
};

module.exports = { verifyToken };
