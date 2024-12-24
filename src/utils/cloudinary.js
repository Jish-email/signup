import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("File path is missing.");
    }

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Handles various file types
    });

    ("Upload successful:", response);

    // Check if file exists before attempting to delete it
    try {
      await fs.promises.access(localFilePath); // Check existence
      await fs.promises.unlink(localFilePath); // Delete the file
      ("Temporary file deleted:", localFilePath);
    } catch (unlinkError) {
      if (unlinkError.code === "ENOENT") {
        console.warn("Temporary file already deleted or not found:", localFilePath);
      } else {
        console.error("Error while deleting temporary file:", unlinkError.message);
        throw unlinkError;
      }
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Clean up temporary file if it exists
    try {
      await fs.promises.access(localFilePath); // Check existence
      await fs.promises.unlink(localFilePath); // Delete the file
      ("Temporary file deleted after failure:", localFilePath);
    } catch (unlinkError) {
      if (unlinkError.code === "ENOENT") {
        console.warn("File not found during error handling, skipping deletion.");
      } else {
        console.error("Error deleting file during failure:", unlinkError.message);
      }
    }

    throw error; // Re-throw the error for upstream handling
  }
};

export { uploadOnCloudinary };
