import jwt from "jsonwebtoken";
import * as DbService from "../../DB/db.service.js";
import { roleEnum, UserModel } from "../../DB/models/User.model.js";

export const signatureEnum = { System: "System", Bearer: "Bearer" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const generateToken = ({ payload = {}, secretKey = process.env.ACCESS_USER_TOKEN_SECRETKEY, expiresIn = "1h" }) => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = ({ token = "", secretKey = process.env.ACCESS_USER_TOKEN_SECRETKEY } = {}) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ bearer = signatureEnum.Bearer } = {}) => {
  const signatures = { accessSignature: undefined, refreshSignature: undefined };
  switch (bearer) {
    case signatureEnum.System:
      signatures.accessSignature = process.env.ACCESS_SYSTEM_TOKEN_SECRETKEY;
      signatures.refreshSignature = process.env.REFRESH_SYSTEM_TOKEN_SECRETKEY;
      break;
    default:
      signatures.accessSignature = process.env.ACCESS_USER_TOKEN_SECRETKEY;
      signatures.refreshSignature = process.env.REFRESH_USER_TOKEN_SECRETKEY;
      break;
  }
  return signatures;
};

export const decodeToken = async ({ authorization, next, tokenType = tokenTypeEnum.access } = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];

  if (!bearer || !token) {
    return next(new Error("Missing or invalid token", { cause: 401 }));
  }
  const signatures = getSignature({ bearer });

  try {
    const { userId } = verifyToken({
      token,
      secretKey: tokenType === tokenTypeEnum.access ? signatures.accessSignature : signatures.refreshSignature,
    });
    const user = await DbService.findById({
      model: UserModel,
      filter: userId,
      select: "-password",
    });
    if (!user) {
      return next(new Error("user is deleted", { cause: 404 }));
    }
    return user;
  } catch (error) {
    next(new Error("Invalid or expired token", { cause: 403 }));
  }
};

export const getLoginCredentials = ({ user }) => {
  const signatures = getSignature({
    bearer: user.role !== roleEnum.user ? signatureEnum.System : signatureEnum.Bearer,
  });
  const accessToken = generateToken({
    payload: {
      userId: user._id,
    },
    secretKey: signatures.accessSignature,
  });
  const refreshToken = generateToken({
    payload: {
      userId: user._id,
    },
    secretKey: signatures.refreshSignature,
    expiresIn: "1y",
  });
  return { accessToken, refreshToken };
};
