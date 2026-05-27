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
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    isInLeaderboard: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

module.exports = User;
