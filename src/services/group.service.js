import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

import { CHAT_TYPES, PARTICIPANT_ROLES } from "../constants/chat.constants.js";

/**
 * =========================================================
 * CREATE GROUP
 * =========================================================
 */
export const createGroup = async (
  creatorId,
  { name, description = "", memberIds = [] },
) => {
  if (!name || !name.trim()) {
    throw new ApiError(400, "Group name is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(creatorId)) {
    throw new ApiError(400, "Invalid creator ID.");
  }

  // Remove duplicate members
  const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];

  // Creator should not be added twice
  const filteredMemberIds = uniqueMemberIds.filter(
    (id) => id !== creatorId.toString(),
  );

  // Validate all member IDs
  for (const memberId of filteredMemberIds) {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new ApiError(400, `Invalid member ID: ${memberId}`);
    }
  }

  // Creator + at least one member
  if (filteredMemberIds.length < 1) {
    throw new ApiError(400, "A group must have at least two members.");
  }

  // Verify all users exist
  const users = await User.find({
    _id: {
      $in: filteredMemberIds,
    },
    isDeleted: false,
  }).select("_id privacy friends");

  if (users.length !== filteredMemberIds.length) {
    throw new ApiError(404, "One or more users were not found.");
  }

  // Enforce Group Invite Privacy
  for (const user of users) {
    const invitePermission = user.privacy?.groupInvitePermission || "FRIENDS_ONLY";
    if (invitePermission === "NOBODY") {
      throw new ApiError(403, "One or more users do not accept group invites.");
    }
    if (invitePermission === "FRIENDS_ONLY") {
      const isFriend = user.friends.some((friendId) => friendId.equals(creatorId));
      if (!isFriend) {
        throw new ApiError(403, "One or more users only accept group invites from friends.");
      }
    }
  }

  // Create group
  const group = await Chat.create({
    type: CHAT_TYPES.GROUP,

    name: name.trim(),

    description: description.trim(),

    participants: [
      {
        user: creatorId,
        role: PARTICIPANT_ROLES.OWNER,
      },

      ...filteredMemberIds.map((memberId) => ({
        user: memberId,
        role: PARTICIPANT_ROLES.MEMBER,
      })),
    ],

    createdBy: creatorId,
  });

  // Return populated group
  const populatedGroup = await Chat.findById(group._id)
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen",
    )
    .populate("createdBy", "publicId fullName username avatar");

  return {
    message: "Group created successfully.",
    data: populatedGroup,
  };
};

/**
 * =========================================================
 * GET GROUP DETAILS
 * =========================================================
 */
export const getGroupById = async (userId, groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
    "participants.user": userId,
  })
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen",
    )
    .populate("createdBy", "publicId fullName username avatar")
    .populate("lastMessage");

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  return {
    message: "Group fetched successfully.",
    data: group,
  };
};

/**
 * =========================================================
 * ADD MEMBERS
 * =========================================================
 */
export const addGroupMembers = async (userId, groupId, memberIds) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID.");
  }

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError(400, "Member IDs are required.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  // Find current user's role
  const currentParticipant = group.participants.find((participant) =>
    participant.user.equals(userId),
  );

  if (!currentParticipant) {
    throw new ApiError(403, "You are not a member of this group.");
  }

  // Only OWNER and ADMIN can add members
  if (
    currentParticipant.role !== PARTICIPANT_ROLES.OWNER &&
    currentParticipant.role !== PARTICIPANT_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Only group admins can add members.");
  }

  // Remove duplicates
  const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))];

  // Validate IDs
  for (const memberId of uniqueMemberIds) {
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      throw new ApiError(400, `Invalid member ID: ${memberId}`);
    }
  }

  // Check users
  const users = await User.find({
    _id: {
      $in: uniqueMemberIds,
    },
    isDeleted: false,
  }).select("_id privacy friends");

  if (users.length !== uniqueMemberIds.length) {
    throw new ApiError(404, "One or more users were not found.");
  }

  // Enforce Group Invite Privacy
  for (const user of users) {
    const invitePermission = user.privacy?.groupInvitePermission || "FRIENDS_ONLY";
    if (invitePermission === "NOBODY") {
      throw new ApiError(403, "One or more users do not accept group invites.");
    }
    if (invitePermission === "FRIENDS_ONLY") {
      const isFriend = user.friends.some((friendId) => friendId.equals(userId));
      if (!isFriend) {
        throw new ApiError(403, "One or more users only accept group invites from friends.");
      }
    }
  }

  // Add only users who aren't already members
  const existingIds = new Set(
    group.participants.map((participant) => participant.user.toString()),
  );

  const newMembers = uniqueMemberIds
    .filter((memberId) => !existingIds.has(memberId))
    .map((memberId) => ({
      user: memberId,
      role: PARTICIPANT_ROLES.MEMBER,
    }));

  if (newMembers.length === 0) {
    throw new ApiError(400, "All users are already members of this group.");
  }

  group.participants.push(...newMembers);

  await group.save();

  const populatedGroup = await Chat.findById(group._id).populate(
    "participants.user",
    "publicId fullName username avatar isOnline lastSeen",
  );

  return {
    message: "Members added successfully.",
    data: populatedGroup,
  };
};

