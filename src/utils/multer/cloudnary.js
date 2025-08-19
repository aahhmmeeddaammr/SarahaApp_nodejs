import { v2 as cloudnary } from "cloudinary";
export const cloud = () => {
   cloudnary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_secret: process.env.CLOUDNARY_API_SECRET,
    api_key: process.env.CLOUDNARY_API_KEY,
    secure: true,
  });
  return cloudnary
};
