import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  searchUsersController,
  searchChatsController,
  searchMessagesController,
} from "../controllers/search.controller.js";

import {
  searchUsersValidation,
  searchChatsValidation,
  searchMessagesValidation,
} from "../validations/search.validation.js";

const router = Router();

/**
 * =====================================================
 * SEARCH USERS
 * =====================================================
 *
 * GET /api/v1/search/users?search=vikas
 */
router.get(
  "/users",
  isAuthenticated,
  validate(searchUsersValidation),
  searchUsersController,
);

/**
 * =====================================================
 * SEARCH CHATS
 * =====================================================
 *
 * GET /api/v1/search/chats?search=project
 */
router.get(
  "/chats",
  isAuthenticated,
  validate(searchChatsValidation),
  searchChatsController,
);

/**
 * =====================================================
 * SEARCH MESSAGES
 * =====================================================
 *
 * GET /api/v1/search/messages?search=hello
 *
 * Optional:
 * GET /api/v1/search/messages?search=hello&chatId=CHAT_ID
 */
router.get(
  "/messages",
  isAuthenticated,
  validate(searchMessagesValidation),
  searchMessagesController,
);

export default router;
