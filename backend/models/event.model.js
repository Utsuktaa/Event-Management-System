const { Schema, model } = require("mongoose");

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },

    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: false,
    },

    visibility: {
      type: String,
      enum: ["club", "school"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Event", EventSchema);
