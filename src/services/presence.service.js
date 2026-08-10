import User from "../models/User.js";

/**
 * Mark user as online
 */
export const markUserOnline = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      isOnline: true,
    },
    {
      new: true,
    }
  );
};

/**
 * Mark user as offline
 */
export const markUserOffline = async (userId) => {
  const lastSeen = new Date();

  await User.findByIdAndUpdate(
    userId,
    {
      isOnline: false,
      lastSeen,
    }
  );

  return lastSeen;
};