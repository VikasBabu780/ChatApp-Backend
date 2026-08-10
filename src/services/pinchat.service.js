import mongoose from "mongoose";

import User from "../models/User.js";
import Chat from "../models/Chat.js";

import ApiError from "../utils/ApiError.js";

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

export const pinChat = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const alreadyPinned = user.pinnedChats.some((id) => id.equals(chat._id));

  if (alreadyPinned) {
    throw new ApiError(400, "Chat is already pinned.");
  }

  // Maximum of 3 pinned chats
  if (user.pinnedChats.length >= 3) {
    throw new ApiError(400, "You can only pin up to 3 chats.");
  }

  user.pinnedChats.push(chat._id);
  await user.save();

  return {
    message: "Chat pinned successfully.",
    data: {
      chatId: chat._id,
      isPinned: true,
    },
  };
};

export const unpinChat = async (userId, chatId) => {
  const chat = await verifyChatMembership(chatId, userId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPinned = user.pinnedChats.some((id) => id.equals(chat._id));

  if (!isPinned) {
    throw new ApiError(400, "Chat is not pinned.");
  }

  user.pinnedChats = user.pinnedChats.filter((id) => !id.equals(chat._id));
  await user.save();

  return {
    message: "Chat unpinned successfully.",
    data: {
      chatId: chat._id,
      isPinned: false,
    },
  };
};
