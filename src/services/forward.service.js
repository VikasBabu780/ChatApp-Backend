import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import { ensureUsersCanInteract } from "../utils/block.utils.js";

import ApiError from "../utils/ApiError.js";

import { MESSAGE_TYPES } from "../constants/chat.constants.js";

/**
 * =========================================================
 * FORWARD MESSAGE
 * =========================================================
 */

export const forwardMessage = async (userId, messageId, destinationChatId) => {
  /**
   * =======================================================
   * VALIDATE MESSAGE ID
   * =======================================================
   */

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  /**
   * =======================================================
   * VALIDATE DESTINATION CHAT ID
   * =======================================================
   */

  if (!mongoose.Types.ObjectId.isValid(destinationChatId)) {
    throw new ApiError(400, "Invalid destination chat ID.");
  }

  /**
   * =======================================================
   * FIND ORIGINAL MESSAGE
   * =======================================================
   */

  const originalMessage = await Message.findOne({
    _id: messageId,
    isDeletedForEveryone: false,
  });

  if (!originalMessage) {
    throw new ApiError(404, "Message not found.");
  }

  /**
   * =======================================================
   * BLOCK SECURITY — ORIGINAL SENDER
   * =======================================================
   *
   * A user should not be able to bypass a block by
   * forwarding the blocked user's message.
   */

  await ensureUsersCanInteract(userId, originalMessage.sender);

  /**
   * =======================================================
   * FIND SOURCE CHAT
   * =======================================================
   */

  const sourceChat = await Chat.findOne({
    _id: originalMessage.chat,
    isDeleted: false,
    "participants.user": userId,
  }).select("_id publicId type name participants");

  if (!sourceChat) {
    throw new ApiError(403, "You are not a participant of the source chat.");
  }

  /**
   * =======================================================
   * FIND DESTINATION CHAT
   * =======================================================
   */

  const destinationChat = await Chat.findOne({
    _id: destinationChatId,
    isDeleted: false,
    "participants.user": userId,
  });

  if (!destinationChat) {
    throw new ApiError(
      403,
      "You are not a participant of the destination chat.",
    );
  }

  /**
   * =======================================================
   * BLOCK SECURITY — PRIVATE DESTINATION
   * =======================================================
   *
   * For a private chat, check the other participant.
   *
   * Group chats are intentionally not blocked here.
   * Blocking someone does not remove either user from
   * a shared group.
   */

  if (destinationChat.type === "PRIVATE") {
    const otherParticipant = destinationChat.participants.find(
      (participant) => !participant.user.equals(userId),
    );

    if (otherParticipant) {
      await ensureUsersCanInteract(userId, otherParticipant.user);
    }
  }

  /**
   * =======================================================
   * CREATE FORWARDED MESSAGE
   * =======================================================
   */

  const forwardedMessage = await Message.create({
    chat: destinationChat._id,

    sender: userId,

    type: originalMessage.type,

    content: originalMessage.content,

    attachment: originalMessage.attachment
      ? {
          public_id: originalMessage.attachment?.public_id || "",

          url: originalMessage.attachment?.url || "",

          fileName: originalMessage.attachment?.fileName || "",

          fileSize: originalMessage.attachment?.fileSize || 0,
        }
      : undefined,

    isForwarded: true,
  });

  /**
   * =======================================================
   * UPDATE DESTINATION CHAT
   * =======================================================
   */

  destinationChat.lastMessage = forwardedMessage._id;

  destinationChat.updatedAt = new Date();

  await destinationChat.save();

  /**
   * =======================================================
   * POPULATE FORWARDED MESSAGE
   * =======================================================
   */

  const populatedMessage = await Message.findById(
    forwardedMessage._id,
  ).populate("sender", "publicId fullName username avatar");

  /**
   * =======================================================
   * RETURN
   * =======================================================
   */

  return {
    message: "Message forwarded successfully.",

    data: populatedMessage,
  };
};
