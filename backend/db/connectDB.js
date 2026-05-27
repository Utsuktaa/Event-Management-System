const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connection Successful");

    // Always sync superadmin credentials from env vars
    const hashedPassword = await bcrypt.hash(
      process.env.SUPERADMIN_PASSWORD,
      10
    );
    await User.findOneAndUpdate(
      { role: "superadmin" },
      {
        name: "superadmin",
        email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
        password: hashedPassword,
        role: "superadmin",
      },
      { upsert: true, new: true }
    );
    console.log("Superadmin credentials synced");
  } catch (error) {
    console.error("DB Connection Error", error);
  }
};

module.exports = connectDB;
