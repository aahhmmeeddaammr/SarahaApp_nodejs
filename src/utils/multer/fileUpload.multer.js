import multer, { diskStorage } from "multer";

export const cloudFileUpload = () => {
  const storage = diskStorage({});
  return multer({
    dest: "/temp",
    storage,
  });
};
