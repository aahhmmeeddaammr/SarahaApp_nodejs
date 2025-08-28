import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as dotenv from "dotenv";
import morgan from "morgan";
import cron from "node-cron";
import helmet from "helmet";

import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import messageController from "./modules/message/message.controller.js";

import { connectDB } from "./DB/connection.db.js";
import { globalErrorHandelar } from "./utils/response.js";
import { TokenModel } from "./DB/models/Token.model.js";

dotenv.configDotenv();

export const bootstrap = async () => {
  const app = express();
  app.use(helmet());
  app.use(morgan("dev", { format: "dev" }));
  app.use(cookieParser());
  const allowedOrigins = ["http://localhost:3000", "https://saraha-app-react-taupe.vercel.app", "https://mail.google.com"];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  const PORT = process.env.PORT || 3000;
  const host = process.env.MOOD == "dev" ? "localhost" : "0.0.0.0";

  // convert buffer data
  app.use(express.json());
  //DB
  await connectDB();
  //Routing

  app.get("/", (req, res, next) => {
    res.json({ message: "Welcome in saraha app API" });
  });

  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/message", messageController);

  app.use("{/*dummy}", (req, res, next) => {
    res.status(404).json({ message: "in-valid api method or url" });
  });

  app.use(globalErrorHandelar);

  //Start Server
  app.listen(PORT, host, () => {
    console.log(`listening on http://${host}:${PORT}`);
  });

  // Runs every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await TokenModel.deleteMany({ expiredAt: { $lte: new Date() } });
      console.log(`Cron Job: Deleted ${result.deletedCount} expired tokens`);
    } catch (error) {
      console.error("Error deleting expired tokens:", error);
    }
  });
};
