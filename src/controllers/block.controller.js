import {
  blockUser,
  unblockUser,
  getBlockedUsers,
  getBlockStatus,
} from "../services/block.service.js";

/**
 * =========================================================
 * BLOCK USER
 * =========================================================
 */

export const blockUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await blockUser(req.user._id, userId);

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
 * UNBLOCK USER
 * =========================================================
 */

export const unblockUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await unblockUser(req.user._id, userId);

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
 * GET BLOCKED USERS
 * =========================================================
 */

export const getBlockedUsersController = async (req, res, next) => {
  try {
    const result = await getBlockedUsers(req.user._id);

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
 * GET BLOCK STATUS
 * =========================================================
 */

export const getBlockStatusController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await getBlockStatus(req.user._id, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
