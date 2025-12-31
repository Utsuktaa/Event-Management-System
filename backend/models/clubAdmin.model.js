const { Schema, model } = require("mongoose");

const ClubAdminSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
  },
  { timestamps: true }
);

ClubAdminSchema.index({ userId: 1, clubId: 1 }, { unique: true });

module.exports = model("ClubAdmin", ClubAdminSchema);
