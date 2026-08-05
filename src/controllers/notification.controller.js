import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
  getUnreadNotificationCount,
} from "../services/notification.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  notificationIdSchema,
} from "../validations/notification.validation.js";



export const getNotificationsController =
  asyncHandler(async (req, res) => {

    const result = await getNotifications(req.user._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  export const markNotificationAsReadController =
  asyncHandler(async (req, res) => {

    const { notificationId } =
      notificationIdSchema.parse(req.params);

    const result =
      await markNotificationAsRead(
        req.user._id,
        notificationId
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  export const markAllNotificationsAsReadController =
  asyncHandler(async (req, res) => {

    const result =
      await markAllNotificationsAsRead(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  export const deleteNotificationController =
  asyncHandler(async (req, res) => {

    const { notificationId } =
      notificationIdSchema.parse(req.params);

    const result =
      await deleteNotification(
        req.user._id,
        notificationId
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  export const clearNotificationsController =
  asyncHandler(async (req, res) => {

    const result =
      await clearNotifications(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  export const getUnreadNotificationCountController =
  asyncHandler(async (req, res) => {

    const result =
      await getUnreadNotificationCount(
        req.user._id
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
  });


  