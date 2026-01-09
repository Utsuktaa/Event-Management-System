const { Schema, model } = require("mongoose");

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    imageUrl: { type: String },
    visibility: {
      type: String,
      enum: ["club", "school"],
      required: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: function () {
        return this.visibility === "club";
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Event", EventSchema);
