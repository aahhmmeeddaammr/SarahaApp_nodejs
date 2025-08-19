import { asyncHandler } from "../utils/response.js";

export const Authorization = ({ accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (accessRoles.includes(req.user.role)) {
      return next();
    } else {
      return next(new Error("Not authorized to access this endpoint", { cause: 401 }));
    }
  });
};
