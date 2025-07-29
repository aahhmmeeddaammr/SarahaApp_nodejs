import { asyncHandler } from "../../utils/response.js";
import { decodeData } from "../../utils/security/encode.securtiy.js";
import * as DbService from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.security.js";
import { getLoginCredentials } from "../../utils/security/token.security.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = decodeData({ cipherText: req.user.phone });
  return res.json({ message: "Done", data: { user: req.user } });
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
  console.log(compare({ hashed: user.password, plainText: oldPassword }));
  console.log({ hashed: user.password, plainText: oldPassword });

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
  return res.json({ message: "done", data: { ...getLoginCredentials({ user }) } });
});
