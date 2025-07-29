import { asyncHandler } from "../../utils/response.js";
import * as DbService from "../../DB/db.service.js";
import { providerEnum, UserModel } from "../../DB/models/User.model.js";
import { compare, hash } from "../../utils/security/hash.security.js";
import { generateToken, getLoginCredentials, verifyToken } from "../../utils/security/token.security.js";
import { encodeData } from "../../utils/security/encode.securtiy.js";
import { eventEmitter } from "../../utils/Email/emailEvents.js";
import { OAuth2Client } from "google-auth-library";

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
    return next(new Error("In-valid email or password", { cause: 404 }));
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

  return res.json({ message: "Done", data: { ...getLoginCredentials({ user: checkUser }) } });
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
  const newUser = await DbService.create({
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
  return res.json({ message: "Done", data: { ...getLoginCredentials({ user }) } });
});
