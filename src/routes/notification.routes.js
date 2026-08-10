import express from "express";

import verifyJWT from "../middlewares/verifyJWT.js";

import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
  deleteNotificationController,
  clearNotificationsController,
  getUnreadNotificationCountController,
} from "../controllers/notification.controller.js";


const router = express.Router();


router.get(
  "/",
  verifyJWT,
  getNotificationsController
);
router.get(
  "/unread-count",
  verifyJWT,
  getUnreadNotificationCountController
);
router.patch(
  "/read-all",
  verifyJWT,
  markAllNotificationsAsReadController
);
router.patch(
  "/read/:notificationId",
  verifyJWT,
  markNotificationAsReadController
);
router.delete(
  "/clear",
  verifyJWT,
  clearNotificationsController
);
router.delete(
  "/:notificationId",
  verifyJWT,
  deleteNotificationController
);

export default router;