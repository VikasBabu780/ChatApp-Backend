import mongoose from "mongoose";

import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";

export const createNotification = async ({
  receiver,
  sender = null,
  type,
  title,
  message,
  data = {},
}) => {
  if (!receiver) {
    throw new ApiError(400, "Receiver is required.");
  }

  return await Notification.create({
    receiver,
    sender,
    type,
    title,
    message,
    data,
  });
};

export const getNotifications = async (
  userId,
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ receiver: userId })
      .populate(
        "sender",
        "publicId fullName username avatar"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments({
      receiver: userId,
    }),
  ]);

  return {
    message: "Notifications fetched successfully.",
    data: {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const markNotificationAsRead = async (
  userId,
  notificationId
) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(
      400,
      "Invalid notification ID."
    );
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: userId,
  });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found."
    );
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();
  }

  return {
    message: "Notification marked as read.",
    data: notification,
  };
};

export const markAllNotificationsAsRead = async (
  userId
) => {
  await Notification.updateMany(
    {
      receiver: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return {
    message:
      "All notifications marked as read.",
    data: null,
  };
};

export const deleteNotification = async (
  userId,
  notificationId
) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(
      400,
      "Invalid notification ID."
    );
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: userId,
  });

  if (!notification) {
    throw new ApiError(
      404,
      "Notification not found."
    );
  }

  await notification.deleteOne();

  return {
    message:
      "Notification deleted successfully.",
    data: null,
  };
};

export const clearNotifications = async (
  userId
) => {
  await Notification.deleteMany({
    receiver: userId,
  });

  return {
    message:
      "Notifications cleared successfully.",
    data: null,
  };
};

export const getUnreadNotificationCount =
  async (userId) => {
    const unreadCount =
      await Notification.countDocuments({
        receiver: userId,
        isRead: false,
      });

    return {
      message:
        "Unread notification count fetched successfully.",
      data: {
        unreadCount,
      },
    };
  };