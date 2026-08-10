import mongoose from "mongoose";

import User from "../models/User.js";
import Chat from "../models/Chat.js";

import ApiError from "../utils/ApiError.js";

/**
 * =========================================================
 * ALLOWED MUTE DURATIONS
 * =========================================================
 *
 * The client sends only a predefined duration.
 * The server calculates the actual expiration time.
 */

const MUTE_DURATIONS = {
  "30_MINUTES": 30 * 60 * 1000,

  "1_HOUR": 60 * 60 * 1000,

  "8_HOURS": 8 * 60 * 60 * 1000,

  "24_HOURS": 24 * 60 * 60 * 1000,

  INDEFINITE: null,
};

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
 * MUTE CHAT
 * =========================================================
 */

export const muteChat = async (userId, chatId, duration) => {
  /**
   * Verify membership
   */

  const chat = await verifyChatMembership(chatId, userId);

  /**
   * Validate duration
   */

  if (!Object.prototype.hasOwnProperty.call(MUTE_DURATIONS, duration)) {
    throw new ApiError(400, "Invalid mute duration.");
  }

  /**
   * Find user
   */

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  /**
   * Check existing mute
   */

  const existingMute = user.mutedChats.find((item) =>
    item.chat.equals(chat._id),
  );

  /**
   * Calculate expiration
   */

  let mutedUntil = null;

  if (MUTE_DURATIONS[duration] !== null) {
    mutedUntil = new Date(Date.now() + MUTE_DURATIONS[duration]);
  }

  /**
   * Update existing mute
   */

  if (existingMute) {
    existingMute.mutedUntil = mutedUntil;
  } else {
    /**
     * Create new mute
     */

    user.mutedChats.push({
      chat: chat._id,
      mutedUntil,
    });
  }

  await user.save();

  return {
    message: "Chat muted successfully.",

    data: {
      chatId: chat._id,

      isMuted: true,

      mutedUntil,
    },
  };
};

/**
 * =========================================================
 * UNMUTE CHAT
 * =========================================================
 */

export const unmuteChat = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  /**
   * Check existing mute
   */

  const existingMute = user.mutedChats.find((item) =>
    item.chat.equals(chat._id),
  );

  if (!existingMute) {
    throw new ApiError(400, "Chat is not muted.");
  }

  /**
   * Remove mute
   */

  user.mutedChats = user.mutedChats.filter(
    (item) => !item.chat.equals(chat._id),
  );

  await user.save();

  return {
    message: "Chat unmuted successfully.",

    data: {
      chatId: chat._id,

      isMuted: false,

      mutedUntil: null,
    },
  };
};

/**
 * =========================================================
 * GET MUTED CHATS
 * =========================================================
 */

export const getMutedChats = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "mutedChats.chat",

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

  /**
   * Remove expired mutes
   * from the returned result.
   */

  const now = new Date();

  const activeMutes = user.mutedChats.filter(
    (item) => item.mutedUntil === null || item.mutedUntil > now,
  );

  return {
    message: "Muted chats fetched successfully.",

    data: activeMutes,
  };
};

/**
 * =========================================================
 * GET MUTE STATUS
 * =========================================================
 */

export const getMuteStatus = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId).select("mutedChats");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const mute = user.mutedChats.find((item) => item.chat.equals(chat._id));

  /**
   * No mute
   */

  if (!mute) {
    return {
      message: "Mute status fetched successfully.",

      data: {
        chatId: chat._id,
        isMuted: false,
        mutedUntil: null,
      },
    };
  }

  /**
   * Check expiration
   */

  if (mute.mutedUntil && mute.mutedUntil <= new Date()) {
    /**
     * Automatically remove
     * expired mute.
     */

    user.mutedChats = user.mutedChats.filter(
      (item) => !item.chat.equals(chat._id),
    );

    await user.save();

    return {
      message: "Mute status fetched successfully.",

      data: {
        chatId: chat._id,
        isMuted: false,
        mutedUntil: null,
      },
    };
  }

  return {
    message: "Mute status fetched successfully.",

    data: {
      chatId: chat._id,

      isMuted: true,

      mutedUntil: mute.mutedUntil,
    },
  };
};

/**
 * =========================================================
 * EXPORT
 * =========================================================
 */

export { MUTE_DURATIONS };
