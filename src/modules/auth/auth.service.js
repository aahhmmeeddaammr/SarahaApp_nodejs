import { asyncHandler } from "../../utils/response.js";
import * as DbService from "../../DB/db.service.js";
import { providerEnum, UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.security.js";
import { generateToken, getLoginCredentials, verifyToken } from "../../utils/security/token.security.js";
import { encodeData } from "../../utils/security/encode.securtiy.js";
import { eventEmitter } from "../../utils/Email/emailEvents.js";
import { OAuth2Client } from "google-auth-library";
import { TokenModel } from "../../DB/models/Token.model.js";
import { customAlphabet, nanoid } from "nanoid";

const client = new OAuth2Client();

export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, password, email, phone } = req.body;
  const checkUser = await DbService.findOne({ model: UserModel, filter: { email } });
  if (checkUser) {
    return next(new Error("email already exist or in-valid provider", { cause: 409 }));
  }
  const hashedPassword = await hash({ plainText: password });
  const encodedPhone = encodeData({ plainText: phone });
  const [user] = await DbService.create({
    model: UserModel,
    data: [
      {
        fullName,
        password: hashedPassword,
        email,
        phone: encodedPhone,
        provider: providerEnum.system,
        picture:
          "https://linked-posts.routemisr.com/uploads/28d3fb55-ced5-4a7f-8774-1945388e6b2c-9dd358a4-bf36-491a-a6e0-505f3b409a34-Screenshot%202025-04-07%20041923.png",
      },
    ],
  });
  const confirmEmailToken = generateToken({
    payload: {
      userId: user._id,
    },
    expiresIn: "2m",
    secretKey: process.env.EMAIL_TOKEN_SECRET,
  });
  res.status(201).json({ message: "Done", data: user });
  setImmediate(() => {
    eventEmitter.emit("sendConfirmationEmail", {
      toEmail: email,
      confirmationLink: `https://saraha-app.cleverapps.io/auth/confirm-email?token=${confirmEmailToken}`,
      username: fullName,
    });
  });
});

export const signin = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;

  const checkUser = await DbService.findOne({
    model: UserModel,
    filter: {
      email,
      provider: providerEnum.system,
    },
  });
  if (!checkUser) {
    return next(new Error("In-valid email or password or in-valid provider", { cause: 404 }));
  }
  if (!checkUser.confirmEmail) {
    return next(new Error("Confirm Email First", { cause: 404 }));
  }
  const checkHashedPassword = compare({
    plainText: password,
    hashed: checkUser.password,
  });
  if (!checkHashedPassword) {
    return next(new Error("In-valid email or password", { cause: 404 }));
  }
  const credentials = getLoginCredentials({ user: checkUser });
  res.cookie("refreshToken", credentials.refreshToken, {
    httpOnly: true,
    secure: !(process.env.MOOD === "dev"),
    sameSite: !(process.env.MOOD === "dev") ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return res.json({ message: "Done", data: { ...credentials } });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  const decoded = verifyToken({
    secretKey: process.env.EMAIL_TOKEN_SECRET,
    token,
  });
  const user = await DbService.findById({ model: UserModel, filter: decoded.userId });
  if (!user) return next(new Error("in-valid user", { cause: 404 }));
  user.confirmEmail = Date.now();
  await user.save();
  return res.redirect("https://saraha-app-react-taupe.vercel.app/auth");
});

export const signupWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, email_verified, picture, name } = ticket.getPayload();
  if (!email_verified) {
    return next(new Error("in-valid email", { cause: 400 }));
  }
  const user = await DbService.findOne({
    model: UserModel,
    filter: { email },
  });
  if (user) {
    if (user.provider === providerEnum.google) {
      return loginWithGmail(req, res, next);
    }
    return next(new Error("Email alreday Exist", { cause: 409 }));
  }
  await DbService.create({
    model: UserModel,
    data: [
      {
        email,
        picture,
        fullName: name,
        confirmEmail: Date.now(),
        provider: providerEnum.google,
      },
    ],
  });
  return loginWithGmail(req, res, next);
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, email_verified } = ticket.getPayload();
  if (!email_verified) {
    return next(new Error("in-valid email", { cause: 400 }));
  }
  const user = await DbService.findOne({
    model: UserModel,
    filter: { email, provider: providerEnum.google },
  });
  if (!user) {
    return next(new Error("in-valid login credintals", { cause: 404 }));
  }
  const credentials = getLoginCredentials({ user });
  res.cookie("refreshToken", credentials.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.json({ message: "Done", data: { ...credentials } });
});

export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("refreshToken");
  const { jti, user } = req;
  await DbService.create({
    model: TokenModel,
    data: [{ jti, ownerId: user._id }],
  });
  res.json({ message: "Done" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const otp = customAlphabet("1234567890", 6)();
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { email },
    data: {
      otp: await hash({ plainText: otp, salt: 5 }),
      $unset: { otpConfirmed: 1 },
    },
  });
  if (!user) {
    return next(new Error("in-valid user email", { cause: 404 }));
  }
  // send otp in email to user
  eventEmitter.emit("sendOtpEmail", { email: user.email, otp, name: user.fullName });
  return res.json({ message: "Done" });
});

export const verifyResetCode = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await DbService.findOne({
    model: UserModel,
    filter: { email, otp: { $exists: true } },
  });
  const checkHashedOtp = compare({ hashed: user.otp, plainText: otp });
  if (!checkHashedOtp) {
    return next(new Error("In-valid otp"));
  }
  await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { email },
    data: {
      $unset: { otp: 1 },
      otpConfirmed: new Date(),
    },
  });
  return res.json({ message: "Done" });
});

export const resetPassword = asyncHandler(async () => {
  const { email, password } = req.body;
  const newPasswordHash = await hash({ plainText: password });
  const user = await DbService.findOneAndUpdate({
    model: UserModel,
    filter: { email },
    data: {
      password: newPasswordHash,
      otpConfirmed: { $unset: 1 },
    },
  });
  if (!user) {
    return next(new Error("in-valid user email", { cause: 404 }));
  }
  return res.json({ message: "Done" });
});
