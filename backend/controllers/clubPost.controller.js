const ClubPost = require("../models/clubPost.model");

exports.createPost = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;
    const { title, description, parentId = null } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description required" });
    }

    if (!parentId && (!title || !title.trim())) {
      return res.status(400).json({ message: "Title required" });
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

    const posts = await ClubPost.find({ clubId })
      .populate("authorId", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};
