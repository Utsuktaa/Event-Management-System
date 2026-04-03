const { Schema, model, models } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "superadmin", "normal"],
      default: "student",
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

module.exports = User;
