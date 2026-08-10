import {
  pinMessage,
  unpinMessage,
  getPinnedMessages,
} from "../services/pin.service.js";

/**
 * =========================================================
 * PIN MESSAGE
 * =========================================================
 */

export const pinMessageController = async (req, res, next) => {
  try {
    const { messageId } = req.body;

    const result = await pinMessage(req.user._id, messageId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * UNPIN MESSAGE
 * =========================================================
 */

export const unpinMessageController = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await unpinMessage(req.user._id, messageId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * GET PINNED MESSAGES
 * =========================================================
 */

export const getPinnedMessagesController = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const result = await getPinnedMessages(req.user._id, chatId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
