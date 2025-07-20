import { asyncHandler } from "../../utils/response.js";
import * as DbService from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.js";
import { decodeToken, generateToken } from "../../utils/security/token.js";
import { encodeData } from "../../utils/security/encode.js";
import { eventEmitter } from "../../utils/Email/emailEvents.js";

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, password, email, phone } = req.body;
  const checkUser = await DbService.findOne({ model: UserModel, filter: { email } });
  if (checkUser) {
    return next(new Error("email already exist", { cause: 409 }));
  }
  const hashedPassword = await hash({ plainText: password });
  const encodedPhone = encodeData({ plainText: phone });
  const user = await DbService.create({ model: UserModel, data: [{ fullName, password: hashedPassword, email, phone: encodedPhone }] });
  const confirmEmailToken = generateToken({
    payload: {
      userId: user[0]._id,
    },
    expiresIn: "15m",
    secretKey: process.env.EMAIL_TOKEN_SECRET,
  });
  res.status(201).json({ message: "Done", data: user });
  setImmediate(() => {
    eventEmitter.emit("sendConfirmationEmail", {
      toEmail: email,
      confirmationLink: `http://localhost:3000/auth/confirm-email?token=${confirmEmailToken}`,
      username: fullName,
    });
  });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;
  const checkUser = await DbService.findOne({ model: UserModel, filter: { email, confirmEmail: { $exists: true } } });
  if (!checkUser) {
    return next(new Error("In-valid email or password", { cause: 404 }));
  }
  const checkHashedPassword = compare({ plainText: password, hashed: checkUser.password });
  if (!checkHashedPassword) {
    return next(new Error("In-valid email or password", { cause: 404 }));
  }
  const token = generateToken({
    payload: {
      userId: checkUser._id,
    },
  });
  const refreshToken = generateToken({
    payload: {
      userId: checkUser._id,
    },
    secretKey: process.env.REFRESH_TOKEN_SECRETKEY,
    expiresIn: "1y",
  });
  return res.json({ message: "Done", data: { token, refreshToken } });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshtoken } = req.headers;

  const decodedData = decodeToken({
    token: refreshtoken,
    secretKey: process.env.REFRESH_TOKEN_SECRETKEY,
  });

  const user = DbService.findById({
    model: UserModel,
    filter: decodedData.userId,
  });

  if (!user) {
    next(new Error("in-valid user token", { cause: 403 }));
  }
  const token = generateToken({
    payload: {
      userId: user._id,
    },
  });
  const refreshToken = generateToken({
    payload: {
      userId: user._id,
      secretKey: process.env.REFRESH_TOKEN_SECRETKEY,
    },
    expiresIn: "1y",
  });
  return res.json({ message: "done", data: { token, refreshToken } });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const decoded = decodeToken({
    secretKey: process.env.EMAIL_TOKEN_SECRET,
    token,
  });
  console.log(decoded);

  const user = await DbService.findById({ model: UserModel, filter: decoded.userId });
  if (!user) return next(new Error("in-valid user", { cause: 404 }));
  user.confirmEmail = Date.now();
  await user.save();
  return res.json({ message: "Email confirmed successfully" });
});
