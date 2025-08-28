import { v2 as cloudnary } from "cloudinary";
export const cloud = () => {
  cloudnary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_secret: process.env.CLOUDNARY_API_SECRET,
    api_key: process.env.CLOUDNARY_API_KEY,
    secure: true,
  });
  return cloudnary;
};
export const uploadImage = async (req, path) => {
  const cloudUpload = await cloud().uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/${path}`,
  });
  return cloudUpload;
};

export const deleteImage = async (filePath) => {
  try {
    const publicId = filePath.replace(/\.[^/.]+$/, "");
    const result = await cloud().uploader.destroy(publicId.split("/").splice(7, 3).join("/"));
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image: ${result.result}`);
    }
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
