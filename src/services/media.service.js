import mongoose from "mongoose";

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

import ApiError from "../utils/ApiError.js";

import { MESSAGE_TYPES } from "../constants/chat.constants.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { fileSizeLimits } from "../middlewares/multer.middleware.js";

import { getIO } from "../sockets/index.js";

/**
 * =========================================================
 * MEDIA CONFIGURATION
 * =========================================================
 */

const MEDIA_TYPES = {
  IMAGE: {
    resourceType: "image",
  },

  VIDEO: {
    resourceType: "video",
  },

  AUDIO: {
    resourceType: "video",
  },

  DOCUMENT: {
    resourceType: "raw",
  },
};

/**
 * =========================================================
 * DOCUMENT MIME TYPES
 * =========================================================
 */

const DOCUMENT_MIME_TYPES = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",
];

/**
 * =========================================================
 * CHECK MIME TYPE
 * =========================================================
 */

const isValidMimeType = (type, mimeType) => {
  switch (type) {
    case MESSAGE_TYPES.IMAGE:
      return mimeType.startsWith("image/");

    case MESSAGE_TYPES.VIDEO:
      return mimeType.startsWith("video/");

    case MESSAGE_TYPES.AUDIO:
      return mimeType.startsWith("audio/");

    case MESSAGE_TYPES.DOCUMENT:
      return DOCUMENT_MIME_TYPES.includes(mimeType);

    default:
      return false;
  }
};

/**
 * =========================================================
 * CREATE MEDIA MESSAGE
 * =========================================================
 */

export const sendMediaMessage = async (
  senderId,
  { chatId, type, content = "", replyTo = null },
  file,
) => {
  /**
   * -------------------------------------------------------
   * Validate chat ID
   * -------------------------------------------------------
   */

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  /**
   * -------------------------------------------------------
   * Validate message type
   * -------------------------------------------------------
   */

  if (!Object.values(MESSAGE_TYPES).includes(type)) {
    throw new ApiError(400, "Invalid message type.");
  }

  /**
   * -------------------------------------------------------
   * Only media types allowed
   * -------------------------------------------------------
   */

  const allowedMediaTypes = [
    MESSAGE_TYPES.IMAGE,
    MESSAGE_TYPES.VIDEO,
    MESSAGE_TYPES.AUDIO,
    MESSAGE_TYPES.DOCUMENT,
  ];

  if (!allowedMediaTypes.includes(type)) {
    throw new ApiError(400, "Invalid media message type.");
  }

  /**
   * -------------------------------------------------------
   * File required
   * -------------------------------------------------------
   */

  if (!file) {
    throw new ApiError(400, "Media file is required.");
  }

  /**
   * -------------------------------------------------------
   * Validate MIME type
   * -------------------------------------------------------
   */

  if (!isValidMimeType(type, file.mimetype)) {
    throw new ApiError(400, `File type does not match ${type} message type.`);
  }

  /**
   * -------------------------------------------------------
   * Validate file size
   * -------------------------------------------------------
   */

  const maximumSize = fileSizeLimits[type];

  if (maximumSize && file.size > maximumSize) {
    const maxMB = (maximumSize / (1024 * 1024)).toFixed(0);

    throw new ApiError(400, `${type} file cannot exceed ${maxMB} MB.`);
  }

  /**
   * -------------------------------------------------------
   * Validate chat
   * -------------------------------------------------------
   */

  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  /**
   * -------------------------------------------------------
   * Verify sender is participant
   * -------------------------------------------------------
   */

  const isParticipant = chat.participants.some((participant) =>
    participant.user.equals(senderId),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  /**
   * -------------------------------------------------------
   * Validate reply message
   * -------------------------------------------------------
   */

  let replyMessage = null;

  if (replyTo) {
    if (!mongoose.Types.ObjectId.isValid(replyTo)) {
      throw new ApiError(400, "Invalid reply message ID.");
    }

    replyMessage = await Message.findOne({
      _id: replyTo,
      chat: chatId,
      isDeletedForEveryone: false,
    });

    if (!replyMessage) {
      throw new ApiError(404, "Reply message not found.");
    }
  }

  /**
   * -------------------------------------------------------
   * Determine Cloudinary resource type
   * -------------------------------------------------------
   */

  const mediaConfig = MEDIA_TYPES[type];

  if (!mediaConfig) {
    throw new ApiError(400, "Unsupported media type.");
  }

  /**
   * -------------------------------------------------------
   * Bypass Cloudinary for local dev
   * -------------------------------------------------------
   */
  const uploadResult = {
    public_id: "local_" + Date.now(),
    secure_url: file.path
  };

  /**
   * -------------------------------------------------------
   * Create message
   * -------------------------------------------------------
   */

  const message = await Message.create({
    chat: chatId,

    sender: senderId,

    type,

    content: typeof content === "string" ? content.trim() : "",

    attachment: {
      public_id: uploadResult.public_id,

      url: uploadResult.secure_url,

      fileName: file.originalname,

      fileSize: file.size,
    },

    replyTo: replyMessage ? replyMessage._id : null,
  });

  /**
   * -------------------------------------------------------
   * Update latest message
   * -------------------------------------------------------
   */

  chat.lastMessage = message._id;

  chat.updatedAt = new Date();

  await chat.save();

  /**
   * -------------------------------------------------------
   * Populate message
   * -------------------------------------------------------
   */

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "publicId fullName username avatar")
    .populate("chat")
    .populate({
      path: "replyTo",
      populate: {
        path: "sender",
        select: "publicId fullName username avatar",
      },
    });

  /**
   * -------------------------------------------------------
   * Emit socket event
   * -------------------------------------------------------
   */
  chat.participants.forEach((participant) => {
    if (participant.user.toString() !== senderId.toString()) {
      getIO()
        .to(`user:${participant.user.toString()}`)
        .emit("message received", populatedMessage);
    }
  });

  /**
   * -------------------------------------------------------
   * Return
   * -------------------------------------------------------
   */

  return {
    message: "Media message sent successfully.",

    data: populatedMessage,
  };
};
