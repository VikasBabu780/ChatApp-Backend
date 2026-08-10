import { Router } from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";

import {
  pinChatController,
  unpinChatController,
} from "../controllers/pinchat.controller.js";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  pinChatController,
);

router.delete(
  "/",
  isAuthenticated,
  unpinChatController,
);

export default router;
