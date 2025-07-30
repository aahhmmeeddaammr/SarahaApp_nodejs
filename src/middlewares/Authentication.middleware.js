import { asyncHandler } from "../utils/response.js";
import { decodeToken, tokenTypeEnum } from "../utils/security/token.security.js";

export const Authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const authHeader = tokenType == tokenTypeEnum.access ? req.headers.authorization : `Bearer ${req.cookies.refreshToken}`;
    req.user = await decodeToken({ authorization: authHeader, next, tokenType });
    return next();
  });
};
