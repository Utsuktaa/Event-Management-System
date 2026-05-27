const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { uploadDocument, getClubDocuments, deleteDocument } = require("../controllers/document.controller");
const upload = require("../middlewares/upload");

router.post("/upload", verifyToken, upload.single("file"), uploadDocument);

// Get documents for club
router.get("/club/:clubId", verifyToken, getClubDocuments);

// Delete a document (club admins only)
router.delete("/:documentId", verifyToken, deleteDocument);

module.exports = router;
