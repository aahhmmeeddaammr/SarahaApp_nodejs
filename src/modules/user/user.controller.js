import { Router } from "express";
import * as userService from "./user.service.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";

const router = Router();
router.get("/", Authentication(), userService.getProfile);
router.get("/profile/:userId", userService.getProfileById);
router.get("/refresh-token", Authentication({ tokenType: tokenTypeEnum.refresh }), userService.refreshAccessToken);
router.patch("/update-password", Authentication(), userService.updateUserPassword);

export default router;
