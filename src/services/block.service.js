import mongoose from "mongoose";

import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * =========================================================
 * FIND USER
 * =========================================================
 */

const findUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

/**
 * =========================================================
 * BLOCK USER
 * =========================================================
 */

export const blockUser = async (userId, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid target user ID.");
  }
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot block yourself.");
  }

  const user = await findUser(userId);
  const targetUser = await findUser(targetUserId);

  const alreadyBlocked = (user.blockedUsers || []).some((id) =>
    id.equals(targetUser._id),
  );

  if (alreadyBlocked) {
    throw new ApiError(400, "User is already blocked.");
  }

  if (!user.blockedUsers) user.blockedUsers = [];
  user.blockedUsers.push(targetUser._id);

  const alreadyBlockedBy = (targetUser.blockedBy || []).some((id) =>
    id.equals(user._id),
  );

  if (!alreadyBlockedBy) {
    if (!targetUser.blockedBy) targetUser.blockedBy = [];
    targetUser.blockedBy.push(user._id);
  }

  await user.save();
  await targetUser.save();

  return {
    message: "User blocked successfully.",
    data: {
      userId: user._id,
      blockedUserId: targetUser._id,
    },
  };
};

/**
 * =========================================================
 * UNBLOCK USER
 * =========================================================
 */

export const unblockUser = async (userId, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid target user ID.");
  }
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "Invalid user.");
  }

  const user = await findUser(userId);
  const targetUser = await findUser(targetUserId);

  const isBlocked = (user.blockedUsers || []).some((id) => id.equals(targetUser._id));

  if (!isBlocked) {
    throw new ApiError(400, "User is not blocked.");
  }

  user.blockedUsers = (user.blockedUsers || []).filter(
    (id) => !id.equals(targetUser._id),
  );

  targetUser.blockedBy = (targetUser.blockedBy || []).filter(
    (id) => !id.equals(user._id),
  );

  await user.save();
  await targetUser.save();

  return {
    message: "User unblocked successfully.",
    data: {
      userId: user._id,
      unblockedUserId: targetUser._id,
    },
  };
};

/**
 * =========================================================
 * GET BLOCKED USERS
 * =========================================================
 */

export const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId).populate(
    "blockedUsers",
    "publicId fullName username avatar",
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return {
    message: "Blocked users fetched successfully.",

    data: user.blockedUsers,
  };
};

/**
 * =========================================================
 * CHECK BLOCK STATUS
 * =========================================================
 */

export const getBlockStatus = async (userId, targetUserId) => {
  /**
   * Validate IDs
   */

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid target user ID.");
  }

  /**
   * Prevent checking yourself
   */

  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, "You cannot check block status with yourself.");
  }

  /**
   * Fetch only required fields
   */

  const user = await User.findById(userId).select("blockedUsers blockedBy");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const targetUser = await User.findById(targetUserId).select(
    "blockedUsers blockedBy",
  );

  if (!targetUser) {
    throw new ApiError(404, "Target user not found.");
  }

  /**
   * Current user blocked target
   */

  const isBlocked = (user.blockedUsers || []).some((id) => id.equals(targetUser._id));

  /**
   * Target blocked current user
   */

  const isBlockedBy = (targetUser.blockedBy || []).some((id) => id.equals(user._id));

  return {
    message: "Block status fetched successfully.",

    data: {
      isBlocked,
      isBlockedBy,
      canInteract: !isBlocked && !isBlockedBy,
    },
  };
};

/**
 * =========================================================
 * GET BLOCK RELATIONSHIP
 * =========================================================
 *
 * Useful internally for sockets/services.
 * Does not expose unnecessary user information.
 * =========================================================
 */

export const getBlockRelationship = async (userId, targetUserId) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(targetUserId)
  ) {
    throw new ApiError(400, "Invalid user ID.");
  }

  const user = await User.findById(userId).select("blockedUsers");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const targetUser = await User.findById(targetUserId).select("blockedUsers");

  if (!targetUser) {
    throw new ApiError(404, "Target user not found.");
  }

  const isBlocked = (user.blockedUsers || []).some((id) => id.equals(targetUser._id));

  const isBlockedBy = (targetUser.blockedBy || []).some((id) => id.equals(user._id));

  return {
    isBlocked,
    isBlockedBy,
    canInteract: !isBlocked && !isBlockedBy,
  };
};
