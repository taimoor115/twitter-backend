import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully", response.url);

    console.log("🚀 ~ uploadOnCloudinary ~ localFilePath:", localFilePath);

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);

    return null;
  }
};

export const deleteImageOnCloudinary = async (imageId) => {
  try {
    const deletedImage = await cloudinary.uploader.destroy(imageId);

    if (deletedImage.result == "ok") {
      console.log("Image delete successfully...");
    } else {
      console.log("Error occur while deleting");
    }

    return deletedImage;
  } catch (error) {
    console.log(error);
  }
};