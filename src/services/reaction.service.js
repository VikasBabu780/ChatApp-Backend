import mongoose from "mongoose";

import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

import { ensureUsersCanInteract } from "../utils/block.utils.js";

import ApiError from "../utils/ApiError.js";

/**
 * =========================================================
 * ALLOWED REACTIONS
 * =========================================================
 *
 * The frontend can use an emoji picker.
 * The backend still validates the selected emoji.
 */

const ALLOWED_REACTIONS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "😡",
  "👏",
  "🔥",
  "🎉",
  "🙏",
];

/**
 * =========================================================
 * ADD / CHANGE REACTION
 * =========================================================
 */

export const addReaction = async (userId, messageId, emoji) => {
  /**
   * Validate message ID
   */

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  /**
   * Validate emoji
   */

  if (!ALLOWED_REACTIONS.includes(emoji)) {
    throw new ApiError(400, "Unsupported reaction.");
  }

  /**
   * Find message
   */

  const message = await Message.findOne({
    _id: messageId,
    isDeletedForEveryone: false,
  });

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * Verify chat membership
   */

  const chat = await Chat.findOne({
    _id: message.chat,
    isDeleted: false,
    "participants.user": userId,
  }).select("_id");

  if (!chat) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  /**
   * =======================================================
   * BLOCK SECURITY
   * =======================================================
   *
   * Prevent reacting to a user's message when either
   * user has blocked the other.
   */

  await ensureUsersCanInteract(userId, message.sender);

  /**
   * Check existing reaction
   */

  const existingReaction = message.reactions.find((reaction) =>
    reaction.user.equals(userId),
  );

  if (existingReaction) {
    /**
     * User already reacted with
     * the same emoji.
     */

    if (existingReaction.emoji === emoji) {
      return {
        message: "Reaction already exists.",

        data: message,
      };
    }

    /**
     * User is changing reaction.
     */

    existingReaction.emoji = emoji;
  } else {
    /**
     * New reaction.
     */

    message.reactions.push({
      user: userId,
      emoji,
    });
  }

  /**
   * Save message
   */

  await message.save();

  /**
   * Populate reaction users
   */

  const updatedMessage = await Message.findById(message._id)
    .populate("sender", "publicId fullName username avatar")
    .populate("reactions.user", "publicId fullName username avatar");

  return {
    message: "Reaction added successfully.",

    data: updatedMessage,
  };
};

/**
 * =========================================================
 * REMOVE REACTION
 * =========================================================
 */

export const removeReaction = async (userId, messageId) => {
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
    isDeletedForEveryone: false,
  });

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * Verify chat membership
   */

  const chat = await Chat.findOne({
    _id: message.chat,
    isDeleted: false,
    "participants.user": userId,
  }).select("_id");

  if (!chat) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  /**
   * =======================================================
   * BLOCK SECURITY
   * =======================================================
   */

  await ensureUsersCanInteract(userId, message.sender);

  /**
   * Check whether user has reacted
   */

  const reactionExists = message.reactions.some((reaction) =>
    reaction.user.equals(userId),
  );

  if (!reactionExists) {
    throw new ApiError(400, "You have not reacted to this message.");
  }

  /**
   * Remove user's reaction
   */

  message.reactions = message.reactions.filter(
    (reaction) => !reaction.user.equals(userId),
  );

  /**
   * Save message
   */

  await message.save();

  /**
   * Populate updated message
   */

  const updatedMessage = await Message.findById(message._id)
    .populate("sender", "publicId fullName username avatar")
    .populate("reactions.user", "publicId fullName username avatar");

  return {
    message: "Reaction removed successfully.",

    data: updatedMessage,
  };
};

/**
 * =========================================================
 * GET REACTIONS
 * =========================================================
 */

export const getMessageReactions = async (userId, messageId) => {
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
    isDeletedForEveryone: false,
  }).populate("reactions.user", "publicId fullName username avatar");

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * Verify chat membership
   */

  const chat = await Chat.findOne({
    _id: message.chat,
    isDeleted: false,
    "participants.user": userId,
  }).select("_id");

  if (!chat) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  /**
   * Reading reactions does not require
   * a block interaction check.
   */

  return {
    message: "Reactions fetched successfully.",

    data: {
      messageId: message._id,
      reactions: message.reactions,
    },
  };
};

/**
 * =========================================================
 * EXPORT ALLOWED REACTIONS
 * =========================================================
 */

export { ALLOWED_REACTIONS };
