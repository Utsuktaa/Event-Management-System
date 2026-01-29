const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { uploadDocument, getClubDocuments } = require("../controllers/document.controller");
const upload = require("../middlewares/upload");

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

// Get documents for club
router.get("/club/:clubId", verifyToken, getClubDocuments);

module.exports = router;
