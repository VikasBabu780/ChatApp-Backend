import {
  searchUsers,
  searchChats,
  searchMessages,
} from "../services/search.service.js";

/**
 * =========================================================
 * SEARCH USERS
 * =========================================================
 */

export const searchUsersController = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;

    const result = await searchUsers(req.user._id, search, page, limit);

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
 * SEARCH CHATS
 * =========================================================
 */

export const searchChatsController = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;

    const result = await searchChats(req.user._id, search, page, limit);

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
 * SEARCH MESSAGES
 * =========================================================
 */

export const searchMessagesController = async (req, res, next) => {
  try {
    const { search, chatId, page, limit } = req.query;

    const result = await searchMessages(
      req.user._id,
      search,
      chatId,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
