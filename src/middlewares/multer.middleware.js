import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

// Temporary upload directory
const uploadDir = path.join("public", "temp");

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * =========================================================
 * STORAGE
 * =========================================================
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

/**
 * =========================================================
 * ALLOWED MIME TYPES
 * =========================================================
 */

const allowedMimeTypes = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

/**
 * =========================================================
 * FILE SIZE LIMITS
 * =========================================================
 */

const fileSizeLimits = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  AUDIO: 10 * 1024 * 1024, // 10 MB
  DOCUMENT: 10 * 1024 * 1024, // 10 MB
  VIDEO: 50 * 1024 * 1024, // 50 MB
};

/**
 * =========================================================
 * FILE FILTER
 * =========================================================
 *
 * IMPORTANT:
 *
 * Do NOT use req.body.type here.
 *
 * With multipart/form-data, the order in which
 * fields arrive is not guaranteed.
 *
 * Therefore Multer only checks the actual MIME type.
 *
 * The service will later verify:
 *
 * type = IMAGE  -> image MIME
 * type = VIDEO  -> video MIME
 * type = AUDIO  -> audio MIME
 * type = DOCUMENT -> document MIME
 */

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, `Unsupported file type: ${file.mimetype}`), false);
  }

  cb(null, true);
};

/**
 * =========================================================
 * MULTER
 * =========================================================
 */

const upload = multer({
  storage,

  limits: {
    // Largest supported file = 50 MB
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;

/**
 * Export size limits
 * for media.service.js
 */
export { fileSizeLimits };
