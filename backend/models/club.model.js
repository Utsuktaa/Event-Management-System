const { Schema, model } = require("mongoose");

const ClubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    joinPolicy: {
      type: String,
      enum: ["OPEN", "APPROVAL_REQUIRED", "CLOSED"],
      default: "APPROVAL_REQUIRED",
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Club", ClubSchema);
