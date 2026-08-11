import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { CHAT_TYPES, PARTICIPANT_ROLES } from "../constants/chat.constants.js";
import Message from "../models/Message.js";


export const createOrGetPrivateChat = async (
  currentUserId,
  otherUserId
) => {
  // Cannot chat with yourself
  if (currentUserId.toString() === otherUserId.toString()) {
    throw new ApiError(
      400,
      "You cannot create a chat with yourself."
    );
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  // Fetch users
  const [currentUser, otherUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(otherUserId),
  ]);

  if (!currentUser) {
    throw new ApiError(404, "Current user not found.");
  }

  if (!otherUser || otherUser.isDeleted) {
    throw new ApiError(404, "User not found.");
  }

  // Privacy check based on messagePermission
  const otherUserMessagePermission = otherUser.privacy?.messagePermission || "EVERYONE";

  if (otherUserMessagePermission === "NOBODY") {
    throw new ApiError(403, "This user is not accepting messages.");
  }

  const isFriend = currentUser.friends.some((friendId) => friendId.equals(otherUser._id));

  if (otherUserMessagePermission === "FRIENDS_ONLY" && !isFriend) {
    throw new ApiError(403, "This user only accepts messages from friends.");
  }

  // Find existing private chat
  const existingChat = await Chat.findOne({
    type: CHAT_TYPES.PRIVATE,

    $and: [
      {
        participants: {
          $elemMatch: {
            user: currentUserId,
          },
        },
      },
      {
        participants: {
          $elemMatch: {
            user: otherUserId,
          },
        },
      },
    ],

    $expr: {
      $eq: [
        {
          $size: "$participants",
        },
        2,
      ],
    },
  })
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen"
    )
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select:
          "publicId fullName username avatar",
      },
    });

  if (existingChat) {
    return {
      message: "Chat fetched successfully.",
      data: existingChat,
    };
  }

  // Create chat
  const chat = await Chat.create({
    type: CHAT_TYPES.PRIVATE,

    participants: [
      {
        user: currentUserId,
        role: PARTICIPANT_ROLES.MEMBER,
      },
      {
        user: otherUserId,
        role: PARTICIPANT_ROLES.MEMBER,
      },
    ],

    createdBy: currentUserId,
  });

  const populatedChat = await Chat.findById(chat._id)
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen"
    )
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select:
          "publicId fullName username avatar",
      },
    });

  return {
    message: "Chat created successfully.",
    data: populatedChat,
  };
};


export const getMyChats = async (
  currentUserId
) => {

  const chats = await Chat.find({
    "participants.user": currentUserId,
    isDeleted: false,
  })
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen"
    )
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select:
          "publicId fullName username avatar",
      },
    })
    .sort({
      updatedAt: -1,
    });

  const chatsWithUnreadCount = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chat: chat._id,
        sender: { $ne: currentUserId },
        "readBy.user": { $ne: currentUserId },
      });

      return {
        ...chat.toObject(),
        unreadCount,
      };
    })
  );

  return {
    message: "Chats fetched successfully.",
    data: chatsWithUnreadCount,
  };
};


export const getChatById = async (
  currentUserId,
  chatId
) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  // Find chat
  const chat = await Chat.findOne({
    _id: chatId,
    isDeleted: false,
    "participants.user": currentUserId,
  })
    .populate(
      "participants.user",
      "publicId fullName username avatar isOnline lastSeen"
    )
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select:
          "publicId fullName username avatar",
      },
    });

  if (!chat) {
    throw new ApiError(
      404,
      "Chat not found."
    );
  }

  return {
    message: "Chat fetched successfully.",
    data: chat,
  };
};

export const deleteChat = async (currentUserId, chatId) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID.");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    "participants.user": currentUserId
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  chat.isDeleted = true;
  await chat.save();

  return {
    message: "Chat deleted successfully."
  };
};