import { asyncHandler } from "../../utils/response.js";
import { decodeData } from "../../utils/security/encode.securtiy.js";
import * as DbService from "../../DB/db.service.js";
import { roleEnum, UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.security.js";
import { getLoginCredentials } from "../../utils/security/token.security.js";
import { cloud } from "../../utils/multer/cloudnary.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = decodeData({ cipherText: req.user.phone });
  return res.json({ message: "Done", data: req.user });
});

export const getProfileById = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DbService.findById({
    model: UserModel,
    filter: userId,
    select: " firstName lastName email picture userName",
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));

  return res.json({ message: "done", data: user });
});

export const updateUserPassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await DbService.findById({ model: UserModel, filter: req.user._id });
  const checkPassword = compare({ hashed: user.password, plainText: oldPassword.trim() });
  if (!checkPassword) {
    return next(new Error("incorrect old password", { cause: 400 }));
  }
  const hasedNewPassword = await hash({ plainText: newPassword });
  user.password = hasedNewPassword;
  user.__v += 1;
  await user.save();
  return res.json({ message: "Done" });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const credentials = getLoginCredentials({ user });
  res.cookie("refreshToken", credentials.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.json({ message: "Done", data: { ...credentials } });
});

export const updateProfileData = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id },
    data: req.body,
  });
  return res.json({ message: "Done", data: user });
});

export const freezAccount = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;
  if (userId && req.user.role !== roleEnum.admin) {
    return next(new Error("you are not authorized to delete this account", { cause: 401 }));
  }
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId || req.user._id,
      deletedAt: { $exists: 0 },
      deletedBy: { $exists: 0 },
    },
    data: {
      $set: { deletedAt: new Date() },
      deletedBy: req.user._id,
    },
  });
  console.log({ user });

  if (!user) {
    return next(new Error("User is already deleted", { cause: 404 }));
  }
  return res.json({ message: "Done" });
});

export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: 1 },
      deletedBy: { $exists: 1, $eq: req.user._id },
    },
    data: {
      $unset: { deletedAt: 1 },
      $unset: { deletedBy: 1 },
    },
  });
  return user ? res.json({ message: "Done" }) : next(new Error("in-valid account", { cause: 404 }));
});

export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DbService.findOneAndDelete({
    model: UserModel,
    filter: { _id: userId, deletedAt: { $exists: 1 }, deletedBy: { $exists: 1 } },
  });
  if (!user) {
    return next(new Error("User is already deleted", { cause: 404 }));
  }
  return res.json({ message: "Done" });
});

export const updateProfileImage = asyncHandler(async (req, res, next) => {
  const cloudUpload = await cloud().uploader.upload(req.file.path, {
    folder: `SARAHA/user/${req.user._id}`,
  });
  if (req.user.picture && /^https:\/\/res\.cloudinary\.com/.test(req.user.picture)) {
  }
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { _id: req.user._id },
    data: {
      $set: { picture: cloudUpload.secure_url },
    },
  });
  if (!user) {
    return next(new Error("In-valid user id"));
  }
  return res.json({ message: "Done" });
});
