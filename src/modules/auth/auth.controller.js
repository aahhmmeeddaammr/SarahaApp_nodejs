import { Router } from "express";
import * as authService from "./auth.service.js";
import * as validators from "./auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
const router = Router();

router.post("/singup", validation(validators.signupSchema), authService.signup);
router.post("/singup/gmail", authService.signupWithGmail);
router.post("/login", validation(validators.signinSchema), authService.signin);
router.get("/confirm-email", authService.confirmEmail);
router.post("/forget-password", validation(validators.forgetPassword), authService.forgetPassword);
router.post("/verify-otp", validation(validators.verifyResetCode), authService.verifyResetCode);
router.patch("/reset-password", authService.resetPassword);
router.delete("/logout", Authentication(), authService.logout);
export default router;
