const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({ message: "Password must include uppercase, lowercase, and a number." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
    });

    await user.save();
    res.status(201).json({ message: "Account created successfully. Please log in." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "No account found with this email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const googleAuth = catchAsync(async (req, res, next) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: "Missing credential" });

  const tokenInfoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );
  const userData = await tokenInfoRes.json();

  if (!tokenInfoRes.ok || userData.error) {
    return res.status(401).json({ message: "Invalid Google token" });
  }

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
    expiresIn: "7d",
  });

  res.json({ token, email: user.email, name: user.name, role: user.role });
});

module.exports = { register, login, googleAuth };
