import express from "express";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import cors from "cors"
import path from "node:path";
import * as dotenv from "dotenv";
import { connectDB } from "./DB/connection.db.js";
import { globalErrorHandelar } from "./utils/response.js";
dotenv.configDotenv({ path: path.join("./src/config/.env.local") });
export const bootstrap = async () => {
  const app = express();
  app.use(cors())
  const PORT = process.env.PORT || 3000;
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

  app.use("{/*dummy}", (req, res, next) => {
    res.status(404).json({ message: "in-valid api method or url" });
  });
  
  app.use(globalErrorHandelar);

  //Start Server
  app.listen(PORT, () => {
    console.log("Server is Running on port :: 3000");
  });
};
