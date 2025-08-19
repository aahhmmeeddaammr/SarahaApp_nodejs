import EventEmitter from "node:events";
import { sendConfirmationEmail, sendOTPEmail } from "./EmailSender.js";
export const eventEmitter = new EventEmitter();
eventEmitter.on("sendConfirmationEmail", sendConfirmationEmail);
eventEmitter.on("sendOtpEmail", sendOTPEmail);
