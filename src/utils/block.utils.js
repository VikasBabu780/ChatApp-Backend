import mongoose from "mongoose";

import User from "../models/User.js";
import ApiError from "./ApiError.js";

/**
 * =========================================================
 * CHECK BLOCK STATUS
 * =========================================================
 *
 * Returns true if either user has blocked the other.
 *
 * userId       → current user
 * targetUserId → other user
 */

export const areUsersBlocked = async (userId, targetUserId) => {
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(targetUserId)
  ) {
    return false;
  }

  const blocked = await User.exists({
    $or: [
      {
        _id: userId,
        blockedUsers: targetUserId,
      },
      {
        _id: targetUserId,
        blockedUsers: userId,
      },
    ],
  });

  return Boolean(blocked);
};

/**
 * =========================================================
 * ENSURE USERS CAN INTERACT
 * =========================================================
 */

export const ensureUsersCanInteract = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    return;
  }

  const blocked = await areUsersBlocked(userId, targetUserId);

  if (blocked) {
    throw new ApiError(
      403,
      "You cannot interact with this user because one of you has blocked the other.",
    );
  }
};
