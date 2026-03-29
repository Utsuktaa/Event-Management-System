const { Schema, model } = require("mongoose");

const ReportSchema = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "scam", "other"],
      required: true,
    },
    details: {
      type: String,
      default: "",
    },
    flags: [
      {
        type: String,
        enum: ["spam", "harassment", "scam", "other"],
      },
    ],
    status: {
      type: String,
      enum: ["pending", "reviewed", "ignored"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = model("Report", ReportSchema);
