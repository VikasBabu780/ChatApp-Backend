import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import ApiError from "../utils/ApiError.js";
import {
  notifyFriendRequest,
  notifyFriendAccepted,
  notifyFriendRejected,
} from "./notification-helper.service.js";

export const sendFriendRequest = async (senderId, receiverId) => {
  // Validate receiver ID
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  // Cannot send request to yourself
  if (senderId.toString() === receiverId.toString()) {
    throw new ApiError(
      400,
      "You cannot send a friend request to yourself."
    );
  }

  // Fetch sender and receiver
  const [sender, receiver] = await Promise.all([
    User.findById(senderId),
    User.findById(receiverId),
  ]);

  if (!sender) {
    throw new ApiError(404, "Sender not found.");
  }

  if (!receiver || receiver.isDeleted) {
    throw new ApiError(404, "User not found.");
  }

  // Privacy check
  if (
    receiver.privacy.friendRequestPermission ===
    "NOBODY"
  ) {
    throw new ApiError(
      403,
      "This user is not accepting friend requests."
    );
  }

  // Find existing request in either direction
  const existingRequest = await FriendRequest.findOne({
    $or: [
      {
        sender: senderId,
        receiver: receiverId,
      },
      {
        sender: receiverId,
        receiver: senderId,
      },
    ],
  });

  if (existingRequest) {
    switch (existingRequest.status) {
      case "PENDING":
        throw new ApiError(
          409,
          "A friend request is already pending."
        );

      case "ACCEPTED":
        throw new ApiError(
          409,
          "You are already friends."
        );

      case "REJECTED":
      case "CANCELLED":
        // Reuse existing document
        existingRequest.sender = senderId;
        existingRequest.receiver = receiverId;
        existingRequest.status = "PENDING";

        existingRequest.acceptedAt = null;
        existingRequest.rejectedAt = null;
        existingRequest.cancelledAt = null;

        await existingRequest.save();

        // Notify receiver
        await notifyFriendRequest(
          sender,
          receiver,
          existingRequest._id
        );

        return {
          message: "Friend request sent successfully.",
          data: existingRequest,
        };

      default:
        throw new ApiError(
          500,
          "Invalid friend request status."
        );
    }
  }

  // Create new request
  const request = await FriendRequest.create({
    sender: senderId,
    receiver: receiverId,
    status: "PENDING",
  });

  // Notify receiver
  await notifyFriendRequest(
    sender,
    receiver,
    request._id
  );

  return {
    message: "Friend request sent successfully.",
    data: request,
  };
};


export const cancelFriendRequest = async (
  userId,
  requestId
) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid friend request ID.");
  }

  // Find request
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Friend request not found.");
  }

  // Only sender can cancel
  if (request.sender.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to cancel this request."
    );
  }

  // Must be pending
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "Only pending friend requests can be cancelled."
    );
  }

  // Cancel request
  request.status = "CANCELLED";
  request.cancelledAt = new Date();

  await request.save();

  return {
    message: "Friend request cancelled successfully.",
    data: request,
  };
};


export const acceptFriendRequest = async (
  userId,
  requestId
) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(
      400,
      "Invalid friend request ID."
    );
  }

  // Find request
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(
      404,
      "Friend request not found."
    );
  }

  // Only receiver can accept
  if (
    request.receiver.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to accept this request."
    );
  }

  // Must be pending
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "Only pending friend requests can be accepted."
    );
  }

  // Fetch both users
  const [sender, receiver] = await Promise.all([
    User.findById(request.sender),
    User.findById(request.receiver),
  ]);

  if (!sender || !receiver) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  // Prevent duplicate friends
  if (!sender.friends.includes(receiver._id)) {
    sender.friends.push(receiver._id);
  }

  if (!receiver.friends.includes(sender._id)) {
    receiver.friends.push(sender._id);
  }

  // Update request
  request.status = "ACCEPTED";
  request.acceptedAt = new Date();

  // Save changes
  await Promise.all([
    sender.save(),
    receiver.save(),
    request.save(),
  ]);

  // Notify original sender
  await notifyFriendAccepted(
    receiver, // Person who accepted
    sender,   // Person receiving notification
    request._id
  );

  return {
    message: "Friend request accepted successfully.",
    data: request,
  };
};