/**
 * =========================================================
 * REMOVE MEMBER
 * =========================================================
 */
export const removeGroupMember = async (userId, groupId, memberId) => {
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    throw new ApiError(400, "Invalid group or member ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  const requester = group.participants.find((participant) =>
    participant.user.equals(userId),
  );

  if (!requester) {
    throw new ApiError(403, "You are not a member of this group.");
  }

  const target = group.participants.find((participant) =>
    participant.user.equals(memberId),
  );

  if (!target) {
    throw new ApiError(404, "User is not a member of this group.");
  }

  // Owner cannot be removed
  if (target.role === PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(403, "The group owner cannot be removed.");
  }

  // Admin can remove members
  if (requester.role === PARTICIPANT_ROLES.ADMIN) {
    if (target.role !== PARTICIPANT_ROLES.MEMBER) {
      throw new ApiError(403, "Admins can only remove regular members.");
    }
  }

  // Owner can remove anyone except themselves
  else if (requester.role !== PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(403, "Only group admins can remove members.");
  }

  group.participants = group.participants.filter(
    (participant) => !participant.user.equals(memberId),
  );

  // Chat model requires at least 2 participants
  if (group.participants.length < 2) {
    throw new ApiError(400, "A group must have at least two members.");
  }

  await group.save();

  return {
    message: "Member removed successfully.",
    data: null,
  };
};

/**
 * =========================================================
 * LEAVE GROUP
 * =========================================================
 */
export const leaveGroup = async (userId, groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  const participant = group.participants.find((member) =>
    member.user.equals(userId),
  );

  if (!participant) {
    throw new ApiError(403, "You are not a member of this group.");
  }

  // Owner cannot simply leave
  if (participant.role === PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(
      400,
      "Group owner cannot leave. Transfer ownership first.",
    );
  }

  group.participants = group.participants.filter(
    (member) => !member.user.equals(userId),
  );

  if (group.participants.length < 2) {
    throw new ApiError(400, "A group must have at least two members.");
  }

  await group.save();

  return {
    message: "You left the group successfully.",
    data: null,
  };
};

/**
 * =========================================================
 * MAKE ADMIN
 * =========================================================
 */
export const makeGroupAdmin = async (userId, groupId, memberId) => {
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    throw new ApiError(400, "Invalid group or member ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  const owner = group.participants.find((participant) =>
    participant.user.equals(userId),
  );

  if (!owner || owner.role !== PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(403, "Only the group owner can manage admins.");
  }

  const target = group.participants.find((participant) =>
    participant.user.equals(memberId),
  );

  if (!target) {
    throw new ApiError(404, "User is not a member of this group.");
  }

  if (target.role === PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(400, "Owner is already the highest role.");
  }

  target.role = PARTICIPANT_ROLES.ADMIN;

  await group.save();

  return {
    message: "Member promoted to admin.",
    data: null,
  };
};

/**
 * =========================================================
 * REMOVE ADMIN
 * =========================================================
 */
export const removeGroupAdmin = async (userId, groupId, memberId) => {
  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(memberId)
  ) {
    throw new ApiError(400, "Invalid group or member ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  const owner = group.participants.find((participant) =>
    participant.user.equals(userId),
  );

  if (!owner || owner.role !== PARTICIPANT_ROLES.OWNER) {
    throw new ApiError(403, "Only the group owner can manage admins.");
  }

  const target = group.participants.find((participant) =>
    participant.user.equals(memberId),
  );

  if (!target) {
    throw new ApiError(404, "User is not a member of this group.");
  }

  if (target.role !== PARTICIPANT_ROLES.ADMIN) {
    throw new ApiError(400, "User is not an admin.");
  }

  target.role = PARTICIPANT_ROLES.MEMBER;

  await group.save();

  return {
    message: "Admin privileges removed.",
    data: null,
  };
};

/**
 * =========================================================
 * UPDATE GROUP
 * =========================================================
 */
export const updateGroup = async (userId, groupId, { name, description }) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID.");
  }

  const group = await Chat.findOne({
    _id: groupId,
    type: CHAT_TYPES.GROUP,
    isDeleted: false,
  });

  if (!group) {
    throw new ApiError(404, "Group not found.");
  }

  const participant = group.participants.find((member) =>
    member.user.equals(userId),
  );

  if (!participant) {
    throw new ApiError(403, "You are not a member of this group.");
  }

  if (
    participant.role !== PARTICIPANT_ROLES.OWNER &&
    participant.role !== PARTICIPANT_ROLES.ADMIN
  ) {
    throw new ApiError(403, "Only group admins can update the group.");
  }

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiError(400, "Group name cannot be empty.");
    }

    group.name = name.trim();
  }

  if (description !== undefined) {
    group.description = description.trim();
  }

  await group.save();

  const populatedGroup = await Chat.findById(group._id).populate(
    "participants.user",
    "publicId fullName username avatar isOnline lastSeen",
  );

  return {
    message: "Group updated successfully.",
    data: populatedGroup,
  };
};
