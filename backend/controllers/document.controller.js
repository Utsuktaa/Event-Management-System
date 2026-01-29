const supabase = require("../config/supabase");
const Document = require("../models/document.model");
const Club = require("../models/club.model");

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    const { clubId } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (!clubId) return res.status(400).json({ error: "No clubId provided" });

    const filePath = `documents/${clubId}/${Date.now()}-${req.file.originalname}`;

    // Upload to Supabase
    const { error } = await supabase.storage
      .from("documents")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);

    // Save document in MongoDB
    const doc = new Document({
      club: clubId,
      name: req.file.originalname,
      url: data.publicUrl,
      size: req.file.size,
      type: req.file.mimetype,
    });

    await doc.save();

    // Add reference to club
    await Club.findByIdAndUpdate(clubId, { $push: { documents: doc._id } });

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.getClubDocuments = async (req, res) => {
  try {
    const { clubId } = req.params;
    if (!clubId) return res.status(400).json({ error: "No clubId provided" });

    const club = await Club.findById(clubId).populate("documents");
    if (!club) return res.status(404).json({ error: "Club not found" });

    res.json(club.documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};
