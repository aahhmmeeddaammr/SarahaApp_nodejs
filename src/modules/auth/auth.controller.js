import { Router } from "express";
import * as authService from "./auth.service.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
const router = Router();

router.post("/singup", authService.signup);
router.post("/login", authService.signin);
router.post("/refresh-token", authService.refreshAccessToken);
router.get("/confirm-email", authService.confirmEmail);

export default router;
