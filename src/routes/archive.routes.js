import express from "express";

import {
  archiveChatController,
  unarchiveChatController,
  getArchivedChatsController,
  getArchiveStatusController,
} from "../controllers/archive.controller.js";

import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * =========================================================
 * GET ARCHIVED CHATS
 * =========================================================
 *
 * GET /api/v1/archive
 */

router.get("/", isAuthenticated, getArchivedChatsController);

/**
 * =========================================================
 * ARCHIVE CHAT
 * =========================================================
 *
 * POST /api/v1/archive
 */

router.post("/", isAuthenticated, archiveChatController);

/**
 * =========================================================
 * UNARCHIVE CHAT
 * =========================================================
 *
 * DELETE /api/v1/archive
 */

router.delete("/", isAuthenticated, unarchiveChatController);

/**
 * =========================================================
 * CHECK ARCHIVE STATUS
 * =========================================================
 *
 * GET /api/v1/archive/:chatId
 */

router.get("/:chatId", isAuthenticated, getArchiveStatusController);

export default router;
