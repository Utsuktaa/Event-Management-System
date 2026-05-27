const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/notification.controller");

router.use(verifyToken);

router.get("/",                    ctrl.getNotifications);
router.get("/unread-count",        ctrl.getUnreadCount);
router.patch("/read-all",          ctrl.markAllRead);
router.patch("/:id/read",          ctrl.markRead);
router.delete("/",                 ctrl.clearAll);
router.delete("/:id",              ctrl.deleteOne);

module.exports = router;
