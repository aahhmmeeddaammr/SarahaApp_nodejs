import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  host: "smtp.gmail.com",
  auth: {
    user: "aamr24987@gmail.com",
    pass: "knhb xmqe sxhq zcnf",
  },
});
