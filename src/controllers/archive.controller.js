import {
  archiveChat,
  unarchiveChat,
  getArchivedChats,
  getArchiveStatus,
} from "../services/archive.service.js";

/**
 * =========================================================
 * ARCHIVE CHAT
 * =========================================================
 */

export const archiveChatController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { chatId } = req.body;

    const result = await archiveChat(userId, chatId);

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
 * UNARCHIVE CHAT
 * =========================================================
 */

export const unarchiveChatController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { chatId } = req.body;

    const result = await unarchiveChat(userId, chatId);

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
 * GET ARCHIVED CHATS
 * =========================================================
 */

export const getArchivedChatsController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await getArchivedChats(userId);

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
 * GET ARCHIVE STATUS
 * =========================================================
 */

export const getArchiveStatusController = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { chatId } = req.params;

    const result = await getArchiveStatus(userId, chatId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
