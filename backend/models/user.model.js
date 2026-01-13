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
      required: true,
      default: "normal",
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

module.exports = User;
