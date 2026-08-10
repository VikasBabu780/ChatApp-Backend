import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  sendMessageSchema,
  getMessagesSchema,
  editMessageSchema,
  deleteForMeSchema,
  deleteForEveryoneSchema,
} from "../validations/message.validation.js";
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
} from "../services/message.service.js";

export const sendMessageController = asyncHandler(async (req, res) => {
  const payload = sendMessageSchema.parse(req.body);

  const result = await sendMessage(req.user._id, payload);

  return res
    .status(201)
    .json(new ApiResponse(201, result.message, result.data));
});

export const getMessagesController = asyncHandler(async (req, res) => {
  const payload = getMessagesSchema.parse({
    ...req.params,
    ...req.query,
  });

  const result = await getMessages(
    req.user._id,
    payload.chatId,
    payload.page,
    payload.limit,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const editMessageController = asyncHandler(async (req, res) => {
  const payload = editMessageSchema.parse({
    ...req.params,
    ...req.body,
  });

  const result = await editMessage(
    req.user._id,
    payload.messageId,
    payload.content,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result.message, result.data));
});

export const deleteMessageForMeController = asyncHandler(async (req, res) => {
  const payload = deleteForMeSchema.parse(req.params);

  const result = await deleteMessageForMe(req.user._id, payload.messageId);

  return res.status(200).json(new ApiResponse(200, result.message, null));
});

export const deleteMessageForEveryoneController = asyncHandler(
  async (req, res) => {
    const payload = deleteForEveryoneSchema.parse(req.params);

    const result = await deleteMessageForEveryone(
      req.user._id,
      payload.messageId,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result.message, result.data));
  },
);
