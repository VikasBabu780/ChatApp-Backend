import {
  addReaction,
  removeReaction,
  getMessageReactions,
  ALLOWED_REACTIONS,
} from "../services/reaction.service.js";

/**
 * =========================================================
 * GET AVAILABLE REACTIONS
 * =========================================================
 */

export const getAvailableReactionsController = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,

      message: "Available reactions fetched successfully.",

      data: {
        reactions: ALLOWED_REACTIONS,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * ADD / CHANGE REACTION
 * =========================================================
 */

export const addReactionController = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const result = await addReaction(req.user._id, messageId, emoji);

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
 * REMOVE REACTION
 * =========================================================
 */

export const removeReactionController = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await removeReaction(req.user._id, messageId);

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
 * GET MESSAGE REACTIONS
 * =========================================================
 */

export const getMessageReactionsController = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const result = await getMessageReactions(req.user._id, messageId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
