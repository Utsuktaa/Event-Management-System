const Club = require("../models/club.model");
const ClubMember = require("../models/ClubMember");
const { hasPermission, ROLE_PERMISSIONS } = require("../utils/permissions");
const { awardXP } = require("../utils/gamification");
const { notify, notifyMany } = require("../utils/notify");

exports.getAllClubsWithAdminFlag = async (req, res) => {
  try {
    const userId = req.user.userId;
    const clubs = await Club.find();
    const memberships = await ClubMember.find({ userId });
    const membershipMap = new Map(
      memberships.map((m) => [m.clubId.toString(), m]),
    );

    const result = clubs.map((club) => {
      const membership = membershipMap.get(club._id.toString());
      return {
        _id: club._id,
        name: club.name,
        joinPolicy: club.joinPolicy,
        membershipStatus: membership?.status || "NONE",
        clubRole: membership?.role || null,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch clubs" });
  }
};

exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    if (club.joinPolicy === "CLOSED") {
      return res
        .status(403)
        .json({ message: "This club is not accepting members" });
    }

    const existing = await ClubMember.findOne({ clubId, userId });
    if (existing) {
      // Allow re-apply if previously rejected
      if (existing.status === "REJECTED") {
        await ClubMember.findByIdAndDelete(existing._id);
      } else {
        return res.status(400).json({ message: "Request already exists" });
      }
    }

    if (club.joinPolicy === "OPEN") {
      const member = await ClubMember.create({
        clubId,
        userId,
        status: "ACTIVE",
        role: "member",
      });
      await awardXP(userId, "join_club");

      // Notify club admins that a new member joined
      const admins = await ClubMember.find({
        clubId,
        status: "ACTIVE",
        role: "club_admin",
      }).select("userId");
      const adminIds = admins
        .map((a) => a.userId)
        .filter((id) => id.toString() !== userId);
      if (adminIds.length > 0) {
        await notifyMany(
          adminIds,
          "new_member_joined",
          "New member joined",
          `A new member joined ${club.name}`,
          `/clubs/${clubId}`,
          { refId: clubId, refModel: "Club" },
        );
      }

      return res.status(201).json(member);
    }

    const member = await ClubMember.create({
      clubId,
      userId,
      status: "PENDING",
      role: "member",
    });

    // Notify club admins of a pending join request
    const admins = await ClubMember.find({
      clubId,
      status: "ACTIVE",
      role: "club_admin",
    }).select("userId");
    const adminIds = admins
      .map((a) => a.userId)
      .filter((id) => id.toString() !== userId);
    if (adminIds.length > 0) {
      await notifyMany(
        adminIds,
        "pending_join_request",
        "New join request",
        `Someone requested to join ${club.name}`,
        `/clubs/${clubId}?tab=Manage&section=requests`,
        { refId: clubId, refModel: "Club" },
      );
    }

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to join club" });
  }
};

exports.getPendingJoinRequests = async (req, res) => {
  try {
    const { clubId } = req.params;
    const requests = await ClubMember.find({
      clubId,
      status: "PENDING",
    }).populate("userId", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "PENDING" },
      { status: "ACTIVE" },
      { new: true },
    );
    if (!member) return res.status(404).json({ message: "Request not found" });
    await awardXP(member.userId.toString(), "join_club");

    // Notify the user their request was approved
    const club = await Club.findById(clubId).select("name");
    await notify(
      member.userId,
      "join_request_approved",
      "Join request approved!",
      `Your request to join ${club?.name || "the club"} has been approved`,
      `/clubs/${clubId}`,
      { refId: clubId, refModel: "Club" },
    );

    // Notify other club admins that a new member joined
    const admins = await ClubMember.find({
      clubId,
      status: "ACTIVE",
      role: "club_admin",
    }).select("userId");
    const adminIds = admins
      .map((a) => a.userId)
      .filter((id) => id.toString() !== member.userId.toString());
    if (adminIds.length > 0) {
      await notifyMany(
        adminIds,
        "new_member_joined",
        "New member joined",
        `A new member joined ${club?.name || "the club"}`,
        `/clubs/${clubId}`,
        { refId: clubId, refModel: "Club" },
      );
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to approve request" });
  }
};

exports.rejectJoinRequest = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "PENDING" },
      { status: "REJECTED" },
      { new: true },
    );
    if (!member) return res.status(404).json({ message: "Request not found" });

    // Notify the user their request was rejected
    const club = await Club.findById(clubId).select("name");
    await notify(
      member.userId,
      "join_request_approved", // reuse type — frontend shows it as a notification
      "Join request declined",
      `Your request to join ${club?.name || "the club"} was not approved`,
      `/join-clubs`,
      { refId: clubId, refModel: "Club" },
    );

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to reject request" });
  }
};

exports.getClubMembers = async (req, res) => {
  try {
    const { clubId } = req.params;
    const members = await ClubMember.find({
      clubId,
      status: "ACTIVE",
    }).populate("userId", "name email");
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch members" });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.userId;

    const validRoles = ["member", "club_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be member or club_admin." });
    }

    if (!["admin", "superadmin"].includes(req.user.role)) {
      const requester = await ClubMember.findOne({
        clubId,
        userId: requesterId,
        status: "ACTIVE",
      });
      if (!requester || !hasPermission(requester.role, "assign_roles")) {
        return res
          .status(403)
          .json({ message: "Insufficient permissions to assign roles" });
      }
    }

    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "ACTIVE" },
      { role },
      { new: true },
    );
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to assign role" });
  }
};

