import mongoose from "mongoose";

import User from "../models/User.js";
import Chat from "../models/Chat.js";

import ApiError from "../utils/ApiError.js";

/**
 * =========================================================
 * VERIFY CHAT MEMBERSHIP
 * =========================================================
 */

const verifyChatMembership = async (chatId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
    "participants.user": userId,
  });

  if (!chat) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  return chat;
};

/**
 * =========================================================
 * ARCHIVE CHAT
 * =========================================================
 */

export const archiveChat = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  /**
   * Check if already archived
   */

  const alreadyArchived = user.archivedChats.some((id) => id.equals(chat._id));

  if (alreadyArchived) {
    throw new ApiError(400, "Chat is already archived.");
  }

  /**
   * Add chat to user's
   * archived chats
   */

  user.archivedChats.push(chat._id);

  await user.save();

  return {
    message: "Chat archived successfully.",

    data: {
      chatId: chat._id,
      isArchived: true,
    },
  };
};

/**
 * =========================================================
 * UNARCHIVE CHAT
 * =========================================================
 */

export const unarchiveChat = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  /**
   * Check archive status
   */

  const isArchived = user.archivedChats.some((id) => id.equals(chat._id));

  if (!isArchived) {
    throw new ApiError(400, "Chat is not archived.");
  }

  /**
   * Remove chat
   */

  user.archivedChats = user.archivedChats.filter((id) => !id.equals(chat._id));

  await user.save();

  return {
    message: "Chat unarchived successfully.",

    data: {
      chatId: chat._id,
      isArchived: false,
    },
  };
};

/**
 * =========================================================
 * GET ARCHIVED CHATS
 * =========================================================
 */

export const getArchivedChats = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "archivedChats",
    match: {
      isDeleted: false,
    },
    populate: [
      {
        path: "participants.user",
        select: "publicId fullName username avatar",
      },
      {
        path: "lastMessage",
        select: "publicId sender type content createdAt",
        populate: {
          path: "sender",
          select: "publicId fullName username avatar",
        },
      },
    ],
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return {
    message: "Archived chats fetched successfully.",

    data: user.archivedChats,
  };
};

/**
 * =========================================================
 * CHECK ARCHIVE STATUS
 * =========================================================
 */

export const getArchiveStatus = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId).select("archivedChats");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isArchived = user.archivedChats.some((id) => id.equals(chat._id));

  return {
    message: "Archive status fetched successfully.",

    data: {
      chatId: chat._id,
      isArchived,
    },
  };
};
