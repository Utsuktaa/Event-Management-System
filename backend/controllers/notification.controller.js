const Notification = require("../models/notification.model");

/** GET /api/notifications — paginated, newest first */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const skip = parseInt(req.query.skip) || 0;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId, read: false }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/** PATCH /api/notifications/:id/read — mark one as read */
exports.markRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

/** PATCH /api/notifications/read-all — mark all as read */
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

/** DELETE /api/notifications/:id — delete one */
exports.deleteOne = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

/** DELETE /api/notifications — clear all */
exports.clearAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear notifications" });
  }
};

/** GET /api/notifications/unread-count — lightweight poll for badge */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};
