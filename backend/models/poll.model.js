const { Schema, model } = require("mongoose");

const pollOptionSchema = new Schema(
  {
    text: { type: String, required: true },
    voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true },
);

const pollCommentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const pollSchema = new Schema(
  {
    clubId: { type: Schema.Types.ObjectId, ref: "Club", required: true, index: true },
    question: { type: String, required: true },
    options: {
      type: [pollOptionSchema],
      validate: {
        validator(v) {
          return v.length >= 2 && v.length <= 6;
        },
        message: "Poll must have between 2 and 6 options",
      },
    },
    type: {
      type: String,
      enum: ["standard", "event", "feedback", "other"],
      default: "standard",
    },
    customType: { type: String },
    expiryDate: { type: Date, required: true },
    isAnonymous: { type: Boolean, default: false },
    allowMultipleVotes: { type: Boolean, default: false },
    allowVoteChange: { type: Boolean, default: true },
    showResultsAfterClose: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "closed"],
      default: "pending",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pinned: { type: Boolean, default: false },
    pinnedAt: { type: Date },
    comments: [pollCommentSchema],
    convertedEventId: { type: Schema.Types.ObjectId, ref: "Event" },
  },
  { timestamps: true },
);

pollSchema.index({ clubId: 1, pinned: -1, createdAt: -1 });

module.exports = model("Poll", pollSchema);
