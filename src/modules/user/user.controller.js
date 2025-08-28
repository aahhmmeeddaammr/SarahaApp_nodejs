import { Router } from "express";
import * as userService from "./user.service.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { validation } from "./../../middlewares/validation.middleware.js";
import * as validators from "./user.validation.js";
import { Authorization } from "../../middlewares/Authorization.middleware.js";
import { userEndpoints } from "./user.authorization.js";
import { cloudFileUpload } from "../../utils/multer/fileUpload.multer.js";
const router = Router();
router.get("/", Authentication(), userService.getProfile);
router.get("/profile/:userId", validation(validators.getProfileById), userService.getProfileById);
router.get("/refresh-token", Authentication({ tokenType: tokenTypeEnum.refresh }), userService.refreshAccessToken);
router.patch("/update-password", validation(validators.updateUserPassword), Authentication(), userService.updateUserPassword);
router.delete("/freeze-account{/:userId}", Authentication(), userService.freezAccount);
router.patch(
  "/restore-account/:userId",
  Authentication(),
  Authorization({ accessRoles: userEndpoints.restoreAccount }),
  userService.restoreAccount
);
router.delete(
  "/delete-account/:userId",
  Authentication(),
  Authorization({ accessRoles: userEndpoints.deleteAccount }),
  userService.deleteAccount
);
router.patch(
  "/update-account",
  Authentication(),
  validation(validators.updateProfileData),
  cloudFileUpload().single("image"),
  userService.updateAccount
);
export default router;
