import fs from "fs/promises";
import { existsSync } from "fs";
import cloudinary from "../config/cloudinary.js";

// Upload file to Cloudinary
export const uploadOnCloudinary = async (
  localFilePath,
  folder = "ConvoSphere"
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
      resource_type: "image",
      overwrite: true,
    });

    // Remove local file after successful upload
    await fs.unlink(localFilePath);

    return result;
  } catch (error) {
    // Remove local file if upload fails
    if (localFilePath && existsSync(localFilePath)) {
      await fs.unlink(localFilePath);
    }

    throw new Error(error.message || "Cloudinary upload failed.");
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    throw new Error(error.message || "Cloudinary delete failed.");
  }
};