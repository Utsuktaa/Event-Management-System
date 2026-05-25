const Poll = require("../models/poll.model");
const Event = require("../models/event.model");
const ClubMember = require("../models/ClubMember");
const { hasPermission } = require("../utils/permissions");
const crypto = require("crypto");
const QRCode = require("qrcode");

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const TRUST_THRESHOLD = 3;

async function getMembership(clubId, userId) {
  return ClubMember.findOne({ clubId, userId, status: "ACTIVE" });
}

async function isPlatformAdmin(user) {
  return user.role === "admin" || user.role === "superadmin";
}

async function canManagePolls(user, membership) {
  if (await isPlatformAdmin(user)) return true;
  return membership && hasPermission(membership.role, "manage_polls");
}

async function countApprovedPolls(clubId, userId) {
  return Poll.countDocuments({
    clubId,
    createdBy: userId,
    status: { $in: ["approved", "closed"] },
    createdAt: { $exists: true },
  });
}

async function shouldAutoApprove(user, membership, clubId, userId) {
  if (await canManagePolls(user, membership)) return true;
  const approvedCount = await countApprovedPolls(clubId, userId);
  return approvedCount >= TRUST_THRESHOLD;
}

async function maintainPoll(poll) {
  const now = new Date();
  const updates = {};

  const expired = poll.status !== "closed" && new Date(poll.expiryDate) <= now;
  const autoApprove =
    poll.status === "pending" &&
    new Date(poll.createdAt).getTime() + TWO_HOURS_MS <= now.getTime();

  if (expired) {
    updates.status = "closed";
  } else if (autoApprove) {
    updates.status = "approved";
  }

  if (Object.keys(updates).length > 0) {
    return Poll.findByIdAndUpdate(poll._id, updates, { new: true });
  }
  return poll;
}

function getTotalVotes(poll) {
  return poll.options.reduce((sum, opt) => sum + opt.voters.length, 0);
}

function getWinningOptionIndex(poll) {
  if (!poll.options.length) return -1;
  let maxVotes = -1;
  let winnerIdx = 0;
  poll.options.forEach((opt, idx) => {
    if (opt.voters.length > maxVotes) {
      maxVotes = opt.voters.length;
      winnerIdx = idx;
    }
  });
  return winnerIdx;
}

function getUserVotes(poll, userId) {
  const votes = [];
  poll.options.forEach((opt, idx) => {
    if (opt.voters.some((v) => v.toString() === userId.toString())) {
      votes.push(idx);
    }
  });
  return votes;
}

function sanitizePoll(poll, userId, canManage) {
  const obj = poll.toObject ? poll.toObject() : { ...poll };
  const isClosed = obj.status === "closed";
  const showResults = !obj.showResultsAfterClose || isClosed;
  const hideVoters = obj.isAnonymous && !canManage;
  const originalOptions = obj.options;

  obj.totalVotes = getTotalVotes({ options: originalOptions });
  obj.winningOptionIndex = showResults ? getWinningOptionIndex({ options: originalOptions }) : -1;
  obj.userVotes = userId ? getUserVotes({ options: originalOptions }, userId) : [];

  obj.options = originalOptions.map((opt) => {
    const voteCount = opt.voters?.length || 0;
    const sanitized = {
      _id: opt._id,
      text: opt.text,
      voteCount,
    };

    if (showResults) {
      const total = obj.totalVotes;
      sanitized.percentage = total > 0 ? Math.round((voteCount / total) * 100) : 0;
    }

    if (!hideVoters && opt.voters?.length) {
      sanitized.voters = opt.voters.map((v) =>
        v._id ? { _id: v._id, name: v.name } : v,
      );
    }

    return sanitized;
  });

  obj.showResults = showResults;
  obj.isClosed = isClosed;
  obj.canVote =
    !isClosed &&
    new Date(obj.expiryDate) > new Date() &&
    obj.status !== "closed";

  if (obj.comments) {
    obj.comments = obj.comments.map((c) => ({
      _id: c._id,
      text: c.text,
      createdAt: c.createdAt,
      authorId: c.authorId?._id
        ? { _id: c.authorId._id, name: c.authorId.name }
        : c.authorId,
    }));
  }

  return obj;
}

