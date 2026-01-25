const { Schema, model } = require("mongoose");

const clubPostSchema = new Schema(
  {
    clubId: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: function () {
        return this.parentId === null;
      },
    },
    description: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ClubPost",
      default: null,
    },
  },
  { timestamps: true },
);

clubPostSchema.index({ clubId: 1, createdAt: -1 });

module.exports = model("ClubPost", clubPostSchema);
