import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getIncomingFriendRequests,
  getSentFriendRequests,
  getFriends,
  removeFriend,
  getFriendSuggestions,
} from "../services/friend.service.js";

import {
  sendFriendRequestSchema,
  cancelFriendRequestSchema,
  acceptFriendRequestSchema,
  rejectFriendRequestSchema,
  removeFriendSchema,
  getFriendSuggestionsSchema,
} from "../validations/friend.validation.js";

export const sendFriendRequestController = asyncHandler(async (req, res) => {
  const { receiverId } = sendFriendRequestSchema.parse(req.body);

  const result = await sendFriendRequest(req.user._id, receiverId);

  return res
    .status(201)
    .json(new ApiResponse(201, result.message, result.data));
});

export const cancelFriendRequestController = asyncHandler(async (req, res) => {
  const { requestId } = cancelFriendRequestSchema.parse(req.params);

  const result = await cancelFriendRequest(req.user._id, requestId);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});


export const acceptFriendRequestController =
  asyncHandler(async (req, res) => {

    const { requestId } =
      acceptFriendRequestSchema.parse(req.params);

    const result =
      await acceptFriendRequest(
        req.user._id,
        requestId
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
});


export const rejectFriendRequestController =
  asyncHandler(async (req, res) => {

    const { requestId } =
      rejectFriendRequestSchema.parse(req.params);

    const result =
      await rejectFriendRequest(
        req.user._id,
        requestId
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        result.message,
        result.data
      )
    );
});

export const getIncomingFriendRequestsController =
asyncHandler(async (req, res) => {

    const result =
        await getIncomingFriendRequests(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            result.data
        )
    );
});


export const getSentFriendRequestsController =
asyncHandler(async (req, res) => {

    const result =
        await getSentFriendRequests(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            result.data
        )
    );
});


export const getFriendsController =
asyncHandler(async (req, res) => {

    const result =
        await getFriends(req.user._id);

    return res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            result.data
        )
    );
});


export const removeFriendController =
asyncHandler(async (req, res) => {

    const { friendId } =
        removeFriendSchema.parse(req.params);

    const result =
        await removeFriend(
            req.user._id,
            friendId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            result.data
        )
    );
});


export const getFriendSuggestionsController =
asyncHandler(async (req, res) => {

    const { page, limit } =
        getFriendSuggestionsSchema.parse(req.query);

    const result =
        await getFriendSuggestions(
            req.user._id,
            page,
            limit
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            result.message,
            result.data
        )
    );
});