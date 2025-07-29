import { Router } from "express";
import * as authService from "./auth.service.js";
const router = Router();

router.post("/singup", authService.signup);
router.post("/singup/gmail", authService.signupWithGmail);
router.post("/login", authService.signin);
router.get("/confirm-email", authService.confirmEmail);

export default router;
