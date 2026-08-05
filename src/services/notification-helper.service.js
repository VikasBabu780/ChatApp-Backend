import { createNotification } from "./notification.service.js";

import { NOTIFICATION_TYPES } from "../constants/notification.constants.js";

export const notifyFriendRequest = async (
  sender,
  receiver,
  requestId
) => {
  return createNotification({
    receiver: receiver._id,
    sender: sender._id,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST,
    title: "Friend Request",
    message: `${sender.fullName} sent you a friend request.`,
    data: {
      friendRequestId: requestId,
    },
  });
};


export const notifyFriendAccepted = async (
  sender,
  receiver,
  requestId
) => {
  return createNotification({
    receiver: receiver._id,
    sender: sender._id,
    type: NOTIFICATION_TYPES.FRIEND_ACCEPTED,
    title: "Friend Request Accepted",
    message: `${sender.fullName} accepted your friend request.`,
    data: {
      friendRequestId: requestId,
    },
  });
};


export const notifyFriendRejected = async (
  sender,
  receiver,
  requestId
) => {
  return createNotification({
    receiver: receiver._id,
    sender: sender._id,
    type: NOTIFICATION_TYPES.FRIEND_REJECTED,
    title: "Friend Request Rejected",
    message: `${sender.fullName} rejected your friend request.`,
    data: {
      friendRequestId: requestId,
    },
  });
};