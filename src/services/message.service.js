import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import ApiError from "../utils/ApiError.js";
import { MESSAGE_TYPES } from "../constants/chat.constants.js";
import { ensureUsersCanInteract } from "../utils/block.utils.js";
import { getIO } from "../sockets/index.js";

export const sendMessage = async (senderId, payload) => {
  const { chatId, type, content, replyTo } = payload;

  // Validate chat id
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  // Find chat
  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  // User must be a participant
  const isParticipant = chat.participants.some((participant) =>
    participant.user.equals(senderId),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat.");
  }

  /**
   * =========================================================
   * BLOCK SECURITY
   * =========================================================
   */

  if (chat.type === "PRIVATE") {
    const otherParticipant = chat.participants.find(
      (participant) => !participant.user.equals(senderId),
    );

    if (otherParticipant) {
      await ensureUsersCanInteract(senderId, otherParticipant.user);
    }
  }

  // Validate reply message
  let replyMessage = null;

  if (replyTo) {
    replyMessage = await Message.findOne({
      _id: replyTo,
      chat: chatId,
    });

    if (!replyMessage) {
      throw new ApiError(404, "Reply message not found.");
    }
  }

  // Transaction
  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const message = await Message.create(
      [
        {
          chat: chatId,
          sender: senderId,
          type,
          content,
          replyTo: replyMessage?._id || null,
        },
      ],
      {
        session,
      },
    );

    chat.lastMessage = message[0]._id;

    await chat.save({
      session,
    });

    await session.commitTransaction();

    const populatedMessage = await Message.findById(message[0]._id)
      .populate("sender", "publicId fullName username avatar")
      .populate("chat")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "publicId fullName username",
        },
      });

    // Emit real-time event to all participants EXCEPT the sender
    chat.participants.forEach((participant) => {
      if (participant.user.toString() !== senderId.toString()) {
        getIO()
          .to(`user:${participant.user.toString()}`)
          .emit("message received", populatedMessage);
      }
    });

    return {
      message: "Message sent successfully.",
      data: populatedMessage,
    };
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("ABORT TRANSACTION ERROR:", abortErr);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const getMessages = async (userId, chatId, page = 1, limit = 30) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  // Verify chat membership
  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
    "participants.user": userId,
  }).select("_id");

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({
      chat: chatId,
      isDeletedForEveryone: false,
      deletedFor: {
        $ne: userId,
      },
    })
      .populate("sender", "publicId fullName username avatar")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "publicId fullName username",
        },
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Message.countDocuments({
      chat: chatId,
      isDeletedForEveryone: false,
      deletedFor: {
        $ne: userId,
      },
    }),
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

export const editMessage = async (userId, messageId, content) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  if (message.isDeletedForEveryone) {
    throw new ApiError(400, "Message has been deleted.");
  }

  if (!message.sender.equals(userId)) {
    throw new ApiError(403, "You can only edit your own messages.");
  }

  if (message.type !== MESSAGE_TYPES.TEXT) {
    throw new ApiError(400, "Only text messages can be edited.");
  }

  message.content = content;

  message.isEdited = true;

  message.editedAt = new Date();

  await message.save();

  return {
    message: "Message updated successfully.",
    data: message,
  };
};

export const deleteMessageForMe = async (userId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found.");
  }

  // User already deleted it
  if (message.deletedFor.some((id) => id.equals(userId))) {
    throw new ApiError(400, "Message already deleted.");
  }

  message.deletedFor.push(userId);

  await message.save();

  return {
    message: "Message deleted for you.",
    data: null,
  };
};

export const deleteMessageForEveryone = async (userId, messageId) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  // Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find message
    const message = await Message.findById(messageId).session(session);

    if (!message) {
      throw new ApiError(404, "Message not found.");
    }

    // Already deleted?
    if (message.isDeletedForEveryone) {
      throw new ApiError(400, "Message has already been deleted.");
    }

    // Only sender can delete for everyone
    if (!message.sender.equals(userId)) {
      throw new ApiError(403, "You can only delete your own messages.");
    }

    // Soft delete the message
    message.isDeletedForEveryone = true;
    message.deletedForEveryoneAt = new Date();

    // Optional: Replace content with placeholder
    message.content = "This message was deleted.";

    await message.save({ session });

    // Fetch the chat
    const chat = await Chat.findById(message.chat).session(session);

    if (!chat) {
      throw new ApiError(404, "Chat not found.");
    }

    // If this was the latest message, update chat.lastMessage
    if (chat.lastMessage && chat.lastMessage.equals(message._id)) {
      const previousMessage = await Message.findOne({
        chat: chat._id,
        isDeletedForEveryone: false,
        _id: { $ne: message._id },
      })
        .sort({ createdAt: -1 })
        .session(session);

      chat.lastMessage = previousMessage ? previousMessage._id : null;

      await chat.save({ session });
    }

    // Commit transaction
    await session.commitTransaction();

    return {
      message: "Message deleted for everyone.",
      data: null,
    };
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
};

export const markMessageAsDelivered = async (userId, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID.");
  }

  const message = await Message.findOneAndUpdate(
    {
      _id: messageId,
      "deliveredTo.user": { $ne: userId }
    },
    {
      $push: {
        deliveredTo: { user: userId, deliveredAt: new Date() }
      }
    },
    { new: true }
  ).populate("sender", "publicId fullName username avatar")
    .populate("chat");

  if (!message) {
    // Message already delivered or not found
    const existingMessage = await Message.findById(messageId)
      .populate("sender", "publicId fullName username avatar")
      .populate("chat");
    return { data: existingMessage };
  }

  return {
    message: "Message marked as delivered.",
    data: message,
  };
};

export const markChatAsRead = async (userId, chatId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
    "participants.user": userId,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  // Update deliveredTo and readBy for all messages not sent by the user, and not already read/delivered by the user
  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      "deliveredTo.user": { $ne: userId }
    },
    {
      $push: {
        deliveredTo: { user: userId, deliveredAt: new Date() }
      }
    }
  );

  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      "readBy.user": { $ne: userId }
    },
    {
      $push: {
        readBy: { user: userId, readAt: new Date() }
      }
    }
  );

  return {
    message: "Chat messages marked as read.",
    data: { chatId, userId }
  };
};
