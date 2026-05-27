const { Schema, model, models } = require("mongoose");

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "new_badge",
        "reply_to_post",
        "new_poll",
        "join_request_approved",
        "new_club_event",
        "pending_join_request",
        "new_member_joined",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Where to navigate when tapped
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    // Optional reference IDs for context
    refId: { type: Schema.Types.ObjectId, default: null },
    refModel: { type: String, default: null },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Notification = models.Notification || model("Notification", NotificationSchema);
module.exports = Notification;