exports.createPoll = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;
    const {
      question,
      options,
      type = "standard",
      customType,
      expiryDate,
      isAnonymous = false,
      allowMultipleVotes = false,
      allowVoteChange = true,
      showResultsAfterClose = false,
    } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
      return res.status(400).json({ message: "Provide 2 to 6 options" });
    }
    if (!expiryDate) {
      return res.status(400).json({ message: "Expiry date is required" });
    }
  if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    const membership = await getMembership(clubId, userId);
    if (!(await isPlatformAdmin(req.user))) {
      if (!membership || !hasPermission(membership.role, "create_poll")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    const autoApprove = await shouldAutoApprove(req.user, membership, clubId, userId);

    const poll = await Poll.create({
      clubId,
      question: question.trim(),
      options: options.map((text) => ({ text: text.trim(), voters: [] })),
      type: type === "other" ? "other" : type,
      customType: type === "other" ? customType?.trim() : undefined,
      expiryDate: new Date(expiryDate),
      isAnonymous,
      allowMultipleVotes,
      allowVoteChange,
      showResultsAfterClose,
      status: autoApprove ? "approved" : "pending",
      createdBy: userId,
    });

    const populated = await Poll.findById(poll._id)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    const canManage = await canManagePolls(req.user, membership);
    res.status(201).json(sanitizePoll(populated, userId, canManage));
  } catch (err) {
    console.error("Create poll error:", err);
    res.status(500).json({ message: "Failed to create poll" });
  }
};

exports.getPolls = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;
    const membership = await getMembership(clubId, userId);
    const canManage = await canManagePolls(req.user, membership);

    let polls = await Poll.find({ clubId })
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name")
      .sort({ pinned: -1, pinnedAt: -1, createdAt: -1 });

    await Promise.all(polls.map((p) => maintainPoll(p)));

    polls = await Poll.find({ clubId })
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name")
      .sort({ pinned: -1, pinnedAt: -1, createdAt: -1 });

    res.json(
      polls.map((p) => sanitizePoll(p, userId, canManage)),
    );
  } catch (err) {
    console.error("Get polls error:", err);
    res.status(500).json({ message: "Failed to fetch polls" });
  }
};

exports.vote = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const userId = req.user.userId;
    const { optionIndices } = req.body;

    if (!Array.isArray(optionIndices) || optionIndices.length === 0) {
      return res.status(400).json({ message: "Select at least one option: optionIndices required" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    await maintainPoll(poll);
    const fresh = await Poll.findById(pollId);
    if (fresh.status === "closed" || new Date(fresh.expiryDate) <= new Date()) {
      return res.status(400).json({ message: "Poll is closed" });
    }

    const membership = await getMembership(clubId, userId);
    if (!(await isPlatformAdmin(req.user)) && !membership) {
      return res.status(403).json({ message: "Not a club member" });
    }

    const validIndices = optionIndices.filter(
      (i) => Number.isInteger(i) && i >= 0 && i < fresh.options.length,
    );
    if (validIndices.length === 0) {
      return res.status(400).json({ message: "Invalid option selection" });
    }

    if (!fresh.allowMultipleVotes && validIndices.length > 1) {
      return res.status(400).json({ message: "This poll allows only one vote" });
    }

    const existingVotes = getUserVotes(fresh, userId);
    if (existingVotes.length > 0 && !fresh.allowVoteChange) {
      return res.status(400).json({ message: "Vote changes are not allowed" });
    }

    fresh.options.forEach((opt) => {
      opt.voters = opt.voters.filter((v) => v.toString() !== userId.toString());
    });

    validIndices.forEach((idx) => {
      if (!fresh.options[idx].voters.some((v) => v.toString() === userId.toString())) {
        fresh.options[idx].voters.push(userId);
      }
    });

    await fresh.save();

    const populated = await Poll.findById(pollId)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    const canManage = await canManagePolls(req.user, membership);
    res.json(sanitizePoll(populated, userId, canManage));
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to submit vote" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const userId = req.user.userId;
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const membership = await getMembership(clubId, userId);
    if (!(await isPlatformAdmin(req.user)) && !membership) {
      return res.status(403).json({ message: "Not a club member" });
    }

    poll.comments.push({ authorId: userId, text: text.trim() });
    await poll.save();

    const populated = await Poll.findById(pollId)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    const canManage = await canManagePolls(req.user, membership);
    res.status(201).json(sanitizePoll(populated, userId, canManage));
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const userId = req.user.userId;
    const membership = await getMembership(clubId, userId);

    if (!(await canManagePolls(req.user, membership))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.pinned = !poll.pinned;
    poll.pinnedAt = poll.pinned ? new Date() : null;
    await poll.save();

    const populated = await Poll.findById(pollId)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    const canManage = true;
    res.json(sanitizePoll(populated, userId, canManage));
  } catch (err) {
    console.error("Pin poll error:", err);
    res.status(500).json({ message: "Failed to update pin" });
  }
};

exports.approvePoll = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const userId = req.user.userId;
    const membership = await getMembership(clubId, userId);

    if (!(await canManagePolls(req.user, membership))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.status === "closed") {
      return res.status(400).json({ message: "Cannot approve a closed poll" });
    }

    poll.status = "approved";
    await poll.save();

    const populated = await Poll.findById(pollId)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    res.json(sanitizePoll(populated, userId, true));
  } catch (err) {
    console.error("Approve poll error:", err);
    res.status(500).json({ message: "Failed to approve poll" });
  }
};

