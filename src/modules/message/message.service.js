import { asyncHandler } from "../../utils/response.js";
import * as DbService from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { MessageModel } from "../../DB/models/Message.model.js";
export const gestSendMessage = asyncHandler(async (req, resizeBy, next) => {
  const { recipientId, content } = req.body;
  const checkUser = DbService.findById({ model: UserModel, filter: recipientId });
  if (!checkUser) {
    return next(new Error("in-valid recipient id", { cause: 404 }));
  }
  const message = DbService.create({ model: MessageModel, data: [{ recipientId, content }] });
  return res.status(201).json({ message: "done", data: { message } });
});
