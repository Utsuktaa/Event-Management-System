const { Schema, model } = require("mongoose");

const ClubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Club", ClubSchema);
