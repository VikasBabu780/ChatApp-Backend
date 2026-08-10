import fs from "fs/promises";
import { existsSync } from "fs";

import cloudinary from "../config/cloudinary.js";

/**
 * Upload a local file to Cloudinary
 *
 * @param {string} localFilePath
 * @param {string} folder
 * @param {string} resourceType
 */
export const uploadOnCloudinary = async (
  localFilePath,
  folder = "ConvoSphere",
  resourceType = "auto",
) => {
  try {
    if (!localFilePath) {
      throw new Error("Local file path is required.");
    }

    if (!existsSync(localFilePath)) {
      throw new Error("File does not exist.");
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
      overwrite: false,
    });

    // Delete temporary local file
    if (existsSync(localFilePath)) {
      await fs.unlink(localFilePath);
    }

    return result;
  } catch (error) {
    // Always try to remove temporary file
    if (localFilePath && existsSync(localFilePath)) {
      try {
        await fs.unlink(localFilePath);
      } catch (unlinkError) {
        console.error("Temporary file cleanup failed:", unlinkError.message);
      }
    }

    throw new Error(error.message || "Cloudinary upload failed.");
  }
};

/**
 * Delete a file from Cloudinary
 *
 * @param {string} publicId
 * @param {string} resourceType
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image",
) => {
  try {
    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    throw new Error(error.message || "Cloudinary delete failed.");
  }
};