exports.rejectPoll = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const membership = await getMembership(clubId, req.user.userId);

    if (!(await canManagePolls(req.user, membership))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    await Poll.findByIdAndDelete(pollId);
    res.json({ message: "Poll removed" });
  } catch (err) {
    console.error("Reject poll error:", err);
    res.status(500).json({ message: "Failed to remove poll" });
  }
};

exports.overrideExpiry = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const { expiryDate, closeNow } = req.body;
    const userId = req.user.userId;
    const membership = await getMembership(clubId, userId);

    if (!(await canManagePolls(req.user, membership))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (closeNow) {
      poll.status = "closed";
    } else if (expiryDate) {
      poll.expiryDate = new Date(expiryDate);
      if (new Date(expiryDate) > new Date() && poll.status === "closed") {
        poll.status = "approved";
      }
    } else {
      return res.status(400).json({ message: "Provide expiryDate or closeNow" });
    }

    await poll.save();

    const populated = await Poll.findById(pollId)
      .populate("createdBy", "name")
      .populate("comments.authorId", "name")
      .populate("options.voters", "name");

    res.json(sanitizePoll(populated, userId, true));
  } catch (err) {
    console.error("Override expiry error:", err);
    res.status(500).json({ message: "Failed to update expiry" });
  }
};

exports.convertToEvent = async (req, res) => {
  try {
    const { clubId, pollId } = req.params;
    const userId = req.user.userId;
    const membership = await getMembership(clubId, userId);

    if (!(await canManagePolls(req.user, membership))) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll || poll.clubId.toString() !== clubId) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.type !== "event") {
      return res.status(400).json({ message: "Only event-type polls can be converted" });
    }

    if (poll.convertedEventId) {
      return res.status(400).json({ message: "Poll already converted to an event" });
    }

    const winnerIdx = getWinningOptionIndex(poll);
    if (winnerIdx < 0) {
      return res.status(400).json({ message: "No winning option found" });
    }

    const winningOption = poll.options[winnerIdx];

    const eventDraft = {
      title: winningOption.text,
      description: poll.question,
      date: poll.expiryDate,
      visibility: "club",
      clubId,
      location: "",
    };

    if (req.body.createEvent) {
      const { title, description, date, location, imageUrl, latitude, longitude, attendanceRadius } =
        req.body;

      const qrToken = crypto.randomBytes(16).toString("hex");
      const event = await Event.create({
        title: title || winningOption.text,
        description: description || poll.question,
        date: new Date(date || poll.expiryDate),
        location: location || "",
        visibility: "club",
        clubId,
        createdBy: userId,
        imageUrl: imageUrl || "",
        qrToken,
        latitude,
        longitude,
        attendanceRadius,
      });

      poll.convertedEventId = event._id;
      await poll.save();

      const scanUrl = `http://localhost:3000/scan?eventId=${event._id}&token=${event.qrToken}`;
      const qrImage = await QRCode.toDataURL(scanUrl);

      return res.status(201).json({
        event,
        qr: qrImage,
        eventDraft,
        pollId: poll._id,
      });
    }

    res.json({ eventDraft, winningOptionIndex: winnerIdx, pollId: poll._id });
  } catch (err) {
    console.error("Convert to event error:", err);
    res.status(500).json({ message: "Failed to convert poll to event" });
  }
};
