import {
  muteChat,
  unmuteChat,
  getMutedChats,
  getMuteStatus,
} from "../services/mute.service.js";


/**
 * =========================================================
 * MUTE CHAT
 * =========================================================
 */

export const muteChatController = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user._id;

    const {
      chatId,
      duration,
    } = req.body;

    const result =
      await muteChat(
        userId,
        chatId,
        duration,
      );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });

  } catch (error) {
    next(error);
  }
};


/**
 * =========================================================
 * UNMUTE CHAT
 * =========================================================
 */

export const unmuteChatController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const userId =
        req.user._id;

      const {
        chatId,
      } = req.body;

      const result =
        await unmuteChat(
          userId,
          chatId,
        );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });

    } catch (error) {
      next(error);
    }
  };


/**
 * =========================================================
 * GET MUTED CHATS
 * =========================================================
 */

export const getMutedChatsController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const userId =
        req.user._id;

      const result =
        await getMutedChats(
          userId,
        );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });

    } catch (error) {
      next(error);
    }
  };


/**
 * =========================================================
 * GET MUTE STATUS
 * =========================================================
 */

export const getMuteStatusController =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const userId =
        req.user._id;

      const {
        chatId,
      } = req.params;

      const result =
        await getMuteStatus(
          userId,
          chatId,
        );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });

    } catch (error) {
      next(error);
    }
  };
  