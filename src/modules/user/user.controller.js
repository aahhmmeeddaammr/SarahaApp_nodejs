import { Router } from "express";
import * as userService from "./user.service.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
const router = Router();
router.get("/", Authentication, userService.getProfile);
router.patch("/update-password", Authentication, userService.updateUserPassword);

export default router;
