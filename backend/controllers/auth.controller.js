const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const { getOAuth2Client } = require("../utils/getOAuth2Client");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const googleAuth = catchAsync(async (req, res, next) => {
  const code = req.query.code;
  const oauth2Client = getOAuth2Client();
  const googleRes = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(googleRes.tokens);
  const userRes = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`,
    { method: "GET" }
  );

  const userData = await userRes.json();

  let user = await User.findOne({ email: userData.email });

  if (!user) {
    user = await User.create({
      name: userData.name,
      email: userData.email,
      password: await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10),
      role: "student",
    });
  }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token, email: user.email, name: user.name, role: user.role });
});

module.exports = { register, login, googleAuth };
