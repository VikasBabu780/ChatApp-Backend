import {
  pinChat,
  unpinChat,
} from "../services/pinchat.service.js";

export const pinChatController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    const result = await pinChat(userId, chatId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const unpinChatController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.body;

    const result = await unpinChat(userId, chatId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
