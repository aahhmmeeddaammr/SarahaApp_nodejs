import { asyncHandler } from "../../utils/response.js";
import * as DbService from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { MessageModel } from "../../DB/models/Message.model.js";
import { decodeData, encodeData } from "../../utils/security/encode.securtiy.js";

// Shared message sending logic
const handleSendMessage = async ({ recipientId, content, fromName = null }, res, next) => {
  const checkUser = await DbService.findById({ model: UserModel, filter: recipientId });
  if (!checkUser) {
    return next(new Error("Invalid recipient ID", { cause: 404 }));
  }
  content = encodeData({ plainText: content, secret: process.env.MESSAGE_SECRET_KEY });
  const message = await DbService.create({
    model: MessageModel,
    data: [{ recipientId, content, ...(fromName && { fromName }) }],
  });

  return res.status(201).json({ message: "done", data: { message } });
};

export const guestSendMessage = asyncHandler(async (req, res, next) => {
  const { recipientId, content, fromName } = req.body;
  console.log({ recipientId, content, fromName });

  await handleSendMessage({ recipientId, content, fromName }, res, next);
});
export const getUserMessage = asyncHandler(async (req, res, next) => {
  const { _id: recipientId } = req.user;

  let userMessages = await DbService.find({
    model: MessageModel,
    filter: { recipientId },
  });

  const metadata = {
    numberOfLike: 0,
    numberOfThisWeek: 0,
    numberOfMessages: userMessages.length,
    numberOfUnreadMessages: 0,
  };

  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const updatedMessages = [];

  for (const message of userMessages) {
    const decoded = decodeData({
      cipherText: structuredClone(message.content),
      secret: process.env.MESSAGE_SECRET_KEY,
    });
    if (message.isLike) {
      metadata.numberOfLike++;
    }

    const messageTime = new Date(message.createdAt).getTime();
    if (Date.now() - messageTime < ONE_WEEK_MS) {
      metadata.numberOfThisWeek++;
    }

    if (!message.isRead) {
      metadata.numberOfUnreadMessages++;
    }
    const isRead = message.isRead;
    if (!message.isRead) {
      message.isRead = true;
      await message.save();
    }

    updatedMessages.push({
      ...message.toObject(),
      content: decoded,
      isRead,
    });
  }

  userMessages = updatedMessages;

  return res.json({
    message: "Done",
    data: { messages: userMessages, metadata },
  });
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { messageId } = req.params;
  const message = await DbService.findById({
    model: MessageModel,
    filter: messageId,
  });
  if (!message) {
    return next(new Error("in-valid message id", { cause: 404 }));
  }
  if (message.recipientId.toString() != user.id) {
    return next(new Error("You are not authorized", { cause: 401 }));
  }
  await DbService.findByIdAndDelete({
    model: MessageModel,
    Id: messageId,
  });
  return res.json({ message: "done" });
});

export const toggleLike = asyncHandler(async (req, res, next) => {
  const { user } = req;
  const { messageId } = req.body;
  const message = await DbService.findById({
    model: MessageModel,
    filter: messageId,
  });
  if (!message) {
    return next(new Error("in-valid message id", { cause: 404 }));
  }
  if (message.recipientId.toString() != user.id) {
    return next(new Error("You are not authorized", { cause: 401 }));
  }
  await DbService.updateOne({
    model: MessageModel,
    filter: { _id: messageId },
    data: {
      $set: { isLike: !message.isLike },
    },
  });
  return res.json({ message: "done" });
});
