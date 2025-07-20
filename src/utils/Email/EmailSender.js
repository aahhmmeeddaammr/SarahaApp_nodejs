import { transporter } from "./configuration.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const sendEmail = ({ toEmail = "", subject = "", text = "" } = {}) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: toEmail,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("faild to send Email", error);
    } else {
      console.log("Email sended Sucessfully");
    }
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendConfirmationEmail = ({ toEmail, username, confirmationLink }) => {
  let html = fs.readFileSync(path.resolve(__dirname, "./Templates/confirmEmail.html"), "utf-8");

  html = html
    .replace(/{{username}}/g, username)
    .replace(/{{confirmationLink}}/g, confirmationLink)
    .replace(/{{year}}/g, "2025");

  sendEmailWithHTML({
    toEmail,
    subject: "Please confirm your email",
    html,
  });
};

const sendEmailWithHTML = ({ toEmail = "", subject = "", html = "" } = {}) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: toEmail,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("faild to send Email", error);
    } else {
      console.log("Email sended Sucessfully");
    }
  });
};
