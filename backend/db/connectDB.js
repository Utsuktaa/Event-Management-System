const mongoose = require("mongoose");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connection Successful");

    const existingSuperAdmin = await User.findOne({ role: "superadmin" });
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPERADMIN_PASSWORD,
        10
      );
      const superAdmin = new User({
        name: "superadmin",
        email: "superadmin@example.com",
        password: hashedPassword,
        role: "superadmin",
      });
      await superAdmin.save();
      console.log("Superadmin Created Successfully");
    }
  } catch (error) {
    console.error("DB Connection Error", error);
  }
};

module.exports = connectDB;
