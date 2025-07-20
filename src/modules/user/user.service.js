import { asyncHandler } from "../../utils/response.js";
import { decodeData } from "../../utils/security/encode.js";
import * as DbService from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = decodeData({ cipherText: req.user.phone });
  return res.json({ message: "Done", data: { user: req.user } });
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
