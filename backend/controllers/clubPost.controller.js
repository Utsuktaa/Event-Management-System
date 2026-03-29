const ClubPost = require("../models/clubPost.model");
const ClubMember = require("../models/ClubMember");
const { hasPermission } = require("../utils/permissions");

exports.createPost = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;
    const { title, description, parentId = null } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description required" });
    }

    if (!parentId && (!title || !title.trim())) {
      return res.status(400).json({ message: "Title required for top-level posts" });
    }

    if (req.user.role !== "admin") {
      const membership = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
      if (!membership || !hasPermission(membership.role, "create_post")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    if (parentId) {
      const parent = await ClubPost.findById(parentId);
      if (!parent || parent.clubId.toString() !== clubId) {
        return res.status(400).json({ message: "Invalid parent post" });
      }
    }

    const post = await ClubPost.create({
      clubId,
      authorId: userId,
      title: parentId ? undefined : title,
      description,
      parentId,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

exports.getClubPosts = async (req, res) => {
  try {
    const { clubId } = req.params;
    const posts = await ClubPost.find({ clubId, status: "visible" })
      .populate("authorId", "name")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { clubId, postId } = req.params;
    const userId = req.user.userId;

    const post = await ClubPost.findById(postId);
    if (!post || post.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user.role !== "admin") {
      const membership = await ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
      const isAuthor = post.authorId.toString() === userId;
      const canModerate = membership && hasPermission(membership.role, "delete_post");
      if (!isAuthor && !canModerate) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    await ClubPost.findByIdAndUpdate(postId, { status: "deleted" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};
