import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";

import verifyJWT from "../middlewares/verifyJWT.js";
import {
  updateProfileController,
  uploadAvatarController,
  uploadCoverImageController,
  changeUsernameController,
  updatePrivacySettingsController,
  searchUsersController,
} from "../controllers/user.controller.js";

const router = Router();

// Protected Route
router.patch("/profile", verifyJWT, updateProfileController);
router.patch(
  "/avatar",
  verifyJWT,
  upload.single("avatar"),
  uploadAvatarController,
);
router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  uploadCoverImageController,
);
router.patch(
  "/privacy",
  verifyJWT,
  updatePrivacySettingsController
);
router.get(
    "/search",
    verifyJWT,
    searchUsersController
);

router.patch("/change-username", verifyJWT, changeUsernameController);

export default router;
