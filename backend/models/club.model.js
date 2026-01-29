const { Schema, model } = require("mongoose");

const ClubSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true },
);

module.exports = model("Club", ClubSchema);
