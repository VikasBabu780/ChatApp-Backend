import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import ApiError from "../utils/ApiError.js";

import { CHAT_TYPES, PARTICIPANT_ROLES } from "../constants/chat.constants.js";

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const PINNED_MESSAGE_LIMIT = 50;

/**
 * =========================================================
 * HELPER — GET CHAT PARTICIPANT
 * =========================================================
 */

const getParticipant = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
    "participants.user": userId,
  });

  if (!chat) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  const participant = chat.participants.find((item) =>
    item.user.equals(userId),
  );

  if (!participant) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  return {
    chat,
    participant,
  };
};

/**
 * =========================================================
 * HELPER — CHECK PIN PERMISSION
 * =========================================================
 */

const checkPinPermission = (chat, participant) => {
  /**
   * Private chats:
   * Both participants can pin.
   */

  if (chat.type === CHAT_TYPES.PRIVATE) {
    return;
  }

  /**
   * Group chats:
   * Only ADMIN / OWNER can pin.
   */

  const allowedRoles = [PARTICIPANT_ROLES.ADMIN, PARTICIPANT_ROLES.OWNER];

  if (!allowedRoles.includes(participant.role)) {
    throw new ApiError(403, "Only group admins can pin messages.");
  }
};

/**
 * =========================================================
 * PIN MESSAGE
 * =========================================================
 */

export const pinMessage = async (userId, messageId) => {
  /**
   * Validate message ID
   */

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  /**
   * Find message
   */

  const message = await Message.findOne({
    _id: messageId,
  });

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * Deleted messages cannot be pinned
   */

  if (message.isDeletedForEveryone) {
    throw new ApiError(400, "Deleted messages cannot be pinned.");
  }

  /**
   * Verify chat membership
   */

  const { chat, participant } = await getParticipant(message.chat, userId);

  /**
   * Check permission
   */

  checkPinPermission(chat, participant);

  /**
   * Already pinned
   */

  if (message.isPinned) {
    throw new ApiError(400, "Message is already pinned.");
  }

  /**
   * Check maximum pinned messages
   */

  const pinnedCount = await Message.countDocuments({
    chat: chat._id,
    isPinned: true,
    isDeletedForEveryone: false,
  });

  if (pinnedCount >= PINNED_MESSAGE_LIMIT) {
    throw new ApiError(
      400,
      `A chat can have a maximum of ${PINNED_MESSAGE_LIMIT} pinned messages.`,
    );
  }

  /**
   * Pin message
   */

  message.isPinned = true;

  message.pinnedAt = new Date();

  message.pinnedBy = userId;

  await message.save();

  /**
   * Populate information
   */

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "publicId fullName username avatar")
    .populate("pinnedBy", "publicId fullName username avatar");

  return {
    message: "Message pinned successfully.",

    data: populatedMessage,
  };
};

/**
 * =========================================================
 * UNPIN MESSAGE
 * =========================================================
 */

export const unpinMessage = async (userId, messageId) => {
  /**
   * Validate message ID
   */

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  /**
   * Find message
   */

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * Verify membership
   */

  const { chat, participant } = await getParticipant(message.chat, userId);

  /**
   * Check permission
   */

  checkPinPermission(chat, participant);

  /**
   * Check pinned status
   */

  if (!message.isPinned) {
    throw new ApiError(400, "Message is not pinned.");
  }

  /**
   * Unpin
   */

  message.isPinned = false;

  message.pinnedAt = null;

  message.pinnedBy = null;

  await message.save();

  return {
    message: "Message unpinned successfully.",

    data: null,
  };
};

/**
 * =========================================================
 * GET PINNED MESSAGES
 * =========================================================
 */

export const getPinnedMessages = async (userId, chatId) => {
  /**
   * Validate chat ID
   */

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  /**
   * Verify membership
   */

  await getParticipant(chatId, userId);

  /**
   * Find pinned messages
   */

  const messages = await Message.find({
    chat: chatId,
    isPinned: true,
    isDeletedForEveryone: false,
  })
    .populate("sender", "publicId fullName username avatar")
    .populate("pinnedBy", "publicId fullName username avatar")
    .sort({
      pinnedAt: -1,
    });

  return {
    message: "Pinned messages fetched successfully.",

    data: messages,
  };
};
