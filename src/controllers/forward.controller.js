import { forwardMessage } from "../services/forward.service.js";

/**
 * =========================================================
 * FORWARD MESSAGE
 * =========================================================
 */

export const forwardMessageController = async (req, res, next) => {
  try {
    const { messageId, chatId } = req.body;

    const result = await forwardMessage(req.user._id, messageId, chatId);

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
