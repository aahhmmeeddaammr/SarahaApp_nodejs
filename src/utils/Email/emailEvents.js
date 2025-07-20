import EventEmitter from "node:events";
import { sendConfirmationEmail } from "./EmailSender.js";
export const eventEmitter = new EventEmitter();
eventEmitter.on("sendConfirmationEmail", sendConfirmationEmail);
