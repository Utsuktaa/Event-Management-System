const Report = require("../models/report.model");
const ClubPost = require("../models/clubPost.model");

exports.createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason, details } = req.body;
    const reporterId = req.user.userId;

    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ message: "targetId, targetType and reason are required" });
    }

    const post = await ClubPost.findById(targetId);
    if (!post || post.status === "deleted") {
      return res.status(404).json({ message: "Target not found" });
    }

    const existing = await Report.findOne({ reporterId, targetId });
    if (existing) {
      return res.status(400).json({ message: "You have already reported this" });
    }

    const report = await Report.create({
      reporterId,
      targetId,
      targetType,
      reason,
      details: details || "",
      flags: [reason],
    });

    res.status(201).json({ message: "Report submitted", report });
  } catch (err) {
    console.error("createReport error:", err);
    res.status(500).json({ message: "Failed to submit report" });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    const aggregated = await Report.aggregate([
      { $match: { targetType: { $in: ["post", "comment"] } } },
      {
        $group: {
          _id: "$targetId",
          reportCount: { $sum: 1 },
          flags: { $addToSet: "$reason" },
          latestReport: { $max: "$createdAt" },
        },
      },
      { $sort: { latestReport: -1 } },
    ]);

    const targetIds = aggregated.map((a) => a._id);
    const posts = await ClubPost.find({ _id: { $in: targetIds } })
      .populate("authorId", "name email")
      .populate("clubId", "name")
      .lean();

    const reportMap = {};
    aggregated.forEach((a) => {
      reportMap[a._id.toString()] = {
        reportCount: a.reportCount,
        flags: a.flags,
        latestReport: a.latestReport,
      };
    });

    let merged = posts
      .filter((p) => p.status !== "deleted")
      .map((p) => ({ ...p, ...reportMap[p._id.toString()] }));

    if (search) {
      const q = search.toLowerCase();
      merged = merged.filter(
        (p) =>
          p.description?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q) ||
          p.authorId?.name?.toLowerCase().includes(q) ||
          p.clubId?.name?.toLowerCase().includes(q)
      );
    }

    const total = merged.length;
    const paginated = merged.slice(skip, skip + limit);

    res.json({ posts: paginated, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("getReportedPosts error:", err);
    res.status(500).json({ message: "Failed to fetch reported posts" });
  }
};

exports.hidePost = async (req, res) => {
  try {
    const post = await ClubPost.findByIdAndUpdate(
      req.params.postId,
      { status: "hidden" },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Report.updateMany(
      { targetId: req.params.postId, status: "pending" },
      { status: "reviewed" }
    );

    res.json({ message: "Post hidden", post });
  } catch (err) {
    console.error("hidePost error:", err);
    res.status(500).json({ message: "Failed to hide post" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await ClubPost.findByIdAndUpdate(
      req.params.postId,
      { status: "deleted" },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Report.updateMany(
      { targetId: req.params.postId, status: "pending" },
      { status: "reviewed" }
    );

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("deletePost error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

exports.restorePost = async (req, res) => {
  try {
    const post = await ClubPost.findByIdAndUpdate(
      req.params.postId,
      { status: "visible" },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post restored", post });
  } catch (err) {
    console.error("restorePost error:", err);
    res.status(500).json({ message: "Failed to restore post" });
  }
};