exports.updateMemberPosition = async (req, res) => {
  try {
    const { clubId, memberId } = req.params;
    const { position } = req.body;
    const requesterId = req.user.userId;

    if (!["admin", "superadmin"].includes(req.user.role)) {
      const requester = await ClubMember.findOne({
        clubId,
        userId: requesterId,
        status: "ACTIVE",
      });
      if (!requester || !hasPermission(requester.role, "assign_roles")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    const member = await ClubMember.findOneAndUpdate(
      { _id: memberId, clubId, status: "ACTIVE" },
      { position: (position || "").trim() },
      { new: true },
    );
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Failed to update position" });
  }
};

exports.updateJoinPolicy = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { joinPolicy } = req.body;
    const userId = req.user.userId;

    const validPolicies = ["OPEN", "APPROVAL_REQUIRED", "CLOSED"];
    if (!validPolicies.includes(joinPolicy)) {
      return res.status(400).json({ message: "Invalid join policy" });
    }

    if (!["admin", "superadmin"].includes(req.user.role)) {
      const member = await ClubMember.findOne({
        clubId,
        userId,
        status: "ACTIVE",
      });
      if (!member || !hasPermission(member.role, "manage_members")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }

    const oldClub = await Club.findById(clubId).select("name joinPolicy");
    if (!oldClub) return res.status(404).json({ message: "Club not found" });

    const club = await Club.findByIdAndUpdate(
      clubId,
      { joinPolicy },
      { new: true },
    );

    // Notify all users if policy changed to OPEN (anyone can now join)
    // Notify all active members if policy changed to CLOSED
    if (oldClub.joinPolicy !== joinPolicy) {
      const User = require("../models/user.model");

      if (joinPolicy === "OPEN") {
        // Notify everyone who is NOT already an active member
        const activeMembers = await ClubMember.find({
          clubId,
          status: "ACTIVE",
        }).select("userId");
        const activeMemberIds = new Set(
          activeMembers.map((m) => m.userId.toString()),
        );
        const allUsers = await User.find({
          role: { $nin: ["admin", "superadmin"] },
        })
          .select("_id")
          .lean();
        const targetIds = allUsers
          .map((u) => u._id)
          .filter((id) => !activeMemberIds.has(id.toString()));
        if (targetIds.length > 0) {
          await notifyMany(
            targetIds,
            "join_request_approved",
            `${club.name} is now open to join!`,
            `${club.name} join now without approval.`,
            `/join-clubs`,
            { refId: clubId, refModel: "Club" },
          );
        }
      } else if (joinPolicy === "CLOSED") {
        // Notify active members that the club is now closed
        const members = await ClubMember.find({
          clubId,
          status: "ACTIVE",
        }).select("userId");
        const memberIds = members
          .map((m) => m.userId)
          .filter((id) => id.toString() !== userId);
        if (memberIds.length > 0) {
          await notifyMany(
            memberIds,
            "new_member_joined",
            `${club.name} is now closed`,
            `${club.name} has closed its membership. No new members will be accepted.`,
            `/clubs/${clubId}`,
            { refId: clubId, refModel: "Club" },
          );
        }
      } else if (joinPolicy === "APPROVAL_REQUIRED") {
        // Notify non-members that they can request to join
        const activeMembers = await ClubMember.find({
          clubId,
          status: "ACTIVE",
        }).select("userId");
        const activeMemberIds = new Set(
          activeMembers.map((m) => m.userId.toString()),
        );
        const allUsers = await User.find({
          role: { $nin: ["admin", "superadmin"] },
        })
          .select("_id")
          .lean();
        const targetIds = allUsers
          .map((u) => u._id)
          .filter((id) => !activeMemberIds.has(id.toString()));
        if (targetIds.length > 0) {
          await notifyMany(
            targetIds,
            "join_request_approved",
            `${club.name} is accepting join requests`,
            `You can now request to join ${club.name}.`,
            `/join-clubs`,
            { refId: clubId, refModel: "Club" },
          );
        }
      }
    }

    res.json(club);
  } catch (err) {
    console.error("updateJoinPolicy error:", err);
    res.status(500).json({ message: "Failed to update join policy" });
  }
};

exports.leaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    const member = await ClubMember.findOne({
      clubId,
      userId,
      status: "ACTIVE",
    });
    if (!member)
      return res
        .status(404)
        .json({ message: "You are not an active member of this club" });

    // Prevent the last club_admin from leaving if there are other members
    if (member.role === "club_admin") {
      const otherAdmins = await ClubMember.countDocuments({
        clubId,
        status: "ACTIVE",
        role: "club_admin",
        _id: { $ne: member._id },
      });
      const totalMembers = await ClubMember.countDocuments({
        clubId,
        status: "ACTIVE",
        _id: { $ne: member._id },
      });
      if (otherAdmins === 0 && totalMembers > 0) {
        return res.status(400).json({
          message: "You are the only admin. Assign another admin before leaving.",
        });
      }
    }

    await ClubMember.findByIdAndDelete(member._id);
    res.json({ message: "You have left the club" });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave club" });
  }
};

exports.getClubDashboard = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ message: "Club not found" });

    let membership = null;
    if (!["admin", "superadmin"].includes(req.user.role)) {
      membership = await ClubMember.findOne({
        clubId,
        userId,
        status: "ACTIVE",
      });
    }

    const permissions = membership
      ? ROLE_PERMISSIONS[membership.role] || []
      : ["admin", "superadmin"].includes(req.user.role)
        ? ROLE_PERMISSIONS["club_admin"]
        : [];

    res.json({
      clubId: club._id,
      name: club.name,
      joinPolicy: club.joinPolicy,
      clubRole: membership?.role || null,
      permissions,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load club dashboard" });
  }
};
