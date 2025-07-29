import { Router } from "express";
import * as messageService from "./message.service.js";
import { Authentication } from "../../middlewares/Authentication.middleware.js";
const router = Router();
router.post("/", messageService.guestSendMessage);
router.get("/my-messages", Authentication(), messageService.getUserMessage);
router.delete("/:messageId", Authentication(), messageService.deleteMessage);
router.patch("/", Authentication(), messageService.toggleLike);
export default router;
