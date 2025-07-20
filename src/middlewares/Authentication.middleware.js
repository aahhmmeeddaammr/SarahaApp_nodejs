import { asyncHandler } from "../utils/response.js";
import { decodeToken } from "../utils/security/token.js";
import { UserModel } from "../DB/models/User.model.js";
import * as DbService from "../DB/db.service.js";

export const Authentication = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new Error("Missing or invalid token", { cause: 401 }));
  }
  const token = authHeader.split(" ")[1];
  try {
    const { userId } = decodeToken({ token });
    const user = await DbService.findById({ model: UserModel, filter: userId, select: "-password" });
    req.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid or expired token", { cause: 403 }));
  }
});
