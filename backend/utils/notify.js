
const Notification = require("../models/notification.model");

/**
 * Create a single notification.
 * @param {string|ObjectId} userId
 * @param {string} type  - one of the enum values in notification.model.js
 * @param {string} title
 * @param {string} message
 * @param {string} [link]  - frontend route to navigate to
 * @param {object} [opts]  - { refId, refModel }
 */
async function notify(userId, type, title, message, link = null, opts = {}) {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      refId: opts.refId || null,
      refModel: opts.refModel || null,
    });
  } catch (err) {
    // Notifications are non-critical — log but don't throw
    console.error("[notify] Failed to create notification:", err.message);
  }
}

/**
 * Create the same notification for multiple users at once.
 * @param {Array<string|ObjectId>} userIds
 */
async function notifyMany(userIds, type, title, message, link = null, opts = {}) {
  if (!userIds || userIds.length === 0) return;
  try {
    const docs = userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      link,
      refId: opts.refId || null,
      refModel: opts.refModel || null,
    }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error("[notifyMany] Failed to create notifications:", err.message);
  }
}

module.exports = { notify, notifyMany };
