import { asyncHandler } from "../utils/response.js";
import { decodeToken, getSignature, tokenTypeEnum } from "../utils/security/token.security.js";

export const Authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    req.user = await decodeToken({ authorization: authHeader, next, tokenType });
    return next();
  });
};