export const rejectFriendRequest = async (
  userId,
  requestId
) => {

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(
      400,
      "Invalid friend request ID."
    );
  }

  // Find request
  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(
      404,
      "Friend request not found."
    );
  }

  // Only receiver can reject
  if (
    request.receiver.toString() !==
    userId.toString()
  ) {
    throw new ApiError(
      403,
      "You are not authorized to reject this request."
    );
  }

  // Must be pending
  if (request.status !== "PENDING") {
    throw new ApiError(
      400,
      "Only pending friend requests can be rejected."
    );
  }

  // Fetch both users
  const [sender, receiver] = await Promise.all([
    User.findById(request.sender),
    User.findById(request.receiver),
  ]);

  if (!sender || !receiver) {
    throw new ApiError(
      404,
      "User not found."
    );
  }

  // Update request
  request.status = "REJECTED";
  request.rejectedAt = new Date();

  await request.save();

  // Notify original sender
  await notifyFriendRejected(
    receiver, // Person who rejected
    sender,   // Person receiving notification
    request._id
  );

  return {
    message: "Friend request rejected successfully.",
    data: request,
  };
};

export const getIncomingFriendRequests = async (userId) => {

    const requests = await FriendRequest.find({
        receiver: userId,
        status: "PENDING",
    })
    .populate(
        "sender",
        "publicId fullName username avatar bio isOnline lastSeen"
    )
    .sort({ createdAt: -1 });

    return {
        message: "Incoming friend requests fetched successfully.",
        data: requests,
    };
};


export const getSentFriendRequests = async (userId) => {

    const requests = await FriendRequest.find({
        sender: userId,
        status: "PENDING",
    })
    .populate(
        "receiver",
        "publicId fullName username avatar bio isOnline lastSeen"
    )
    .sort({ createdAt: -1 });

    return {
        message: "Sent friend requests fetched successfully.",
        data: requests,
    };
};


export const getFriends = async (userId) => {

    const user = await User.findById(userId)
        .populate(
            "friends",
            "publicId fullName username avatar bio isOnline lastSeen"
        );

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return {
        message: "Friends fetched successfully.",
        data: user.friends,
    };
};


export const removeFriend = async (
    userId,
    friendId
) => {

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
        throw new ApiError(
            400,
            "Invalid friend ID."
        );
    }

    const [user, friend] =
        await Promise.all([
            User.findById(userId),
            User.findById(friendId),
        ]);

    if (!user || !friend) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    if (
        !user.friends.includes(friend._id)
    ) {
        throw new ApiError(
            400,
            "This user is not your friend."
        );
    }

    user.friends.pull(friend._id);
    friend.friends.pull(user._id);

    await Promise.all([
        user.save(),
        friend.save(),
    ]);

    await FriendRequest.findOneAndUpdate(
        {
            $or: [
                {
                    sender: userId,
                    receiver: friendId,
                },
                {
                    sender: friendId,
                    receiver: userId,
                },
            ],
            status: "ACCEPTED",
        },
        {
            status: "CANCELLED",
            cancelledAt: new Date(),
        }
    );

    return {
        message: "Friend removed successfully.",
        data: null,
    };
};


export const getFriendSuggestions = async (
    userId,
    page = 1,
    limit = 20
) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    // Find pending requests
    const pendingRequests =
        await FriendRequest.find({
            $or: [
                {
                    sender: userId,
                    status: "PENDING",
                },
                {
                    receiver: userId,
                    status: "PENDING",
                },
            ],
        });

    // Users involved in pending requests
    const pendingUserIds =
        pendingRequests.map((request) => {

            if (
                request.sender.toString() ===
                userId.toString()
            ) {
                return request.receiver;
            }

            return request.sender;
        });

    // Exclude:
    // 1. Yourself
    // 2. Existing friends
    // 3. Pending requests

    const excludeIds = [
        user._id,
        ...user.friends,
        ...pendingUserIds,
    ];

    const suggestions =
        await User.find({
            _id: {
                $nin: excludeIds,
            },
            isDeleted: false,
            isVerified: true,
        })
        .select(
            "publicId fullName username avatar bio isOnline lastSeen"
        )
        .sort({
            createdAt: -1,
        })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        message:
            "Friend suggestions fetched successfully.",
        data: suggestions,
    };
};