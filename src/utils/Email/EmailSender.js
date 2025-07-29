import { transporter } from "./configuration.js";
import { conirmEmail } from "./Temps/confirmEmail.js";

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

export const sendConfirmationEmail = ({ toEmail, username, confirmationLink }) => {
  let html = conirmEmail({ confirmationLink, username });

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
