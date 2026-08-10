import mongoose from "mongoose";

import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import ApiError from "../utils/ApiError.js";

/**
 * =========================================================
 * SEARCH USERS
 * =========================================================
 */

export const searchUsers = async (userId, search, page = 1, limit = 20) => {
  const query = search?.trim();

  if (!query) {
    throw new ApiError(400, "Search query is required.");
  }

  if (query.length < 2) {
    throw new ApiError(400, "Search query must contain at least 2 characters.");
  }

  page = Math.max(1, Number(page) || 1);

  limit = Math.min(50, Math.max(1, Number(limit) || 20));

  const skip = (page - 1) * limit;

  /**
   * Case-insensitive search
   */
  const regex = new RegExp(escapeRegex(query), "i");

  const filter = {
    _id: {
      $ne: userId,
    },

    $or: [
      {
        username: regex,
      },
      {
        fullName: regex,
      },
      {
        email: regex,
      },
    ],
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("publicId fullName username avatar")
      .skip(skip)
      .limit(limit)
      .sort({
        username: 1,
      }),

    User.countDocuments(filter),
  ]);

  return {
    message: "Users fetched successfully.",

    data: {
      users,

      pagination: {
        total,
        page,
        limit,

        totalPages: Math.ceil(total / limit),

        hasNext: page * limit < total,
      },
    },
  };
};

/**
 * =========================================================
 * SEARCH CHATS
 * =========================================================
 */

export const searchChats = async (userId, search, page = 1, limit = 20) => {
  const query = search?.trim();

  if (!query) {
    throw new ApiError(400, "Search query is required.");
  }

  if (query.length < 2) {
    throw new ApiError(400, "Search query must contain at least 2 characters.");
  }

  page = Math.max(1, Number(page) || 1);

  limit = Math.min(50, Math.max(1, Number(limit) || 20));

  const skip = (page - 1) * limit;

  const regex = new RegExp(escapeRegex(query), "i");

  /**
   * Only chats where the user
   * is a participant.
   */
  const filter = {
    isDeleted: false,

    "participants.user": userId,

    $or: [
      {
        name: regex,
      },
      {
        publicId: regex,
      },
    ],
  };

  const [chats, total] = await Promise.all([
    Chat.find(filter)
      .populate("participants.user", "publicId fullName username avatar")
      .populate("lastMessage")
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Chat.countDocuments(filter),
  ]);

  return {
    message: "Chats fetched successfully.",

    data: {
      chats,

      pagination: {
        total,
        page,
        limit,

        totalPages: Math.ceil(total / limit),

        hasNext: page * limit < total,
      },
    },
  };
};

/**
 * =========================================================
 * SEARCH MESSAGES
 * =========================================================
 */

export const searchMessages = async (
  userId,
  search,
  chatId = null,
  page = 1,
  limit = 30,
) => {
  const query = search?.trim();

  if (!query) {
    throw new ApiError(400, "Search query is required.");
  }

  if (query.length < 2) {
    throw new ApiError(400, "Search query must contain at least 2 characters.");
  }

  page = Math.max(1, Number(page) || 1);

  limit = Math.min(50, Math.max(1, Number(limit) || 30));

  const skip = (page - 1) * limit;

  /**
   * Verify chat if chatId
   * was supplied.
   */
  if (chatId) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new ApiError(400, "Invalid chat ID.");
    }

    const chat = await Chat.findOne({
      _id: chatId,
      isDeleted: false,
      "participants.user": userId,
    }).select("_id");

    if (!chat) {
      throw new ApiError(404, "Chat not found.");
    }
  }

  /**
   * Find only chats where
   * current user participates.
   */
  const userChats = await Chat.find({
    isDeleted: false,
    "participants.user": userId,
  }).select("_id");

  const chatIds = userChats.map((chat) => chat._id);

  const regex = new RegExp(escapeRegex(query), "i");

  const filter = {
    chat: chatId
      ? chatId
      : {
          $in: chatIds,
        },

    type: "TEXT",

    content: regex,

    isDeletedForEveryone: false,

    deletedFor: {
      $ne: userId,
    },
  };

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .populate("sender", "publicId fullName username avatar")
      .populate("chat", "publicId type name")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Message.countDocuments(filter),
  ]);

  return {
    message: "Messages fetched successfully.",

    data: {
      messages,

      pagination: {
        total,
        page,
        limit,

        totalPages: Math.ceil(total / limit),

        hasNext: page * limit < total,
      },
    },
  };
};

/**
 * =========================================================
 * ESCAPE REGEX
 * =========================================================
 */

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
