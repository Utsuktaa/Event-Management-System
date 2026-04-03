const { Schema, model } = require("mongoose");

const ClubMemberSchema = new Schema(
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
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "REJECTED"],
      default: "PENDING",
    },
    role: {
      type: String,
      enum: ["member", "club_admin", "vice_president", "president"],
      default: "member",
    },
  },
  { timestamps: true }
);

ClubMemberSchema.index({ userId: 1, clubId: 1 }, { unique: true });

module.exports = model("ClubMember", ClubMemberSchema);
