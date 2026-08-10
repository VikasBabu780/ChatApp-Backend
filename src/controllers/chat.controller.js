import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { createPrivateChatSchema } from "../validations/chat.validation.js";
import {
  createOrGetPrivateChat,
  getMyChats,
  getChatById,
  deleteChat,
} from "../services/chat.service.js";

export const createPrivateChatController = asyncHandler(async (req, res) => {
  // Validate request
  const { userId } = createPrivateChatSchema.parse(req.body);

  // Create/Get chat
  const result = await createOrGetPrivateChat(req.user._id, userId);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const getMyChatsController = asyncHandler(async (req, res) => {
  const result = await getMyChats(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const getChatByIdController = asyncHandler(async (req, res) => {
  const { chatId } = chatIdSchema.parse(req.params);

  const result = await getChatById(req.user._id, chatId);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const deleteChatController = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const result = await deleteChat(req.user._id, chatId);

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});
